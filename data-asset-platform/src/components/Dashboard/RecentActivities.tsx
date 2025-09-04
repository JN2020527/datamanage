import React, { useEffect, useState } from 'react';
import { Card, List, Avatar, Button, Empty, Spin } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '@mock/api';
import { getRelativeTime, getAssetTypeInfo } from '@utils/index';

interface Activity {
  id: string;
  type: 'view' | 'edit' | 'create';
  asset: string;
  user: string;
  timestamp: string;
  description: string;
}

const RecentActivities: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const { data } = await api.getRecentActivities();
        setActivities(data);
      } catch (error) {
        console.error('加载最近活动失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <EyeOutlined style={{ color: '#1677FF' }} />;
      case 'edit':
        return <EditOutlined style={{ color: '#FAAD14' }} />;
      case 'create':
        return <PlusOutlined style={{ color: '#52C41A' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view':
        return '#1677FF';
      case 'edit':
        return '#FAAD14';
      case 'create':
        return '#52C41A';
      default:
        return '#8c8c8c';
    }
  };

  if (loading) {
    return (
      <Card title="最近活动" className="recent-activities-card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="最近活动"
      className="recent-activities-card"
      extra={
        <Button
          type="link"
          size="small"
          onClick={() => navigate('/system/logs')}
        >
          查看全部
        </Button>
      }
    >
      {activities.length === 0 ? (
        <Empty
          description="暂无最近活动"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={activities}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 0',
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
              onClick={() => {
                // 根据活动类型导航到相应页面
                if (item.type === 'view') {
                  navigate('/discovery');
                } else if (item.type === 'edit' || item.type === 'create') {
                  navigate('/development');
                }
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={40}
                    style={{
                      backgroundColor: getActivityColor(item.type),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getActivityIcon(item.type)}
                  </Avatar>
                }
                title={
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {item.description}
                  </div>
                }
                description={
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {item.user} · {getRelativeTime(item.timestamp)}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default RecentActivities;
