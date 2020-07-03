'use strict';

import MarkdownIt from 'markdown-it';

export default class ThoughtDown extends MarkdownIt {

  constructor(options) {
    super(options);
    this.renderer.rules.fence = function(tokens, idx, options, env, renderer) {
      console.log(tokens[idx]);
      return '<b>PRETTY GRAPH</b>';
    }
  }
}

export function printMsg() {
  console.log("This is my message from ThoughtDown");
}

new ThoughtDown()
