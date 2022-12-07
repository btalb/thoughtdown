const CODE_OPEN = `<code class="hljs`;
const CODE_CLOSE = `</code>`;

const HEADER_CLASS = 'td-header';
const HEADER_EMPTY = `<div class="${HEADER_CLASS}"></div>`;

function addHeader(input: Element) {
  if (input.querySelector(`.${HEADER_CLASS}`) === null)
    input.insertAdjacentHTML('afterbegin', HEADER_EMPTY);
  return input;
}

function addHeaderContent(input: Element, content: string, begin = true) {
  addHeader(input)
    .querySelector('.td-header')
    .insertAdjacentHTML(begin ? 'afterbegin' : 'beforeend', content);
  return input;
}

function addToCode(input: Element, content: string, begin = true) {
  input
    .querySelector('code')
    .insertAdjacentHTML(begin ? 'afterbegin' : 'beforeend', content);
  return input;
}

function idToString(id: string) {
  return id.replace(/(^[a-z])/, m => m.toUpperCase()).replace(/-/g, ' ');
}

export function button(input: Element, option: string, optionValue?: string) {
  const v = optionValue ? optionValue : option;
  return addHeaderContent(
    input,
    `<button class="td-${v}"><span></span></button>`,
    false
  );
}

export function label(input: Element, option: string, optionValue?: string) {
  return addToCode(input, `<span class="td-${option}">${optionValue}</span>`);
}
