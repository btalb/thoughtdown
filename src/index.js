'use strict';

import MarkdownIt from 'markdown-it';

import gitgraph from './fences/gitgraph';

export default class ThoughtDown extends MarkdownIt {

  constructor(options) {
    super(options);

    this.renderer.default_rules = Object.assign({}, this.renderer.rules);

    let extractSettings = function(infoString) {
      let ms = infoString.match(/\{(.*)\}/);
      return ms ? ms[1] : null;
    }
    this.renderer.rules.fence = function(tokens, idx, options, env, renderer) {
      if (tokens[idx].info.startsWith("gitgraph")) {
        return gitgraph(tokens[idx].content, extractSettings(tokens[idx].info));
      } else {
        return renderer.default_rules.fence(tokens, idx, options, env, renderer);
      }
    }
  }

}
