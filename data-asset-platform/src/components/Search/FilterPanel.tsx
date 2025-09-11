import React, { useEffect, useMemo, useState } from 'react';
import { Card, Checkbox, DatePicker, Button, Space, Divider, Badge } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { api } from '@mock/api';
import type { SearchFilter, AssetType, QualityLevel } from '@types/index';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

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
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogTree, setCatalogTree] = useState<any[]>([]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const { data } = await api.getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error('加载部门列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
    // 读取目录管理本地配置
    try {
      const raw = localStorage.getItem('dap_catalog_tree_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        const tree = Array.isArray(parsed) ? parsed : parsed?.tree;
        if (Array.isArray(tree)) setCatalogTree(tree);
      }
    } catch {}
  }, []);

  const assetTypes: { label: string; value: AssetType; color: string }[] = [
    { label: '数据表', value: 'table', color: '#1677FF' },
    { label: '数据模型', value: 'model', color: '#722ED1' },
    { label: '报表', value: 'report', color: '#52C41A' },
    { label: '看板', value: 'dashboard', color: '#FAAD14' },
  ];

  const qualityLevels: { label: string; value: QualityLevel; color: string }[] = [
    { label: '优秀 (90-100分)', value: 'excellent', color: '#52C41A' },
    { label: '良好 (80-89分)', value: 'good', color: '#1677FF' },
    { label: '一般 (70-79分)', value: 'fair', color: '#FAAD14' },
    { label: '待改进 (<70分)', value: 'poor', color: '#FF4D4F' },
  ];

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

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      onChange({
        ...filter,
        dateRange: [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')],
      });
    } else {
      onChange({
        ...filter,
        dateRange: undefined,
      });
    }
  };

  const handleClearAll = () => {
    onChange({
      keyword: filter.keyword, // 保留搜索关键词
    });
  };

  // 计算当前筛选条件数量
  const getFilterCount = () => {
    let count = 0;
    if (filter.assetTypes?.length) count++;
    if (filter.departments?.length) count++;
    if (filter.qualityLevels?.length) count++;
    if (filter.dateRange?.length) count++;
    return count;
  };

  const filterCount = getFilterCount();

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
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>目录结构</span>
          {(filter.catalogKeys?.length || 0) > 0 && (
            <Button type="link" size="small" onClick={() => onChange({ ...filter, catalogKeys: [] })}>清空</Button>
          )}
        </div>
      }
      size="small"
      style={{ height: fullHeight ? '100%' : 'fit-content', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ padding: '8px', flex: 1, overflow: 'auto' }}
    >
      {catalogGroups.length === 0 ? (
        <div style={{ color: '#8c8c8c', fontSize: 13 }}>请先在 系统管理 → 目录管理 中配置目录。</div>
      ) : (
        catalogGroups.map(group => (
          <div key={group.title} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#595959', marginBottom: 8 }}>{group.title}</div>
            <Checkbox.Group
              value={filter.catalogKeys || []}
              onChange={handleCatalogChange}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {group.options.map(op => (
                  <Checkbox key={op.value} value={op.value}>{op.label}</Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </div>
        ))
      )}
    </Card>
  );
};

export default FilterPanel;
