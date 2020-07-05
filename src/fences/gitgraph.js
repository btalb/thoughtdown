'use strict';

import * as d3 from 'd3';
import seedrandom from 'seedrandom';
import yaml from 'yaml';

const DEFAULT_CONFIG = {
  'show_name': false, // Shows name instead of the hashes
  'show_hash': true,
  'hash_seed': null,
  'hash_length': 7,

  'min_columns': 8,
  'min_rows': 0,

  'label_buffer': 80,
  'label_height': 30,
  'label_spacing': 50,
  'label_width': 60,

  'width': 960,
  'height': 300,

  'margin_left': 0,
  'margin_right': 0,
  'margin_top': 0,
  'margin_bottom': 0
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
        let x = n.labels.length - 1;
        x = d3.scaleLinear().domain([0, x]).range([-x / 2, x / 2]);
        n.labels.forEach(function(l, i) {
          gg.labels.push({
            type: l.type ? l.type : 'plain',
            text: l.text,
            x: n.x,
            y: n.y,
            d: n.y === 0 ? -1 : 1,
            i: i
          })
        });
      }
    });
    return gg;
  }
  return layout;
}

export default function generateHtml(dataString, configString) {
  // Convert the data to JSON, & fill in any missing settings with defaults
  let data = Object.assign({}, /graph/.test(dataString) ? yaml.parse(dataString) : {
    graph: dataString.trim()
  }, {
    config: Object.assign({}, DEFAULT_CONFIG, (configString) ? yaml.parse(configString.replace(', ', '\n')) : {})
  });
  if (!data.hasOwnProperty('commits')) data.commits = {};

  // Use the data to create a layout containing all information needed for
  // visualisation
  let gg = gitGraphLayout();
  let ggData = gg(data);

  // Construct the visualisation, using the values in the layout
  let x = d3.scaleLinear().domain(getLimits(ggData.nodes, n => n.x)).range([data.config.margin_left, data.config.width - data.config.margin_right]);
  let y = d3.scaleLinear().domain(getLimits(ggData.nodes, n => n.y)).range([data.config.height - data.config.margin_bottom, data.config.margin_top]);

  let link = function(d) {
    let p = d3.path();
    p.moveTo(x(d.source.x), y(d.source.y));
    let c = d.source.x;
    let r = d.source.y;
    while (c++ < d.target.x) {
      if (r !== d.target.y) {
        let dy = delta => d.target.y >= r ? delta : -1 * delta;
        p.lineTo(x(c - 0.75), y(r));
        p.quadraticCurveTo(x(c - 0.5), y(r), x(c - 0.5), y(r + dy(0.5)));
        p.lineTo(x(c - 0.5), y(d.target.y - dy(0.5)));
        p.quadraticCurveTo(x(c - 0.5), y(d.target.y), x(c - 0.25), y(d.target.y));
        p.lineTo(x(c), y(d.target.y));
        r = d.target.y;
      } else {
        p.lineTo(x(c), y(r));
      }
    }
    return p.toString();
  };

  let label = function(l, h) {
    let p = d3.path();
    p.moveTo(0, 0);
    p.lineTo(x(0.25), 0);
    p.lineTo(x(0.25), -h * l.d);
    p.lineTo(-x(0.25), -h * l.d);
    p.lineTo(-x(0.25), 0);
    p.closePath();
    return p.toString();
  }

  let container = d3.create('div');
  let svg = container.insert('svg').attr("width", data.config.width).attr("height", data.config.height);
  svg.append('rect').attr("width", "100%").attr("height", "100%").attr("fill", "floralwhite");

  svg.selectAll('gitgraph-link').data(ggData.links).enter().append('path').classed('gitgraph-link', true).attr("fill", "none").attr("stroke", "coral").attr("stroke-width", "5").attr("d", link);
  svg.selectAll('gitgraph-node').data(ggData.nodes).enter().append('circle').classed('gitgraph-node', true).style("fill", "coral").attr("cx", d => x(d.x)).attr("cy", d => y(d.y)).attr("r", 20);
  if (data.config.show_hash || data.config.show_name) {
    svg.selectAll('gitgraph-node-label').data(ggData.nodes).enter().append('text').classed('gitgraph-node-label', true).attr("x", d => x(d.x)).attr("y", d => y(d.y + 0.25)).attr("text-anchor", "middle").attr("font-weight", "bold").attr("fill", "coral").text(d => data.config.show_name ? d.name : d.hash);
  }
  if (ggData.labels && ggData.labels.length) {
    let gs = svg.selectAll('gitgraph-label').data(ggData.labels).enter().append('g').classed('gitgraph-label', true).attr("transform", d => "translate(" + x(d.x) + "," + y(d.y) + ")");
    gs.append('circle').style("fill", "black").attr("r", 5);
    gs.append('path').attr("fill", "none").attr("stroke", "black").attr("stroke-width", "1").attr("d", d => label(d, data.config.label_height));
    gs.append('text').text(d => d.text);
  }

  // Return the HTML text
  return container.node().innerHTML;
}
