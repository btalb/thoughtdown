'use strict';

import md from 'markdown-it';

import gitgraph from './fences/gitgraph';
import systemdiagram from './fences/systemdiagram';

import l from './languages/terminal';

export default function thoughtdown(options) {
  const r = md(options).use(require('markdown-it-highlightjs'), {
    register: {terminal: l},
  });

  r.renderer.rules_default = Object.assign({}, r.renderer.rules);
  r.renderer.rules.fence = function(tokens, idx, options, env, renderer) {
    // TODO logic handling custom fences...
    return renderer.rules_default.fence(tokens, idx, options, env, renderer);
  };

  return r;
}

// export default class ThoughtDown extends MarkdownIt {
//   constructor(options) {
//     super(options);

//     this.renderer.default_rules = Object.assign({}, this.renderer.rules);

//     const extractSettings = function (infoString) {
//       const ms = infoString.match(/\{(.*)\}/);
//       return ms ? ms[1] : null;
//     };
//     this.renderer.rules.fence = function (tokens, idx, options, env, renderer) {
//       if (tokens[idx].info.startsWith('gitgraph')) {
//         return gitgraph(tokens[idx].content, extractSettings(tokens[idx].info));
//       } else if (tokens[idx].info.startswith('systemdiagram')) {
//         return systemdiagram(
//           token[idx].content,
//           extractSettings(tokens[idx.info])
//         );
//       } else {
//         return renderer.default_rules.fence(
//           tokens,
//           idx,
//           options,
//           env,
//           renderer
//         );
//       }
//     };
//   }
// }
