import React from 'react';
import { Tag, Avatar, Button, Space, Tooltip } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { Asset } from '@types/index';
import { getAssetTypeConfig, getQualityLevelConfig } from '@constants/assetConfig';
import { getRelativeTime, formatNumber } from '@utils/index';
import styles from '@styles/DiscoveryPage.module.css';

// 资产名称单元格组件
export const AssetNameCell: React.FC<{ name: string; record: Asset }> = ({ 
  name, 
  record 
}) => {
  const typeConfig = getAssetTypeConfig(record.type);
  const IconComponent = typeConfig.icon;
  
  return (
    <div className={styles.assetNameCell}>
      <div 
        className={styles.assetIcon} 
        style={{ color: typeConfig.color }}
      >
        <IconComponent />
      </div>
      <div className={styles.assetInfo}>
        <div className={styles.assetName} title={name}>
          {name}
        </div>
        <div className={styles.assetId}>
          {record.id}
        </div>
      </div>
    </div>
  );
};

// 资产类型单元格组件
export const AssetTypeCell: React.FC<{ type: string }> = ({ type }) => {
  const typeConfig = getAssetTypeConfig(type as any);
  
  return (
    <Tag 
      style={{ 
        backgroundColor: `${typeConfig.color}15`, // 添加透明度
        color: typeConfig.color,
        border: `1px solid ${typeConfig.color}30`,
        borderRadius: '6px',
        padding: '2px 8px',
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      {typeConfig.label}
    </Tag>
  );
};

// 资产描述单元格组件
export const AssetDescriptionCell: React.FC<{ description: string }> = ({ 
  description 
}) => (
  <div className={styles.assetDescription} title={description}>
    {description}
  </div>
);

// 负责人单元格组件
export const OwnerCell: React.FC<{ owner: string; department: string }> = ({ 
  owner, 
  department 
}) => (
  <div className={styles.ownerCell}>
    <Avatar size="small" icon={<UserOutlined />} />
    <div className={styles.ownerInfo}>
      <div className={styles.ownerName}>{owner}</div>
      <div className={styles.ownerDepartment}>{department}</div>
    </div>
  </div>
);

// 访问量单元格组件
export const AccessCountCell: React.FC<{ count: number }> = ({ count }) => (
  <span style={{ fontSize: '14px', color: '#595959' }}>
    {formatNumber(count)}
  </span>
);

// 更新时间单元格组件
export const UpdateTimeCell: React.FC<{ updatedAt: string }> = ({ updatedAt }) => (
  <div className={styles.updateTimeCell}>
    <div className={styles.updateTime}>
      {getRelativeTime(updatedAt)}
    </div>
    <div className={styles.updateDate}>
      <ClockCircleOutlined />
      {new Date(updatedAt).toLocaleDateString()}
    </div>
  </div>
);

// 标签单元格组件
export const TagsCell: React.FC<{ tags: string[] }> = ({ tags }) => (
  <div className={styles.tagsCell}>
    {tags.slice(0, 2).map((tag, index) => (
      <Tag key={index} size="small" className={styles.tagItem}>
        {tag}
      </Tag>
    ))}
    {tags.length > 2 && (
      <Tag size="small" className={styles.tagItem}>
        +{tags.length - 2}
      </Tag>
    )}
  </div>
);

// 操作单元格组件
export const ActionsCell: React.FC<{ 
  record: Asset; 
  onView?: (asset: Asset) => void;
  onEdit?: (asset: Asset) => void;
}> = ({ record, onView, onEdit }) => {
  const navigate = useNavigate();

  const handleView = () => {
    onView?.(record);
    navigate(`/discovery/${record.id}`);
  };

  const handleEdit = () => {
    onEdit?.(record);
    navigate(`/development?edit=${record.id}`);
  };

  return (
    <Space size="small">
      <Tooltip title="查看详情">
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={handleView}
        />
      </Tooltip>
      <Tooltip title="编辑资产">
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={handleEdit}
        />
      </Tooltip>
    </Space>
  );
};

// 创建表格列配置的工厂函数
export const createAssetTableColumns = (options?: {
  onView?: (asset: Asset) => void;
  onEdit?: (asset: Asset) => void;
}): ColumnsType<Asset> => [
  {
    title: '资产名称',
    dataIndex: 'name',
    key: 'name',
    width: 300,
    fixed: 'left',
    render: (name: string, record: Asset) => (
      <AssetNameCell name={name} record={record} />
    ),
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    render: (type: string) => <AssetTypeCell type={type} />,
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
      <AssetDescriptionCell description={description} />
    ),
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    key: 'owner',
    width: 120,
    render: (owner: string, record: Asset) => (
      <OwnerCell owner={owner} department={record.department} />
    ),
  },
  {
    title: '访问量',
    dataIndex: 'accessCount',
    key: 'accessCount',
    width: 100,
    align: 'center',
    render: (count: number) => <AccessCountCell count={count} />,
    sorter: (a, b) => a.accessCount - b.accessCount,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 120,
    render: (updatedAt: string) => <UpdateTimeCell updatedAt={updatedAt} />,
    sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  },
  {
    title: '标签',
    dataIndex: 'tags',
    key: 'tags',
    width: 200,
    render: (tags: string[]) => <TagsCell tags={tags} />,
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (_, record: Asset) => (
      <ActionsCell 
        record={record} 
        onView={options?.onView}
        onEdit={options?.onEdit}
      />
    ),
  },
];
