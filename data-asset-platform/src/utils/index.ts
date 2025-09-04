import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).format(format);
};

/**
 * 获取相对时间
 */
export const getRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow();
};

/**
 * 生成唯一ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * 深拷贝
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 获取质量等级文本和颜色
 */
export const getQualityInfo = (score: number) => {
  if (score >= 90) {
    return { level: 'excellent', text: '优秀', color: '#52c41a' };
  } else if (score >= 80) {
    return { level: 'good', text: '良好', color: '#1890ff' };
  } else if (score >= 70) {
    return { level: 'fair', text: '一般', color: '#faad14' };
  } else {
    return { level: 'poor', text: '待改进', color: '#ff4d4f' };
  }
};

/**
 * 获取资产类型图标和文本
 */
export const getAssetTypeInfo = (type: string) => {
  const typeMap = {
    table: { icon: '📊', text: '数据表', color: '#1890ff' },
    model: { icon: '🏗️', text: '数据模型', color: '#722ed1' },
    report: { icon: '📈', text: '报表', color: '#52c41a' },
    dashboard: { icon: '📋', text: '看板', color: '#fa8c16' },
  };
  return typeMap[type as keyof typeof typeMap] || { icon: '📄', text: '未知', color: '#d9d9d9' };
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 格式化数字
 */
export const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * 高亮搜索关键词
 */
export const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * 校验邮箱
 */
export const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * 校验手机号
 */
export const validatePhone = (phone: string) => {
  const regex = /^1[3-9]\d{9}$/;
  return regex.test(phone);
};

/**
 * 获取随机颜色
 */
export const getRandomColor = () => {
  const colors = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
    '#13c2c2', '#eb2f96', '#fa541c', '#2f54eb', '#a0d911'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * 数组分组
 */
export const groupBy = <T>(array: T[], key: keyof T) => {
  return array.reduce((groups: Record<string, T[]>, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

/**
 * 下载文件
 */
export const downloadFile = (data: any, filename: string, type = 'application/json') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * 复制到剪贴板
 */
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};
