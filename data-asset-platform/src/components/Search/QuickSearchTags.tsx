import React from 'react';
import { Space, Tag } from 'antd';
import {
  FireOutlined,
  StarOutlined,
  ClockCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';

interface QuickSearchTagsProps {
  onTagClick: (tag: string) => void;
  style?: React.CSSProperties;
}

const QuickSearchTags: React.FC<QuickSearchTagsProps> = ({ onTagClick, style }) => {
  const hotTags = [
    { label: '用户行为', value: '用户行为', icon: <FireOutlined />, color: '#ff4d4f' },
    { label: '高质量资产', value: '质量评分:>90', icon: <StarOutlined />, color: '#52c41a' },
    { label: '最近更新', value: '更新时间:本周', icon: <ClockCircleOutlined />, color: '#1890ff' },
    { label: '热门访问', value: '访问量:>1000', icon: <RiseOutlined />, color: '#722ed1' },
  ];

  return (
    <div style={{ marginBottom: '16px', ...style }}>
      <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '8px' }}>
        🔥 热门搜索
      </div>
      <Space wrap>
        {hotTags.map((tag) => (
          <Tag
            key={tag.value}
            color={tag.color}
            style={{
              cursor: 'pointer',
              borderRadius: '12px',
              border: 'none',
              fontSize: '12px',
              padding: '2px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onClick={() => onTagClick(tag.value)}
          >
            {tag.icon}
            {tag.label}
          </Tag>
        ))}
      </Space>
    </div>
  );
};

export default QuickSearchTags;
