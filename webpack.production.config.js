const { DefinePlugin, optimize } = require('webpack');

const { DedupePlugin, UglifyJsPlugin } = optimize;

module.exports = {
  entry: [
    'whatwg-fetch',
    './source/_js/index.js',
  ],
  output: {
    path: './public/js',
    filename: 'index.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new DedupePlugin(),
    new UglifyJsPlugin(),
  ],
};
