import React from 'react';
import { Empty, Typography, Card } from 'antd';
import { 
  InboxOutlined, 
  FileSearchOutlined, 
  DatabaseOutlined,
  ExclamationCircleOutlined,
  PlusOutlined 
} from '@ant-design/icons';
import '@/styles/globals.less';

const { Text } = Typography;

export type EmptyType = 'default' | 'search' | 'data' | 'error' | 'create';

interface EmptyStateProps {
  /** 空状态类型 */
  type?: EmptyType;
  /** 标题 */
  title?: string;
  /** 描述文案 */
  description?: string;
  /** 操作按钮 */
  action?: React.ReactNode;
  /** 是否显示为卡片形式 */
  card?: boolean;
  /** 最小高度 */
  minHeight?: number | string;
  /** 自定义图片 */
  image?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  title,
  description,
  action,
  card = false,
  minHeight = 200,
  image
}) => {
  // 根据类型获取默认配置
  const getDefaultConfig = () => {
    switch (type) {
      case 'search':
        return {
          image: <FileSearchOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
          title: '暂无搜索结果',
          description: '请尝试调整搜索条件或关键词'
        };
      case 'data':
        return {
          image: <DatabaseOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
          title: '暂无数据',
          description: '当前没有可显示的数据内容'
        };
      case 'error':
        return {
          image: <ExclamationCircleOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />,
          title: '加载失败',
          description: '数据加载过程中出现错误，请稍后重试'
        };
      case 'create':
        return {
          image: <PlusOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
          title: '还没有内容',
          description: '点击下方按钮开始创建第一个项目'
        };
      default:
        return {
          image: <InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
          title: '暂无内容',
          description: '当前列表为空'
        };
    }
  };

  const defaultConfig = getDefaultConfig();
  const finalImage = image || defaultConfig.image;
  const finalTitle = title || defaultConfig.title;
  const finalDescription = description || defaultConfig.description;

  const emptyElement = (
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
      <Empty
        image={finalImage}
        imageStyle={{
          height: 80,
          marginBottom: 16
        }}
        description={
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: 8, color: '#262626' }}>
              {finalTitle}
            </div>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {finalDescription}
            </Text>
          </div>
        }
      >
        {action}
      </Empty>
    </div>
  );

  if (card) {
    return (
      <Card className="app-card">
        {emptyElement}
      </Card>
    );
  }

  return emptyElement;
};

export default EmptyState;
