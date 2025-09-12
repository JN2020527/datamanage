import React, { useState } from 'react';
import { Typography, Tree, Button, Space, Checkbox, Divider } from 'antd';
import { FilterOutlined, ClearOutlined, FolderOutlined, DatabaseOutlined, ArrowsAltOutlined, ShrinkOutlined, TableOutlined, DashboardOutlined, TagOutlined } from '@ant-design/icons';
import type { SearchFilter } from '@types/index';

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
    ],
  },
];

// 资产分类数据
const ASSET_TYPES = [
  { key: 'table', label: '数据表', icon: <TableOutlined /> },
  { key: 'metric', label: '指标', icon: <DashboardOutlined /> },
  { key: 'tag', label: '标签', icon: <TagOutlined /> },
];

interface FilterPanelProps {
  filter: SearchFilter;
  onChange: (filter: SearchFilter) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filter, onChange }) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['1003', '1008', '1013']); // 默认展开所有一级目录
  const [allExpanded, setAllExpanded] = useState(true);

  const handleCatalogChange = (checkedKeys: any) => {
    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
    onChange({
      ...filter,
      catalogKeys: keys
    });
  };

  const handleAssetTypeChange = (checkedValues: string[]) => {
    onChange({
      ...filter,
      assetTypes: checkedValues
    });
  };

  const handleClear = () => {
    onChange({});
  };

  const hasActiveFilters = (filter.catalogKeys && filter.catalogKeys.length > 0) || 
                           (filter.assetTypes && filter.assetTypes.length > 0);

  // 获取所有可展开的节点key
  const getAllExpandableKeys = () => {
    const keys: string[] = [];
    const traverse = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          keys.push(node.key);
          traverse(node.children);
        }
      });
    };
    traverse(catalogTreeData);
    return keys;
  };

  // 全部展开
  const handleExpandAll = () => {
    const allKeys = getAllExpandableKeys();
    setExpandedKeys(allKeys);
    setAllExpanded(true);
  };

  // 全部合上
  const handleCollapseAll = () => {
    setExpandedKeys([]);
    setAllExpanded(false);
  };

  const handleExpand = (expandedKeys: string[]) => {
    setExpandedKeys(expandedKeys);
    const allKeys = getAllExpandableKeys();
    setAllExpanded(expandedKeys.length === allKeys.length);
  };

  return (
    <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 筛选标题 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f0f0f0',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FilterOutlined />
          <Title level={5} style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>筛选</Title>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* 展开/合上按钮 */}
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<ArrowsAltOutlined />}
              onClick={handleExpandAll}
              title="全部展开"
              style={{ 
                padding: '2px 4px',
                fontSize: '12px',
                color: allExpanded ? '#1890ff' : '#666',
                border: 'none'
              }}
            />
            <Button
              type="text"
              size="small"
              icon={<ShrinkOutlined />}
              onClick={handleCollapseAll}
              title="全部合上"
              style={{ 
                padding: '2px 4px',
                fontSize: '12px',
                color: !allExpanded ? '#1890ff' : '#666',
                border: 'none'
              }}
            />
          </Space>
          {hasActiveFilters && (
            <ClearOutlined 
              style={{ cursor: 'pointer', fontSize: '14px', color: '#1890ff', marginLeft: '4px' }} 
              onClick={handleClear}
              title="清除筛选"
            />
          )}
        </div>
      </div>
      {/* 可滚动内容区域 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* 资产目录 */}
        <div>
          <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            资产目录
          </Title>
          <Tree
            checkable
            checkedKeys={filter.catalogKeys || []}
            expandedKeys={expandedKeys}
            onCheck={handleCatalogChange}
            onExpand={handleExpand}
            treeData={catalogTreeData}
            showIcon
            blockNode
            style={{ 
              background: 'transparent',
              fontSize: '13px',
              minHeight: 'auto',
              padding: '4px 0'
            }}
          />
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* 资产分类 */}
        <div>
          <Title level={5} style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
            资产分类
          </Title>
          <Checkbox.Group
            value={filter.assetTypes || []}
            onChange={handleAssetTypeChange}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {ASSET_TYPES.map(type => (
                <Checkbox key={type.key} value={type.key} style={{ fontSize: '13px' }}>
                  <Space size={6}>
                    {type.icon}
                    {type.label}
                  </Space>
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
