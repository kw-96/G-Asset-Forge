/**
 * Jest测试配置
 * @description 配置Jest测试环境和规则
 * @author 开发团队
 */
module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 根目录
  rootDir: '.',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  
  // 忽略的测试文件
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  
  // 模块文件扩展名
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node',
  ],
  
  // 模块名映射（路径别名）
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@main/(.*)$': '<rootDir>/src/main/$1',
    '^@renderer/(.*)$': '<rootDir>/src/renderer/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  
  // 转换配置
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // 转换忽略模式
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
  
  // 设置文件
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts',
  ],
  
  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/main/main.ts',
    '!src/renderer/index.tsx',
  ],
  
  // 覆盖率报告
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
  ],
  
  // 覆盖率输出目录
  coverageDirectory: '<rootDir>/coverage',
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  
  // 模块目录
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src',
  ],
  
  // 清除模拟
  clearMocks: true,
  
  // 恢复模拟
  restoreMocks: true,
  
  // 详细输出
  verbose: true,
  
  // 测试超时
  testTimeout: 10000,
  
  // 最大工作进程
  maxWorkers: '50%',
};