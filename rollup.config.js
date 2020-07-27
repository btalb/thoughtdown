import babel from '@rollup/plugin-babel';

import p from './package.json';

export default {
  input: './src/index.js',
  output: {
    file: './dist/index.cjs',
    format: 'cjs',
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
    }),
  ],
  external: Object.keys(p.dependencies || {}),
};
