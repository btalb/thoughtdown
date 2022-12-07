import MarkdownIt from 'markdown-it';
import {FenceOptions} from '../interfaces';

export default function caption(
  input: string,
  options: FenceOptions,
  renderer: MarkdownIt
) {
  const caption = input.trim().split('\n').pop();
  const content = renderer.render(input.replace(caption, '').trim());

  const captionHTML = `<div class="td-caption">${caption}</div>`;
  return `<div class="td-captioned">${
    typeof options.begin !== 'undefined'
      ? `${captionHTML}${content}`
      : `${content}${captionHTML}`
  }</div>`;
}
