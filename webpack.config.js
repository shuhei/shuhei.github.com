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
};
