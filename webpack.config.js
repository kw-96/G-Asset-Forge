// 统一的webpack配置入口
const path = require('path');
const { merge } = require('webpack-merge');

// 通用配置
const commonConfig = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/core': path.resolve(__dirname, 'src/renderer/core'),
      '@/ui': path.resolve(__dirname, 'src/renderer/ui'),
      '@/engines': path.resolve(__dirname, 'src/renderer/engines'),
      '@/components': path.resolve(__dirname, 'src/renderer/components'),
      '@/stores': path.resolve(__dirname, 'src/renderer/stores'),
      '@/utils': path.resolve(__dirname, 'src/renderer/utils'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@suika': path.resolve(__dirname, 'src/renderer/engines/suika'),
      '@h5-editor': path.resolve(__dirname, 'src/renderer/engines/h5-editor'),
      '@main': path.resolve(__dirname, 'src/main'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@assets': path.resolve(__dirname, 'assets')
    },
    fallback: {
      "events": false,
      "path": require.resolve("path-browserify"),
      "fs": false,
      "os": require.resolve("os-browserify"),
      "crypto": false,
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util"),
      "buffer": require.resolve("buffer"),
      "assert": require.resolve("assert"),
      "process": require.resolve("process/browser.js"),
      "global": require.resolve("global/window"),
      "http": false,
      "https": false,
      "net": false,
      "tls": false,
      "url": require.resolve("url"),
      "querystring": require.resolve("querystring-es3"),
      "child_process": false,
      "cluster": false,
      "dgram": false,
      "dns": false,
      "module": false,
      "readline": false,
      "repl": false,
      "tty": false,
      "vm": false,
      "zlib": false
    }
  },
  
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: process.env.NODE_ENV === 'development',
            configFile: path.resolve(__dirname, 'tsconfig.json')
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      }
    ]
  },
  
  performance: {
    hints: process.env.NODE_ENV === 'development' ? false : 'warning',
    maxAssetSize: 2000000, // 2MB
    maxEntrypointSize: 2000000 // 2MB
  }
};

module.exports = { commonConfig, merge };