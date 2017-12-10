const merge = require('webpack-merge');
const { DefinePlugin, optimize } = require('webpack');
const { DedupePlugin, UglifyJsPlugin } = optimize;

const common = require('./webpack.common');

module.exports = merge(common, {
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
});
