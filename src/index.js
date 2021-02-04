'use strict';

import md from 'markdown-it';
import yaml from 'yaml';

import fences from './fences/all';
import fenceOptions from './fence_options/all';
import languages from './languages/all';

function extractFenceOptions(infoString) {
  const options = infoString.replace(/^[^{]*/, '');
  return options ? yaml.parse(options) : {};
}

export default function thoughtdown(options) {
  const r = md(options).use(require('markdown-it-highlightjs'), {
    register: languages,
  });

  r.renderer.rules_default = Object.assign({}, r.renderer.rules);
  r.renderer.rules.code_inline = function(tokens, idx, options, env, slf) {
    return slf.rules_default
        .code_inline(tokens, idx, options, env, slf)
        .replace(/^<code/, '<code class="hljs hljs-inline language-none"');
  };
  r.renderer.rules.fence = function(tokens, idx, options, env, slf) {
    // Get output for our fence (first check if there's a custom fence,
    // otherwise defer to the default markdown-it rendering process)
    const opts = extractFenceOptions(tokens[idx].info);
    let out = undefined;
    Object.entries(fences).forEach(([k, v]) => {
      const fenceName = tokens[idx].info.match(/^[^{^ ]*/).toString();
      if (fenceName && fenceName === k) {
        out = v(tokens[idx].content, opts);
      }
    });
    if (typeof out === 'undefined') {
      out = slf.rules_default.fence(tokens, idx, options, env, slf);
    }

    // Give fence options a chance to modify the output before returning
    Object.entries(opts).forEach(([ok, ov]) => {
      Object.entries(fenceOptions).forEach(([k, v]) => {
        if (k === ok) out = v(out, ok, ov);
      });
    });
    return out;
  };

  return r;
}
