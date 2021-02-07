const HEADER_CLASS = 'td-header';
const HEADER_OPEN = `<div class="${HEADER_CLASS}">`;
const HEADER_CLOSE = '</div>';

const REGEX_BEGIN = new RegExp(`(${HEADER_OPEN})`);
const REGEX_END = new RegExp(`(${HEADER_OPEN}.*?)(${HEADER_CLOSE}<pre>)`);

const BUTTON_TEXT = {};

function addHeader(output) {
  return output.includes(HEADER_OPEN) ?
    output :
    `${HEADER_OPEN}${HEADER_CLOSE}${output}`;
}

function addHeaderContent(output, content, begin = true) {
  return addHeader(output).replace(
    begin ? REGEX_BEGIN : REGEX_END,
    `$1${content}${begin ? '' : '$2'}`
  );
}

function idToString(id) {
  return id.replace(/(^[a-z])/, (m) => m.toUpperCase()).replace(/-/g, ' ');
}

export function button(output, option, optionValue) {
  const v = optionValue ? optionValue : option;
  return addHeaderContent(
      output,
      `<button class="td-${v}"><span>${
      v in BUTTON_TEXT ? BUTTON_TEXT[v] : idToString(v)
      }</span></button>`,
      false
  );
}

export function label(output, option, optionValue) {
  return addHeaderContent(
      output,
      `<span class="td-${option}">${optionValue}</span>`
  );
}
