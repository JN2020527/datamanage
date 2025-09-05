import React from 'react';
import { Card, Tag, Rate, Space, Avatar, Button, Tooltip } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  StarOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAssetTypeInfo, getQualityInfo, getRelativeTime, formatNumber } from '@utils/index';
import type { Asset } from '@types/index';

interface AssetCardProps {
  asset: Asset;
  onEdit?: (asset: Asset) => void;
  onView?: (asset: Asset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onEdit, onView }) => {
  const navigate = useNavigate();
  const typeInfo = getAssetTypeInfo(asset.type);
  const qualityInfo = getQualityInfo(asset.qualityScore);

  const handleCardClick = () => {
    onView?.(asset);
    navigate(`/discovery/${asset.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(asset);
    navigate(`/development?edit=${asset.id}`);
  };

  return (
    <Card
      className="asset-card"
      hoverable
      onClick={handleCardClick}
      style={{ height: '100%' }}
      styles={{ body: { padding: '20px' } }}
      actions={[
        <Tooltip key="view" title="查看详情">
          <Button type="text" icon={<EyeOutlined />} onClick={handleCardClick}>
            查看
          </Button>
        </Tooltip>,
        <Tooltip key="edit" title="编辑资产">
          <Button type="text" icon={<EditOutlined />} onClick={handleEditClick}>
            编辑
          </Button>
        </Tooltip>,
        <Tooltip key="stats" title="访问统计">
          <Space>
            <EyeOutlined style={{ color: '#8c8c8c' }} />
            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
              {formatNumber(asset.accessCount)}
            </span>
          </Space>
        </Tooltip>,
      ]}
    >
      {/* 卡片头部 */}
      <div className="asset-card-header">
        <div
          className="asset-card-icon"
          style={{ backgroundColor: typeInfo.color }}
        >
          {typeInfo.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            className="asset-card-title"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              margin: 0,
            }}
            title={asset.name}
          >
            {asset.name}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size="small" color={typeInfo.color}>
              {typeInfo.text}
            </Tag>
            <Tag size="small" color={qualityInfo.color}>
              {qualityInfo.text} {asset.qualityScore}分
            </Tag>
          </div>
        </div>
      </div>

      {/* 描述信息 */}
      <div
        className="asset-card-description"
        style={{
          margin: '16px 0',
          color: '#666',
          fontSize: '14px',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '63px',
        }}
        title={asset.description}
      >
        {asset.description}
      </div>

      {/* 标签 */}
      {asset.tags && asset.tags.length > 0 && (
        <div className="asset-card-tags" style={{ marginBottom: '16px' }}>
          {asset.tags.slice(0, 3).map((tag, index) => (
            <Tag
              key={index}
              size="small"
              style={{
                backgroundColor: '#f5f5f5',
                color: '#666',
                border: 'none',
                marginBottom: '4px',
              }}
            >
              {tag}
            </Tag>
          ))}
          {asset.tags.length > 3 && (
            <Tag size="small" style={{ backgroundColor: '#f5f5f5', color: '#666', border: 'none' }}>
              +{asset.tags.length - 3}
            </Tag>
          )}
        </div>
      )}

      {/* 底部元信息 */}
      <div className="asset-card-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{asset.owner}</span>
          <span style={{ fontSize: '12px', color: '#d9d9d9' }}>·</span>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{asset.department}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ClockCircleOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {getRelativeTime(asset.updatedAt)}
          </span>
        </div>
      </div>

      {/* 评分 */}
      <div style={{ marginTop: '12px', textAlign: 'center' }}>
        <Rate
          disabled
          allowHalf
          defaultValue={asset.qualityScore / 20} // 转换为5星制
          style={{ fontSize: '14px' }}
        />
        <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
          质量评分: {asset.qualityScore}/100
        </div>
      </div>
    </Card>
  );
};

export default AssetCard;
