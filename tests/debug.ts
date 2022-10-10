import {readFileSync} from 'fs';
import path from 'path';
import prettier from 'prettier';
import {fileURLToPath} from 'url';

import td from 'thoughtdown';

const renderer = td();

const input = readFileSync(path.resolve(__dirname, './debug.md'), {
  encoding: 'utf8',
});
console.log(input);

const out = `<body>${renderer.render(input)}</body>`;

console.log(`INPUT MARKDOWN\n\n${input}`);
console.log(`RENDERED MARKDOWN:\n\n${prettier.format(out, {parser: 'babel'})}`);
