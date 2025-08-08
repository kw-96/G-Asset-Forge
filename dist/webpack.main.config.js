"use strict";
const path = require('path');
const webpack = require('webpack');
require('dotenv').config({
    path: path.resolve(__dirname, `.env.${process.env.NODE_ENV || 'development'}`)
});
module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development' || process.env.NODE_ENV === 'development';
    return {
        mode: isDevelopment ? 'development' : 'production',
        target: 'electron-main',
        entry: {
            main: './src/main/main.ts',
            preload: './src/main/preload.ts'
        },
        output: {
            path: path.resolve(__dirname, 'dist/main'),
            filename: '[name].js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                '@': path.resolve(__dirname, 'src')
            },
            fallback: {
                "global": require.resolve("global/window")
            }
        },
        plugins: [
            new webpack.ProvidePlugin({
                global: 'global/window'
            })
        ],
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        node: {
            __dirname: false,
            __filename: false
        },
        externals: {
            'sharp': 'commonjs sharp',
            'fs-extra': 'commonjs fs-extra'
        },
        // 开发环境优化配置
        ...(isDevelopment ? {
            devtool: 'inline-source-map',
            optimization: {
                minimize: false
            }
        } : {
            devtool: false,
            optimization: {
                minimize: true
            }
        })
    };
};
//# sourceMappingURL=webpack.main.config.js.map