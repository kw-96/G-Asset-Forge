const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { commonConfig, merge } = require('./webpack.config');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development' || process.env.NODE_ENV === 'development';
  
  const rendererConfig = {
    mode: isDevelopment ? 'development' : 'production',
    target: 'electron-renderer',
    node: {
      __dirname: false,
      __filename: false
    },
    entry: './src/renderer/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist/renderer'),
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].chunk.js',
      publicPath: isDevelopment ? 'http://localhost:3000/' : './',
      clean: true
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/renderer/index.html',
        filename: 'index.html',
        inject: true
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser.js',
        Buffer: ['buffer', 'Buffer'],
        global: 'global/window'
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
        'process.env.IS_ELECTRON': 'true',
        'global': 'globalThis'
      })
    ],
    devServer: {
      port: 3000,
      hot: true,
      liveReload: true,
      static: {
        directory: path.join(__dirname, 'dist/renderer')
      },
      client: {
        logging: 'warn',
        progress: true,
        webSocketTransport: 'ws',
        overlay: {
          errors: true,
          warnings: false
        }
      },
      devMiddleware: {
        stats: 'minimal'
      },
      historyApiFallback: true,
      headers: {
        'Content-Security-Policy': isDevelopment ? 
          "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:3000 ws://localhost:3000; style-src 'self' 'unsafe-inline' http://localhost:3000; img-src 'self' data: blob: http://localhost:3000; font-src 'self' data: http://localhost:3000; connect-src 'self' http://localhost:3000 ws://localhost:3000 wss://localhost:3000; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'" :
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
      }
    },
    
    // 环境特定配置
    ...(isDevelopment ? {
      devtool: 'eval-source-map',
      stats: 'minimal'
    } : {
      devtool: 'source-map',
      stats: 'errors-warnings',
      optimization: {
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            },
            engines: {
              test: /[\\/]src[\\/]renderer[\\/]engines[\\/]/,
              name: 'engines',
              chunks: 'all'
            },
            ui: {
              test: /[\\/]src[\\/]renderer[\\/]ui[\\/]/,
              name: 'ui',
              chunks: 'all'
            }
          }
        }
      }
    })
  };
  
  return merge(commonConfig, rendererConfig);
};