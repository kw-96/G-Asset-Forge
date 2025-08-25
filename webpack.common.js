const path = require('path');

// 通用配置
const getCommonConfig = (isDevelopment = false) => ({
  // 明确设置模式
  mode: isDevelopment ? 'development' : 'production',
  
  // 开发工具配置
  devtool: isDevelopment ? 'inline-source-map' : false,
  
  // 通用别名配置
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@main': path.resolve(__dirname, 'src/main'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@assets': path.resolve(__dirname, 'assets')
    }
  },
  
  // 通用模块规则
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: isDevelopment, // 开发模式下快速编译
            configFile: path.resolve(__dirname, 'tsconfig.json'),
            compilerOptions: {
              declaration: isDevelopment, // 开发环境生成声明文件
              declarationMap: isDevelopment,
              emitDeclarationOnly: false
            }
          }
        },
        exclude: [
          /node_modules/,
          /\.test\./,
          /\.spec\./,
          /Test.*\.tsx?$/,
          /Spec.*\.tsx?$/,
          /__tests__/,
          /__mocks__/
        ]
      }
    ]
  },
  
  // 性能配置
  performance: {
    hints: isDevelopment ? false : 'warning',
    maxAssetSize: 2000000, // 2MB
    maxEntrypointSize: 2000000 // 2MB
  },
  
  // 统计信息配置
  stats: isDevelopment ? 'minimal' : 'normal'
});

module.exports = {
  getCommonConfig
};