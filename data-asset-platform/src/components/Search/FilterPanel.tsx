import React, { useEffect, useMemo, useState } from 'react';
import { Card, Checkbox, Button, Space, Badge } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { api } from '@mock/api';
import { ASSET_TYPES, QUALITY_LEVELS, DEPARTMENTS } from '@constants/assetConfig';
import type { SearchFilter, AssetType, QualityLevel } from '@types/index';


interface FilterPanelProps {
  filter: SearchFilter;
  onChange: (filter: SearchFilter) => void;
  collapsed?: boolean;
  fullHeight?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filter,
  onChange,
  collapsed = false,
  fullHeight = false,
}) => {
  const [catalogTree, setCatalogTree] = useState<any[]>([]);

  useEffect(() => {
    // 读取目录管理本地配置
    try {
      const raw = localStorage.getItem('dap_catalog_tree_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        const tree = Array.isArray(parsed) ? parsed : parsed?.tree;
        if (Array.isArray(tree)) setCatalogTree(tree);
      }
    } catch (error) {
      console.error('读取目录配置失败:', error);
    }
  }, []);

  const handleAssetTypeChange = (checkedValues: AssetType[]) => {
    onChange({
      ...filter,
      assetTypes: checkedValues,
    });
  };

  const handleDepartmentChange = (checkedValues: string[]) => {
    onChange({
      ...filter,
      departments: checkedValues,
    });
  };

  const handleQualityLevelChange = (checkedValues: QualityLevel[]) => {
    onChange({
      ...filter,
      qualityLevels: checkedValues,
    });
  };

  const handleClearAll = () => {
    onChange({
      keyword: filter.keyword, // 保留搜索关键词
    });
  };

  // 计算当前筛选条件数量
  const filterCount = useMemo(() => {
    let count = 0;
    if (filter.assetTypes?.length) count++;
    if (filter.departments?.length) count++;
    if (filter.qualityLevels?.length) count++;
    if (filter.catalogKeys?.length) count++;
    return count;
  }, [filter]);

  const catalogGroups = useMemo(() => {
    const groups: Array<{ title: string; options: Array<{ label: string; value: string }> }> = [];
    const visit = (nodes: any[], parentTitle?: string) => {
      nodes?.forEach(n => {
        if (n.type === 'folder' && n.children?.length) {
          const options = n.children
            .filter((c: any) => c.visible !== false)
            .map((c: any) => ({ label: c.title, value: c.key }));
          if (options.length) groups.push({ title: n.title, options });
        } else if (n.children?.length) {
          visit(n.children, n.title);
        }
      });
    };
    visit(catalogTree);
    return groups;
  }, [catalogTree]);

  const handleCatalogChange = (checkedValues: string[]) => {
    onChange({
      ...filter,
      catalogKeys: checkedValues,
    });
  };

  if (collapsed) {
    return (
      <div style={{ padding: '16px 0' }}>
        <Badge count={filterCount} offset={[8, 0]}>
          <Button type="text" icon={<ClearOutlined />} disabled>
            筛选条件
          </Button>
        </Badge>
      </div>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* 资产类型筛选 */}
      <Card
        title="资产类型"
        size="small"
        extra={
          filter.assetTypes?.length ? (
            <Button 
              type="link" 
              size="small" 
              onClick={() => onChange({ ...filter, assetTypes: [] })}
            >
              清空
            </Button>
          ) : null
        }
      >
        <Checkbox.Group
          value={filter.assetTypes || []}
          onChange={handleAssetTypeChange}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {ASSET_TYPES.map(type => (
              <Checkbox key={type.value} value={type.value}>
                <span style={{ color: type.color }}>
                  {type.icon} {type.label}
                </span>
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </Card>

      {/* 所属部门筛选 */}
      <Card
        title="所属部门"
        size="small"
        extra={
          filter.departments?.length ? (
            <Button 
              type="link" 
              size="small" 
              onClick={() => onChange({ ...filter, departments: [] })}
            >
              清空
            </Button>
          ) : null
        }
      >
        <Checkbox.Group
          value={filter.departments || []}
          onChange={handleDepartmentChange}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {DEPARTMENTS.map(dept => (
              <Checkbox key={dept.value} value={dept.value}>
                <span style={{ color: dept.color }}>
                  {dept.label}
                </span>
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </Card>

      {/* 质量等级筛选 */}
      <Card
        title="质量等级"
        size="small"
        extra={
          filter.qualityLevels?.length ? (
            <Button 
              type="link" 
              size="small" 
              onClick={() => onChange({ ...filter, qualityLevels: [] })}
            >
              清空
            </Button>
          ) : null
        }
      >
        <Checkbox.Group
          value={filter.qualityLevels || []}
          onChange={handleQualityLevelChange}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {QUALITY_LEVELS.map(level => (
              <Checkbox key={level.value} value={level.value}>
                <span style={{ color: level.color }}>
                  {level.label}
                </span>
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </Card>

      {/* 目录结构筛选 */}
      {catalogGroups.length > 0 && (
        <Card
          title="目录结构"
          size="small"
          extra={
            filter.catalogKeys?.length ? (
              <Button 
                type="link" 
                size="small" 
                onClick={() => onChange({ ...filter, catalogKeys: [] })}
              >
                清空
              </Button>
            ) : null
          }
        >
          {catalogGroups.map(group => (
            <div key={group.title} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#595959', marginBottom: 8 }}>
                {group.title}
              </div>
              <Checkbox.Group
                value={filter.catalogKeys || []}
                onChange={handleCatalogChange}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {group.options.map(op => (
                    <Checkbox key={op.value} value={op.value}>
                      {op.label}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </div>
          ))}
        </Card>
      )}

      {/* 清空所有筛选 */}
      {filterCount > 0 && (
        <Button 
          block 
          icon={<ClearOutlined />} 
          onClick={handleClearAll}
        >
          清空所有筛选 ({filterCount})
        </Button>
      )}
    </Space>
  );
};

export default FilterPanel;
