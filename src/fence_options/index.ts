import {HTMLElement} from 'node-html-parser';

import {button, label} from './header';

const out = {
  button: button,
  filename: label,
  label: label,
} as const;

type FenceOption = keyof typeof out;
type FenceFunction = typeof out[FenceOption];

export function isFenceOption(opt: string): opt is FenceOption {
  return opt in out;
}

export default out;
