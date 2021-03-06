import {readFileSync} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

import td from '../dist/index.js';
const renderer = td();

import prettier from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const input = readFileSync(path.resolve(__dirname, './debug.md'), {
  encoding: 'utf8',
});

const out = `<body>${renderer.render(input)}</body>`;

console.log(`INPUT MARKDOWN\n\n${input}`);
console.log(`RENDERED MARKDOWN:\n\n${prettier.format(out)}`);
// console.log(`RENDERED MARKDOWN:\n\n${out}`);
