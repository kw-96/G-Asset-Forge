"use strict";
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { commonConfig, merge } = require('./webpack.config');
const devConfig = {
    mode: 'development',
    target: 'electron-renderer',
    node: {
        __dirname: false,
        __filename: false
    },
    entry: './src/renderer/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist/renderer'),
        filename: '[name].js',
        publicPath: './',
        clean: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/renderer/index.html',
            filename: 'index.html',
            inject: true
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.IS_ELECTRON': 'true'
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser.js',
            Buffer: ['buffer', 'Buffer'],
            global: 'global/window'
        })
    ],
    devtool: 'eval-source-map',
    stats: 'minimal'
};
module.exports = merge(commonConfig, devConfig);
//# sourceMappingURL=webpack.renderer.dev.config.js.map