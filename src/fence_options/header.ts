import {HTMLElement} from 'node-html-parser';

const CODE_OPEN = `<code class="hljs`;
const CODE_CLOSE = `</code>`;

const HEADER_CLASS = 'td-header';
const HEADER_OPEN = `<div class="${HEADER_CLASS}`;
const HEADER_CLOSE = '</div>';

const REGEX_BEGIN = new RegExp(`(${HEADER_OPEN})`);
const REGEX_END = new RegExp(`(${HEADER_OPEN}.*?)(${HEADER_CLOSE}<code)`);

function addHeader(input: HTMLElement) {
  return input;
  // return output.includes(HEADER_OPEN)
  //   ? output
  //   : output.replace(/^(<pre>)/, `$1${HEADER_OPEN}${HEADER_CLOSE}`);
}

function addHeaderContent(input: HTMLElement, content: string, begin = true) {
  return input;
  // return addHeader(output).replace(
  //   begin ? REGEX_BEGIN : REGEX_END,
  //   `$1${content}${begin ? '' : '$2'}`
  // );
}

function addToCode(output: string, content: string, begin = true) {}

function idToString(id: string) {
  return id.replace(/(^[a-z])/, m => m.toUpperCase()).replace(/-/g, ' ');
}

export function button(
  input: HTMLElement,
  option: string,
  optionValue?: string
) {
  const v = optionValue ? optionValue : option;
  return addHeaderContent(
    input,
    `<button class="td-${v}"><span></span></button>`,
    false
  );
}

export function label(
  input: HTMLElement,
  option: string,
  optionValue?: string
) {
  return addHeaderContent(
    input,
    `<span class="td-${option}">${optionValue}</span>`
  );
}
