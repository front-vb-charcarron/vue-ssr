const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(baseConfig, {
    entry: `${ process.cwd() }/src/entry-client.js`,
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            minChunks: Infinity
        }),
        new VueSSRClientPlugin(),
    ]
});