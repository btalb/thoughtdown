import md from 'markdown-it';

import fenceOptions from './fence_options';
import languages from './languages';

export default function (options: md.Options) {
  const m = md(options).use(require('markdown-it-highlightjs'), {
    register: languages,
  });
  return m;
}
