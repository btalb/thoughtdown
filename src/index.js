'use strict';

import MarkdownIt from 'markdown-it';

import gitgraph from './fences/gitgraph';

export default class ThoughtDown extends MarkdownIt {

  constructor(options) {
    super(options);

    this.renderer.default_rules = Object.assign({}, this.renderer.rules);

    this.renderer.rules.fence = function(tokens, idx, options, env, renderer) {
      if (tokens[idx].info === "gitgraph") {
        return gitgraph(tokens[idx].content);
      } else {
        return renderer.default_rules.fence(tokens, idx, options, env, renderer);
      }
    }
  }
}
