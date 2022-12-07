import {button, label} from './header';

const out = {
  button: button,
  filename: label,
  label: label,
} as const;

export type FenceOption = keyof typeof out;
export type FenceOptionFunction = typeof out[FenceOption];

export function isFenceOption(opt: string): opt is FenceOption {
  return opt in out;
}

export default out;
