const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const isProd = process.env.NODE_ENV === 'production';
console.log('webpack isProd', isProd);
module.exports = {
    devtool: isProd ?
        false : '#cheap-module-source-map',
    output: {
        path: `${ process.cwd() }/dist`,
        publicPath: '/',
        filename: '[name].[chunkhash].js'
    },
    resolve: {
        alias: {
          '@': `${ process.cwd() }/src`
        }
    },
    module: {
        // 不解析 es6-promise 库的依赖 优化打包速率
        noParse: /es6-promise\.js$/,
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    compilerOptions: {
                        // 不保留空格
                        preserveWhitespace: false
                    },
                    hotReload: isProd ? false : true
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /png|jpg|jpeg|gif|svg/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: '[name].[ext]?[hash]'
                }
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: isProd ?
                    ExtractTextPlugin.extract({
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    minimize: true
                                }
                            },
                            'sass-loader'
                        ],
                        fallback: 'vue-style-loader'
                    }) :
                    ['vue-style-loader', 'css-loader', 'sass-loader']
            }
        ]
    },
    // 创建超过250kb的资源 没有提示警告或错误显示。
    performance: {
        hints: false
    },
    plugins: isProd
    ? [
        new VueLoaderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
          compress: { warnings: false }
        }),
        new ExtractTextPlugin({
          filename: 'common.[chunkhash].css'
        }),
        new FriendlyErrorsPlugin(),
        // webpack3 通过 DefinePlugin 更改 vue.js 为生产模式
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
      ]
    : [
        new VueLoaderPlugin(),
        new FriendlyErrorsPlugin(),
      ]
}