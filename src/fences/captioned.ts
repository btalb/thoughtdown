import Renderer from 'markdown-it/lib/renderer';
import {FenceOptions} from '../interfaces';

export default function caption(
  input: Element,
  options: FenceOptions,
  renderer: Renderer
) {
  console.log(input);
  return input;
}
