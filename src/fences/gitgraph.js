'use strict';

import * as d3 from 'd3';
import seedrandom from 'seedrandom';

const DEFAULT_CONFIG = {
  'show_ids': false,
  'show_hashes': true,
  'hash_seed': null,
  'hash_length': 6,
  'columns': 8,
  'column_width': 100,
  'row_height': 100
}

function createHash(length = DEFAULT_CONFIG.hash_length, seed = null) {
  if (seed !== null) seedHash(seed);
  return Math.floor(Math.random() * (16 ** length)).toString(16);
}

function seedHash(seed) {
  seedrandom(seed, {
    global: true
  });
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
    if (data.config.hash_seed !== null) _seedHash(data.config.hash_seed);
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
          } else if (x === '|') {
            continue;
          } else if (/^[A-Za-z]+$/.test(x)) {
            sources.push(gg.nodes.findIndex(d => d.id === x));
            break;
          }
          break;
        }
        gg.links = gg.links.concat(sources.map(d => ({
          source: d,
          target: gg.nodes.length - 1
        })));
      });
    });
    return gg;
  }
  return layout;
}

export default function render(dataString, configString) {
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

  // Perform the visualisation, using the values in the layout
  const W = 960,
    H = 300;
  let x = d3.scaleLinear().domain([-0.5, 7.5]).range([0, W]);
  let y = d3.scaleLinear().domain([-0.5, 2.5]).range([H, 0]);

  let svg = d3.select('#gitgraph').insert('svg').attr("width", W).attr("height", H);
  svg.append('rect').attr("width", "100%").attr("height", "100%").attr("fill", "floralwhite");

  svg.selectAll('circle').data(ggData.nodes).enter().append('circle').style("fill", "coral").attr("cx", d => x(d.x)).attr("cy", d => y(d.y)).attr("r", 20);
}
