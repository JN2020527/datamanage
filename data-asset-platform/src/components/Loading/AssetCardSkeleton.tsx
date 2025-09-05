import React from 'react';
import { Card, Skeleton, Space } from 'antd';

interface AssetCardSkeletonProps {
  count?: number;
}

const AssetCardSkeleton: React.FC<AssetCardSkeletonProps> = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <Card
          key={index}
          style={{ 
            height: '320px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-loading 1.5s infinite',
          }}
          styles={{ body: { padding: '20px' } }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Skeleton.Avatar size={40} />
              <div style={{ flex: 1 }}>
                <Skeleton.Input style={{ width: '60%', height: '16px' }} active />
                <div style={{ marginTop: '8px' }}>
                  <Skeleton.Input style={{ width: '40%', height: '12px' }} active />
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <Skeleton paragraph={{ rows: 3, width: ['100%', '90%', '70%'] }} />
            </div>
            
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <Skeleton.Button size="small" />
              <Skeleton.Button size="small" />
              <Skeleton.Button size="small" />
            </div>
            
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton.Input style={{ width: '40%', height: '12px' }} active />
              <Skeleton.Input style={{ width: '30%', height: '12px' }} active />
            </div>
          </Space>
        </Card>
      ))}
    </>
  );
};

export default AssetCardSkeleton;
