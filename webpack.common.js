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
};
