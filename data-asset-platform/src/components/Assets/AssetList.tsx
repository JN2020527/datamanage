import React from 'react';
import { Table, Tag, Rate, Button, Space, Avatar, Tooltip } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAssetTypeInfo, getQualityInfo, getRelativeTime, formatNumber } from '@utils/index';
import type { Asset } from '@types/index';
import type { ColumnsType } from 'antd/es/table';

interface AssetListProps {
  assets: Asset[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    onChange?: (page: number, pageSize: number) => void;
  };
  onEdit?: (asset: Asset) => void;
  onView?: (asset: Asset) => void;
}

const AssetList: React.FC<AssetListProps> = ({
  assets,
  loading = false,
  pagination,
  onEdit,
  onView,
}) => {
  const navigate = useNavigate();

  const handleView = (asset: Asset) => {
    onView?.(asset);
    navigate(`/discovery/${asset.id}`);
  };

  const handleEdit = (asset: Asset) => {
    onEdit?.(asset);
    navigate(`/development?edit=${asset.id}`);
  };

  const columns: ColumnsType<Asset> = [
    {
      title: '资产名称',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      fixed: 'left',
      render: (name: string, record: Asset) => {
        const typeInfo = getAssetTypeInfo(record.type);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: typeInfo.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: 'white',
              }}
            >
              {typeInfo.icon}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#262626',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={name}
              >
                {name}
              </div>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {record.id}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeInfo = getAssetTypeInfo(type);
        return (
          <Tag color={typeInfo.color} style={{ border: 'none' }}>
            {typeInfo.text}
          </Tag>
        );
      },
      filters: [
        { text: '数据表', value: 'table' },
        { text: '数据模型', value: 'model' },
        { text: '报表', value: 'report' },
        { text: '看板', value: 'dashboard' },
      ],
      onFilter: (value: any, record) => record.type === value,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (description: string) => (
        <div
          style={{
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            color: '#595959',
          }}
          title={description}
        >
          {description}
        </div>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 120,
      render: (owner: string, record: Asset) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontSize: '14px', color: '#262626' }}>{owner}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.department}</div>
          </div>
        </div>
      ),
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      width: 120,
      align: 'center',
      render: (score: number) => {
        const qualityInfo = getQualityInfo(score);
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: qualityInfo.color, fontWeight: 500 }}>
              {score}分
            </div>
            <Rate
              disabled
              allowHalf
              value={score / 20}
              style={{ fontSize: '12px' }}
            />
          </div>
        );
      },
      sorter: (a, b) => a.qualityScore - b.qualityScore,
    },
    {
      title: '访问量',
      dataIndex: 'accessCount',
      key: 'accessCount',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <span style={{ fontSize: '14px', color: '#595959' }}>
          {formatNumber(count)}
        </span>
      ),
      sorter: (a, b) => a.accessCount - b.accessCount,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (updatedAt: string) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#595959' }}>
            {getRelativeTime(updatedAt)}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            <ClockCircleOutlined style={{ marginRight: '4px' }} />
            {new Date(updatedAt).toLocaleDateString()}
          </div>
        </div>
      ),
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <div>
          {tags.slice(0, 2).map((tag, index) => (
            <Tag
              key={index}
              size="small"
              style={{
                backgroundColor: '#f5f5f5',
                color: '#666',
                border: 'none',
                marginBottom: '2px',
              }}
            >
              {tag}
            </Tag>
          ))}
          {tags.length > 2 && (
            <Tag size="small" style={{ backgroundColor: '#f5f5f5', color: '#666', border: 'none' }}>
              +{tags.length - 2}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record: Asset) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑资产">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={assets}
      rowKey="id"
      loading={loading}
      pagination={
        pagination
          ? {
              ...pagination,
              showSizeChanger: pagination.showSizeChanger ?? true,
              showQuickJumper: pagination.showQuickJumper ?? true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }
          : false
      }
      scroll={{ x: 1400 }}
      size="middle"
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }}
      onRow={(record) => ({
        style: { cursor: 'pointer' },
        onClick: () => handleView(record),
      })}
    />
  );
};

export default AssetList;
