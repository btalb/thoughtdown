// @ts-ignore
import NpmDts from 'npm-dts-webpack-plugin';
import {Configuration} from 'webpack';

const config: Configuration = {
  entry: './src/index.ts',
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            onlyCompileBundledFiles: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      bufferutil: false,
      canvas: false,
      'utf-8-validate': false,
    },
  },
  output: {
    filename: 'bundle.js',
    library: {
      type: 'commonjs2',
    },
  },
  plugins: [new NpmDts({output: './dist/bundle.d.ts'})],
  target: 'node',
};

export default config;
