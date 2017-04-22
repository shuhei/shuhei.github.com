const { DefinePlugin, optimize } = require('webpack');

const { DedupePlugin, UglifyJsPlugin } = optimize;

module.exports = {
  context: __dirname,
  entry: [
    'whatwg-fetch',
    './source/_js/index.js',
  ],
  output: {
    path: __dirname + '/public/js',
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new UglifyJsPlugin({
      sourceMap: true,
    }),
  ],
};
