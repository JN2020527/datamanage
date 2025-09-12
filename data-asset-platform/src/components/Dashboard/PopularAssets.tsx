import React, { useEffect, useState } from 'react';
import { Card, List, Avatar, Rate, Button, Empty, Spin, Tag } from 'antd';
import {
  EyeOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '@mock/api';
import { getAssetTypeInfo, formatNumber } from '@utils/index';

interface PopularAsset {
  id: string;
  name: string;
  type: string;
  rating: number;
  viewCount: number;
  description: string;
}

const PopularAssets: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<PopularAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const { data } = await api.getPopularAssets();
        setAssets(data);
      } catch (error) {
        console.error('加载热门资产失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  if (loading) {
    return (
      <Card title="热门资产" className="popular-assets-card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="热门资产"
      className="popular-assets-card"
      extra={
        <Button
          type="link"
          size="small"
          onClick={() => navigate('/discovery')}
        >
          查看更多
        </Button>
      }
    >
      {assets.length === 0 ? (
        <Empty
          description="暂无热门资产"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={assets}
          renderItem={(item) => {
            const typeInfo = getAssetTypeInfo(item.type);
            return (
              <List.Item
                style={{
                  padding: '16px 0',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.backgroundColor = 'transparent';
                }}
                onClick={() => navigate(`/discovery/${item.id}`)}
                actions={[
                  <div key="rating" style={{ display: 'flex', alignItems: 'center' }}>
                    <StarOutlined style={{ color: '#fadb14', marginRight: '4px' }} />
                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      {item.rating}
                    </span>
                  </div>,
                  <div key="views" style={{ display: 'flex', alignItems: 'center' }}>
                    <EyeOutlined style={{ color: '#1677FF', marginRight: '4px' }} />
                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      {formatNumber(item.viewCount)}
                    </span>
                  </div>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={48}
                      style={{
                        backgroundColor: typeInfo.color,
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {React.createElement(typeInfo.icon)}
                    </Avatar>
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, marginRight: '8px' }}>
                        {item.name}
                      </span>
                      <Tag size="small" color={typeInfo.color}>
                        {typeInfo.text}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.description}
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <Rate
                          disabled
                          defaultValue={item.rating}
                          allowHalf
                          style={{ fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

export default PopularAssets;
