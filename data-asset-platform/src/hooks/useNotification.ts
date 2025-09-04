import { message, notification } from 'antd';
import type { ArgsProps as MessageArgsProps } from 'antd/es/message';
import type { ArgsProps as NotificationArgsProps } from 'antd/es/notification';

interface UseNotificationReturn {
  // 消息提示
  showSuccess: (content: string, duration?: number) => void;
  showError: (content: string, duration?: number) => void;
  showWarning: (content: string, duration?: number) => void;
  showInfo: (content: string, duration?: number) => void;
  showLoading: (content: string) => () => void;
  
  // 通知提示
  notifySuccess: (config: NotificationArgsProps) => void;
  notifyError: (config: NotificationArgsProps) => void;
  notifyWarning: (config: NotificationArgsProps) => void;
  notifyInfo: (config: NotificationArgsProps) => void;
  
  // 销毁方法
  destroyAll: () => void;
}

export const useNotification = (): UseNotificationReturn => {
  const showMessage = (type: 'success' | 'error' | 'warning' | 'info', content: string, duration = 3) => {
    message[type]({
      content,
      duration,
      style: {
        marginTop: '64px', // 避免被顶部导航栏遮挡
      },
    });
  };

  const showSuccess = (content: string, duration?: number) => {
    showMessage('success', content, duration);
  };

  const showError = (content: string, duration?: number) => {
    showMessage('error', content, duration);
  };

  const showWarning = (content: string, duration?: number) => {
    showMessage('warning', content, duration);
  };

  const showInfo = (content: string, duration?: number) => {
    showMessage('info', content, duration);
  };

  const showLoading = (content: string) => {
    const hide = message.loading({
      content,
      duration: 0, // 不自动消失
      style: {
        marginTop: '64px',
      },
    });
    return hide;
  };

  const notifySuccess = (config: NotificationArgsProps) => {
    notification.success({
      placement: 'topRight',
      duration: 4.5,
      style: {
        marginTop: '64px',
      },
      ...config,
    });
  };

  const notifyError = (config: NotificationArgsProps) => {
    notification.error({
      placement: 'topRight',
      duration: 4.5,
      style: {
        marginTop: '64px',
      },
      ...config,
    });
  };

  const notifyWarning = (config: NotificationArgsProps) => {
    notification.warning({
      placement: 'topRight',
      duration: 4.5,
      style: {
        marginTop: '64px',
      },
      ...config,
    });
  };

  const notifyInfo = (config: NotificationArgsProps) => {
    notification.info({
      placement: 'topRight',
      duration: 4.5,
      style: {
        marginTop: '64px',
      },
      ...config,
    });
  };

  const destroyAll = () => {
    message.destroy();
    notification.destroy();
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    destroyAll,
  };
};
