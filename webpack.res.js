const path = require('path');

module.exports = {
  entry: './src/app/modules/courses/res/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'res.js',
    path: path.resolve(__dirname, 'dist'),
  },
};