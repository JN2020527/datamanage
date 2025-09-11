import React from 'react';
import { Table, Spin, Empty, Button } from 'antd';
import { createAssetTableColumns } from './AssetTableColumns';
import { PAGINATION_CONFIG, TABLE_CONFIG } from '@constants/assetConfig';
import type { Asset } from '@types/index';
import styles from '@styles/DiscoveryPage.module.css';

interface AssetListProps {
  assets: Asset[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
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
  // 创建表格列配置
  const columns = createAssetTableColumns({
    onView,
    onEdit,
  });

  // 处理行点击事件
  const handleRowClick = (record: Asset) => {
    onView?.(record);
  };

  // 加载状态
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 空状态
  if (!assets.length) {
    return (
      <div className={styles.emptyContainer}>
        <Empty 
          description="暂无匹配的资产" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary">清空筛选条件</Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <Table
        columns={columns}
        dataSource={assets}
        rowKey="id"
        loading={loading}
        pagination={pagination ? {
          ...PAGINATION_CONFIG,
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: pagination.onChange,
        } : false}
        scroll={TABLE_CONFIG.scroll}
        sticky={TABLE_CONFIG.sticky}
        size={TABLE_CONFIG.size}
        onRow={(record) => ({
          style: { cursor: 'pointer' },
          onClick: () => handleRowClick(record),
        })}
      />
    </div>
  );
};

export default AssetList;
