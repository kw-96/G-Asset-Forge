// 统一的webpack配置入口
const path = require('path');
const { merge } = require('webpack-merge');

// 通用配置
const commonConfig = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      // 基础路径别名
      '@': path.resolve(__dirname, 'src'),
      '@main': path.resolve(__dirname, 'src/main'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      
      // 组件和UI相关
      '@/components': path.resolve(__dirname, 'src/renderer/components'),
      '@/ui': path.resolve(__dirname, 'src/renderer/components/ui'),
      '@/canvas': path.resolve(__dirname, 'src/renderer/components/canvas'),
      '@/tools': path.resolve(__dirname, 'src/renderer/components/tools'),
      '@/panels': path.resolve(__dirname, 'src/renderer/components/panels'),
      
      // 引擎集成
      '@/engines': path.resolve(__dirname, 'src/renderer/engines'),
      '@suika': path.resolve(__dirname, 'src/renderer/engines/suika'),
      '@h5-editor': path.resolve(__dirname, 'src/renderer/engines/h5-editor'),
      
      // 管理器
      '@/managers': path.resolve(__dirname, 'src/renderer/managers'),
      '@/canvas-manager': path.resolve(__dirname, 'src/renderer/managers/canvas'),
      '@/tools-manager': path.resolve(__dirname, 'src/renderer/managers/tools'),
      '@/history-manager': path.resolve(__dirname, 'src/renderer/managers/history'),
      '@/assets-manager': path.resolve(__dirname, 'src/renderer/managers/assets'),
      
      // 数据模型和工具
      '@/models': path.resolve(__dirname, 'src/renderer/models'),
      '@/utils': path.resolve(__dirname, 'src/renderer/utils'),
      '@/hooks': path.resolve(__dirname, 'src/renderer/hooks'),
      '@/styles': path.resolve(__dirname, 'src/renderer/styles'),
      '@/types': path.resolve(__dirname, 'src/types'),
      
      // 资源
      '@assets': path.resolve(__dirname, 'assets'),
      '@images': path.resolve(__dirname, 'assets/images'),
      '@fonts': path.resolve(__dirname, 'assets/fonts'),
      '@icons': path.resolve(__dirname, 'assets/icons')
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
            configFile: path.resolve(__dirname, 'tsconfig.json'),
            // 启用缓存以提高构建性能
            experimentalWatchApi: true,
            // 优化TypeScript编译
            compilerOptions: {
              isolatedModules: true
            }
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: /\.module\.css$/,
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: /\.module\.less$/,
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                // 支持CSS变量
                modifyVars: {
                  '@primary-color': '#1890ff'
                }
              }
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8KB
          }
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i,
        type: 'asset/resource'
      }
    ]
  },
  
  performance: {
    hints: process.env.NODE_ENV === 'development' ? false : 'warning',
    maxAssetSize: 2000000, // 2MB
    maxEntrypointSize: 2000000, // 2MB
    // 优化性能提示
    assetFilter: function(assetFilename) {
      return !assetFilename.includes('node_modules');
    }
  },
  
  // 优化配置
  optimization: {
    // 开发环境优化
    ...(process.env.NODE_ENV === 'development' ? {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false
    } : {
      // 生产环境优化
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // 第三方库
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          },
          // 引擎相关
          engines: {
            test: /[\\/]src[\\/]renderer[\\/]engines[\\/]/,
            name: 'engines',
            chunks: 'all',
            priority: 20
          },
          // UI组件
          ui: {
            test: /[\\/]src[\\/]renderer[\\/]components[\\/]ui[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15
          },
          // 工具组件
          tools: {
            test: /[\\/]src[\\/]renderer[\\/]components[\\/]tools[\\/]/,
            name: 'tools',
            chunks: 'all',
            priority: 15
          },
          // 管理器
          managers: {
            test: /[\\/]src[\\/]renderer[\\/]managers[\\/]/,
            name: 'managers',
            chunks: 'all',
            priority: 15
          }
        }
      }
    })
  }
};

module.exports = { commonConfig, merge };