import React from 'react';
import { Spin, Typography, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import '@/styles/globals.less';

const { Text } = Typography;

interface LoadingProps {
  /** 加载文案 */
  tip?: string;
  /** 是否显示为卡片形式 */
  card?: boolean;
  /** 大小 */
  size?: 'small' | 'default' | 'large';
  /** 最小高度 */
  minHeight?: number | string;
  /** 是否居中显示 */
  center?: boolean;
}

const LoadingComponent: React.FC<LoadingProps> = ({
  tip = '加载中...',
  card = false,
  size = 'default',
  minHeight = 200,
  center = true
}) => {
  const spinElement = (
    <div 
      style={{
        textAlign: center ? 'center' : 'left',
        padding: '20px',
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: center ? 'center' : 'flex-start'
      }}
    >
      <Spin 
        size={size} 
        indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 32 : size === 'small' ? 16 : 24 }} spin />}
      />
      {tip && (
        <Text 
          type="secondary" 
          style={{ 
            marginTop: 16, 
            fontSize: size === 'large' ? '16px' : size === 'small' ? '12px' : '14px'
          }}
        >
          {tip}
        </Text>
      )}
    </div>
  );

  if (card) {
    return (
      <Card className="app-card">
        {spinElement}
      </Card>
    );
  }

  return spinElement;
};

export default LoadingComponent;
