import {Configuration} from 'webpack';

const config: Configuration = {
  entry: './src/index.ts',
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
  },
};

export default config;
