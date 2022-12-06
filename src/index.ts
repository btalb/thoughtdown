import md from 'markdown-it';
import yaml from 'yaml';
import {parse} from 'node-html-parser';

import fences from './fences';
import fenceOptions, {isFenceOption} from './fence_options';
import languages from './languages';

function extractFenceOptions(info: string) {
  const options = info.replace(/^[^{]*/, '');
  return options ? yaml.parse(options) : {};
}

export default function (options?: md.Options): md {
  const m = md(options).use(require('markdown-it-highlightjs'), {
    register: languages,
  });

  const rules_default = Object.assign({}, m.renderer.rules);
  m.renderer.rules.code_inline = function (tokens, idx, options, env, slf) {
    return rules_default
      .code_inline(tokens, idx, options, env, slf)
      .replace(/^<code/, '<code class="hljs hljs-inline language-none"');
  };
  m.renderer.rules.fence = function (tokens, idx, options, env, slf) {
    const opts = extractFenceOptions(tokens[idx].info);

    // Use custom fences if available, otherwise fallback to default
    const fenceName = tokens[idx].info.match(/^[^{^ ]*/).toString();
    let out =
      fenceName in fences
        ? fences[fenceName](parse(tokens[idx].content), opts)
        : parse(rules_default.fence(tokens, idx, options, env, slf));

    // Give fence options a chance to modify output before returning
    Object.entries(opts).forEach(([ok, ov]) => {
      if (isFenceOption(ok)) out = fenceOptions[ok](out, ok, ov.toString());
    });
    return out.toString();
  };

  return m;
}
