import React from 'react';
import { Checkbox, Space, Typography, Divider, Tree } from 'antd';
import { FilterOutlined, ClearOutlined, FolderOutlined, DatabaseOutlined } from '@ant-design/icons';
import type { SearchFilter } from '@types/index';
import { ASSET_TYPES } from '@constants/assetConfig';

const { Title } = Typography;

// 目录层级数据（与目录管理中的结构保持一致）
const catalogTreeData = [
  {
    title: '客户类',
    key: '1003',
    icon: <FolderOutlined />,
    children: [
      { title: '集团客户', key: '1004', icon: <DatabaseOutlined /> },
      { title: '战客', key: '1005', icon: <DatabaseOutlined /> },
      { title: '商客', key: '1006', icon: <DatabaseOutlined /> },
      { title: '成员类', key: '1007', icon: <DatabaseOutlined /> },
    ],
  },
  {
    title: '收入类',
    key: '1008',
    icon: <FolderOutlined />,
    children: [
      { title: '财务收入', key: '1009', icon: <DatabaseOutlined /> },
      { title: '省内白名单市场收入', key: '1010', icon: <DatabaseOutlined /> },
      { title: '管会收入', key: '1011', icon: <DatabaseOutlined /> },
      { title: '集团信息化收入', key: '1012', icon: <DatabaseOutlined /> },
    ],
  },
  {
    title: '欠费',
    key: '1013',
    icon: <FolderOutlined />,
    children: [
      { title: '正常欠费', key: '1014', icon: <DatabaseOutlined /> },
      { title: '核销欠费', key: '1015', icon: <DatabaseOutlined /> },
      { title: '销账', key: '1017', icon: <DatabaseOutlined /> },
    ],
  },
];

interface FilterPanelProps {
  filter: SearchFilter;
  onChange: (filter: SearchFilter) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filter, onChange }) => {
  const handleAssetTypeChange = (checkedValues: string[]) => {
    onChange({
      ...filter,
      assetTypes: checkedValues as any[]
    });
  };

  const handleCatalogChange = (checkedKeys: any) => {
    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
    onChange({
      ...filter,
      catalogKeys: keys
    });
  };

  const handleClear = () => {
    onChange({});
  };

  const hasActiveFilters = (filter.assetTypes && filter.assetTypes.length > 0) || 
                        (filter.catalogKeys && filter.catalogKeys.length > 0);

  return (
    <div style={{ padding: '16px', height: '100%' }}>
      {/* 筛选标题 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FilterOutlined />
          <Title level={5} style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>筛选</Title>
        </div>
        {hasActiveFilters && (
          <ClearOutlined 
            style={{ cursor: 'pointer', fontSize: '14px', color: '#1890ff' }} 
            onClick={handleClear}
            title="清除筛选"
          />
        )}
      </div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 资产类型 */}
        <div>
          <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            资产类型
          </Title>
          <Checkbox.Group
            value={filter.assetTypes || []}
            onChange={handleAssetTypeChange}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {ASSET_TYPES.map(type => (
                <Checkbox key={type.value} value={type.value}>
                  {type.label}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* 目录分类 */}
        <div>
          <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            目录分类
          </Title>
          <Tree
            checkable
            checkedKeys={filter.catalogKeys || []}
            onCheck={handleCatalogChange}
            treeData={catalogTreeData}
            defaultExpandAll
            showIcon
            style={{ 
              background: 'transparent',
              fontSize: '13px'
            }}
            height={300}
          />
        </div>
      </Space>
    </div>
  );
};

export default FilterPanel;
