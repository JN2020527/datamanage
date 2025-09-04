import React from 'react';
import { Alert, Button, Typography, Card, Space } from 'antd';
import { 
  ExclamationCircleOutlined, 
  ReloadOutlined,
  BugOutlined,
  DisconnectOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';
import '@/styles/globals.less';

const { Paragraph } = Typography;

export type ErrorType = 'network' | 'server' | 'permission' | 'notfound' | 'generic';

interface ErrorStateProps {
  /** 错误类型 */
  type?: ErrorType;
  /** 错误标题 */
  title?: string;
  /** 错误描述 */
  description?: string;
  /** 错误详情（通常是技术信息） */
  detail?: string;
  /** 重试操作 */
  onRetry?: () => void;
  /** 自定义操作 */
  actions?: React.ReactNode;
  /** 是否显示为卡片形式 */
  card?: boolean;
  /** 最小高度 */
  minHeight?: number | string;
  /** 是否显示详细错误信息 */
  showDetail?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  description,
  detail,
  onRetry,
  actions,
  card = false,
  minHeight = 200,
  showDetail = false
}) => {
  // 根据类型获取默认配置
  const getDefaultConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <DisconnectOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />,
          title: '网络连接失败',
          description: '请检查网络连接后重试',
          alertType: 'error' as const
        };
      case 'server':
        return {
          icon: <BugOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />,
          title: '服务器错误',
          description: '服务器遇到问题，请稍后再试',
          alertType: 'error' as const
        };
      case 'permission':
        return {
          icon: <CloseCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />,
          title: '权限不足',
          description: '您没有权限访问此内容，请联系管理员',
          alertType: 'warning' as const
        };
      case 'notfound':
        return {
          icon: <ExclamationCircleOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />,
          title: '页面不存在',
          description: '抱歉，您访问的页面不存在或已被移除',
          alertType: 'info' as const
        };
      default:
        return {
          icon: <ExclamationCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />,
          title: '出现错误',
          description: '页面加载时出现了一些问题',
          alertType: 'error' as const
        };
    }
  };

  const defaultConfig = getDefaultConfig();
  const finalTitle = title || defaultConfig.title;
  const finalDescription = description || defaultConfig.description;

  const errorElement = (
    <div 
      style={{
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px'
      }}
    >
      <Alert
        type={defaultConfig.alertType}
        showIcon
        icon={defaultConfig.icon}
        message={
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: 8 }}>
              {finalTitle}
            </div>
            <Paragraph style={{ fontSize: '14px', margin: 0, color: 'inherit' }}>
              {finalDescription}
            </Paragraph>
            
            {showDetail && detail && (
              <details style={{ marginTop: 16, textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#8c8c8c' }}>
                  查看错误详情
                </summary>
                <pre style={{ 
                  fontSize: '12px', 
                  background: '#f5f5f5', 
                  padding: '8px', 
                  marginTop: '8px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {detail}
                </pre>
              </details>
            )}
          </div>
        }
        action={
          <Space>
            {onRetry && (
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={onRetry}
              >
                重试
              </Button>
            )}
            {actions}
          </Space>
        }
        style={{
          padding: '24px',
          border: 'none',
          background: 'transparent'
        }}
      />
    </div>
  );

  if (card) {
    return (
      <Card className="app-card">
        {errorElement}
      </Card>
    );
  }

  return errorElement;
};

export default ErrorState;
