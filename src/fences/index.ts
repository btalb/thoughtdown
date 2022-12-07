import caption from './captioned';
// import gitgraph from './gitgraph';
// import systemdiagram from './systemdiagram';

const out = {
  captioned: caption,
} as const;

export type FenceType = keyof typeof out;
export type FenceTypeFunction = typeof out[FenceType];

export function isFenceType(name: string): name is FenceType {
  return name in out;
}

export default out;
