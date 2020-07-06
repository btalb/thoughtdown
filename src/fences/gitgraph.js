'use strict';

import * as d3 from 'd3';
import seedrandom from 'seedrandom';
import yaml from 'yaml';

const DEFAULT_CONFIG = {
  'show_head': true,
  'show_name': false, // Shows name instead of the hashes
  'show_hash': true,

  'hash_seed': null,
  'hash_length': 7,

  'min_columns': 8,
  'min_rows': 0,

  'label_buffer': 60,
  'label_height': 30,
  'label_spacing': 120,
  'label_width': 90,

  'width': 960,
  'height': 300,

  'margin_left': 0,
  'margin_right': 0,
  'margin_top': 0,
  'margin_bottom': 0,

  'node_radius': 20,

  'color_background': "none",
  'color_branch': "lightcoral",
  'color_graph': "black",
  'color_head': "khaki",
  'color_tag': "lightgreen",

  'font_size': "1.5em"
}

function createHash(length = DEFAULT_CONFIG.hash_length, seed = null) {
  if (seed !== null) seedHash(seed);
  return Math.floor(16 ** (length - 1) + Math.random() * (16 ** length - 16 ** (length - 1))).toString(16);
}

function seedHash(seed) {
  seedrandom(seed, {
    global: true
  });
}

function getLimits(nodes, nodes_accessor, min_max = 0) {
  // Calculate graph based limits
  let ls = d3.extent(nodes, nodes_accessor);
  if (ls[1] < min_max - 1) ls[1] = min_max - 1;
  return [-0.5, 0.5].map((x, i) => x + ls[i]);
}

function gitGraphLayout() {
  function layout(data) {
    // Instantiate a git graph layout (ordered list of nodes corresponding to
    // commits, & list of links between commits based on parents field)
    let gg = {
      nodes: [],
      links: []
    };

    // Parse the graph string, populating the layout as we go
    // SYNTAX RULES:
    // - Each line is a list of 'words'
    // - '[A-z]*' is a commit name
    // - '|' means links to next commit in this column
    // - '\' means branch from the first named commit to the RIGHT
    // - '/' means merge into first named commit to the RIGHT
    // - '_' means is an explicit space for an empty column
    if (data.config.hash_seed !== null) seedHash(data.config.hash_seed);
    let parsedGraph = data.graph.split('\n').map(d => d.trim().split(' '))
    parsedGraph.forEach(function(l, ln) {
      l.forEach(function(c, cn) {
        // Skip if it's not a node
        if (!/^[A-Za-z]+$/.test(c)) return;

        // Add a new node, filling in all layout data & data from input
        gg.nodes.push(Object.assign({}, {
          id: c,
          name: c,
          hash: createHash(data.config.hash_length),
          head: false,
          color: data.config.color_graph,
          x: gg.nodes.length,
          y: cn
        }, data.commits.hasOwnProperty(c) ? data.commits[c] : {}));

        // Look up for any links, following each until it resolves to a source
        // commit
        let i = ln;
        let sources = [];
        if (i === 0) return;
        while (--i >= 0) {
          let x = parsedGraph[i][cn];
          if (typeof x === 'undefined') break;
          let ii = cn;
          while (++ii < parsedGraph[i].length) {
            let xx = parsedGraph[i][ii];
            if (xx == '/') {
              let iii = i;
              while (parsedGraph[--iii][ii] == '|');
              if (/^[A-Za-z]+$/.test(parsedGraph[iii][ii])) {
                sources.push(gg.nodes.findIndex(d => d.id === parsedGraph[iii][ii]));
              }
            }
          }
          if (x === '\\') {
            x = parsedGraph[i - 1][parsedGraph[i - 1].length - 1];
            sources.push(gg.nodes.findIndex(d => d.id === x));
            break;
          } else if (x === '|' || x === '/') {
            continue;
          } else if (/^[A-Za-z]+$/.test(x)) {
            sources.push(gg.nodes.findIndex(d => d.id === x));
            break;
          }
          break;
        }
        gg.links = gg.links.concat(sources.map(d => ({
          source: gg.nodes[d],
          target: gg.nodes[gg.nodes.length - 1]
        })));
      });
    });

    // Populate layout data for labels
    let rowLimits = d3.extent(gg.nodes, n => n.y);
    gg.labels = [];
    gg.nodes.forEach(function(n) {
      if (n.hasOwnProperty('labels')) {
        let L = n.labels.length > 1 ? n.labels.length - 1 : 1;
        let D = data.config.label_spacing;
        x = d3.scaleLinear().domain([0, L]).range([-L / 2 * D, L / 2 * D]);
        n.labels.forEach(function(l, i) {
          gg.labels.push({
            type: l.type ? l.type : 'plain',
            text: l.text,
            ref_x: n.x,
            ref_y: n.y,
            dx: x(i),
            dy: n.y === 0 ? data.config.label_buffer : -data.config.label_buffer,
            d: n.y === 0 ? -1 : 1,
          })
        });
      }
    });
    gg.links.sort(function(a, b) {
      return a.source.y < b.source.y || a.target.y < b.target.y ? 1 : -1;
    });
    console.log(gg);
    return gg;
  }
  return layout;
}

export default function generateHtml(dataString, configString) {
  // Convert the data to JSON, & fill in any missing settings with defaults
  let data = Object.assign({}, /graph/.test(dataString) ? yaml.parse(dataString) : {
    graph: dataString.trim()
  }, {
    config: Object.assign({}, DEFAULT_CONFIG, (configString) ? yaml.parse(configString.replace(/, /g, '\n')) : {})
  });
  if (!data.hasOwnProperty('commits')) data.commits = {};

  // Use the data to create a layout containing all information needed for
  // visualisation
  let gg = gitGraphLayout();
  let ggData = gg(data);

  // Construct the visualisation, using the values in the layout
  let x = d3.scaleLinear().domain(getLimits(ggData.nodes, n => n.x)).range([data.config.margin_left, data.config.width - data.config.margin_right]);
  let y = d3.scaleLinear().domain(getLimits(ggData.nodes, n => n.y)).range([data.config.height - data.config.margin_bottom, data.config.margin_top]);

  let graphLink = function(d) {
    let p = d3.path();
    p.moveTo(x(d.source.x) + data.config.node_radius, y(d.source.y));
    let c = d.source.x;
    let r = d.source.y;
    while (c++ < d.target.x) {
      if (r !== d.target.y) {
        let dy = delta => d.target.y >= r ? delta : -1 * delta;
        p.lineTo(x(c - 0.75), y(r));
        p.quadraticCurveTo(x(c - 0.5), y(r), x(c - 0.5), y(r + dy(0.5)));
        p.lineTo(x(c - 0.5), y(d.target.y - dy(0.5)));
        p.quadraticCurveTo(x(c - 0.5), y(d.target.y), x(c - 0.25), y(d.target.y));
        p.lineTo(x(c) - data.config.node_radius, y(d.target.y));
        r = d.target.y;
      } else {
        p.lineTo(x(c) - data.config.node_radius, y(r));
      }
    }
    return p.toString();
  };

  let graphLinkColor = function(d) {
    return d.source.y > d.target.y ? d.source.color : d.target.color;
  }

  let label = function(l) {
    let p = d3.path(),
      w = data.config.label_width,
      h = data.config.label_height,
      o = 10;
    p.moveTo(0, 0);
    switch (l.type) {
      case 'branch':
        p.lineTo(w / 2, 0);
        p.lineTo(w / 2, -h * l.d);
        p.lineTo(-w / 2, -h * l.d);
        p.lineTo(-w / 2, 0);
        break;
      case 'head':
        p.lineTo(w / 2 - o, 0);
        p.lineTo(w / 2, -h / 2 * l.d);
        p.lineTo(w / 2 - o, -h * l.d);
        p.lineTo(-w / 2 + o, -h * l.d);
        p.lineTo(-w / 2, -h / 2 * l.d);
        p.lineTo(-w / 2 + o, 0);
        break;
      default:
        let flip = l.dy > 0;
        p.lineTo(w / 2 - (flip ? 0 : o), 0);
        p.lineTo(w / 2 - (flip ? o : 0), -h * l.d);
        p.lineTo(-w / 2 + (flip ? 0 : o), -h * l.d);
        p.lineTo(-w / 2 + (flip ? o : 0), 0);
        break;
    }
    p.closePath();
    return p.toString();
  }

  let labelLink = function(l) {
    let p = d3.path();
    if (l.type === 'head') {
      p.moveTo(-data.config.label_width / 2, -data.config.label_height * l.d / 2);
      p.lineTo(-data.config.label_width / 2 - (data.config.label_spacing - data.config.label_width) + 5, -data.config.label_height * l.d / 2);
    } else {
      let side = l.dx > 0 ? -1 : 1;
      p.moveTo(0, 0);
      p.quadraticCurveTo(0, -l.dy / 2, -l.dx - side * data.config.node_radius * 1.25, -l.dy - l.d * data.config.node_radius / 2);
    }
    return p.toString();
  }

  let container = d3.create('div');
  let svg = container.insert('svg').attr("width", data.config.width).attr("height", data.config.height).attr("font-family", "monospace").attr("font-size", data.config.font_size);
  svg.append('rect').attr("width", "100%").attr("height", "100%").attr("fill", data.config.color_background);

  svg.append('svg:defs').append('svg:marker').attr('id', 'arrow').attr('markerHeight', 8).attr('markerWidth', 8).attr('markerUnits', 'strokeWidth').attr('orient', 'auto').attr('refX', 0).attr('refY', 0).attr('viewBox', '-5 -5 10 10').append('svg:path').attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z').attr('fill', 'black');

  svg.selectAll('gitgraph-link').data(ggData.links).enter().append('path').classed('gitgraph-link', true).attr("fill", "none").attr("stroke", graphLinkColor).attr("stroke-width", "5").attr("d", graphLink);
  svg.selectAll('gitgraph-node').data(ggData.nodes).enter().append('circle').classed('gitgraph-node', true).attr("fill", d => (data.config.show_head && d.head) ? "none" : d.color).attr("stroke", d => d.color).attr("stroke-width", 5).attr("cx", d => x(d.x)).attr("cy", d => y(d.y)).attr("r", data.config.node_radius);
  if (data.config.show_hash || data.config.show_name) {
    svg.selectAll('gitgraph-node-label').data(ggData.nodes).enter().append('text').classed('gitgraph-node-label', true).attr("x", d => x(d.x)).attr("y", d => y(d.y) - 1.25 * data.config.node_radius).attr("text-anchor", "middle").attr("font-weight", "bold").attr("fill", d => d.color).text(d => data.config.show_name ? d.name : d.hash);
  }
  if (ggData.labels && ggData.labels.length) {
    let gs = svg.selectAll('gitgraph-label').data(ggData.labels).enter().append('g').classed('gitgraph-label', true).attr("transform", d => "translate(" + (x(d.ref_x) + d.dx) + "," + (y(d.ref_y) + d.dy) + ")");
    gs.append('path').attr("fill", "none").attr("stroke", "black").attr("stroke-linecap", "round").attr("d", labelLink).attr('marker-end', 'url(#arrow)');
    gs.filter(d => d.type !== 'plain').append('path').attr("fill", d => data.config[`color_${d.type}`]).attr("stroke", "black").attr("stroke-width", "1").attr("d", label);
    gs.append('text').text(d => d.text).attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("y", d => -d.d * data.config.label_height / 2);
  }

  // Return the HTML text
  return container.node().innerHTML;
}
