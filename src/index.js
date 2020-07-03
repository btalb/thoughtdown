'use strict';

import MarkdownIt from 'markdown-it';

export default class ThoughtDown extends MarkdownIt {

  constructor(options) {
    super(options);

    this.renderer.default_rules = Object.assign({}, this.renderer.rules);

    this.renderer.rules.fence = function(tokens, idx, options, env, renderer) {
      console.log(tokens[idx]);
      if (tokens[idx].info === "gitgraph") {
        console.log("CUSTOM RENDERING");
        return '<b>PRETTY GRAPH</b>';
      } else {
        return renderer.default_rules.fence(tokens, idx, options, env, renderer);
      }
    }
  }
}
