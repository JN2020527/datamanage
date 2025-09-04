import React from 'react';
import { Avatar, Typography } from 'antd';

const { Text } = Typography;

interface CommentItemProps {
  author: string;
  avatar: string;
  content: string;
  datetime: string;
}

const CommentItem: React.FC<CommentItemProps> = ({ author, avatar, content, datetime }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Avatar src={avatar} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '4px' }}>
            <Text strong style={{ marginRight: '8px' }}>{author}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{datetime}</Text>
          </div>
          <div style={{ 
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
