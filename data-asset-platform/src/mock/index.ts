// Mock 数据初始化文件
export * from './data';
export * from './api';

// 在开发环境下启用 Mock
if (import.meta.env.DEV) {
  console.log('🎭 Mock 数据服务已启用');
}
