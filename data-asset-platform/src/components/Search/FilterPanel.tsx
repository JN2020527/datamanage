import React, { useEffect, useState } from 'react';
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
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filter,
  onChange,
  collapsed = false,
}) => {
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
          <span>筛选条件</span>
          {filterCount > 0 && (
            <Badge count={filterCount} style={{ backgroundColor: '#1677FF' }}>
              <Button
                type="link"
                size="small"
                icon={<ClearOutlined />}
                onClick={handleClearAll}
              >
                清空
              </Button>
            </Badge>
          )}
        </div>
      }
      size="small"
      style={{ height: 'fit-content' }}
      bodyStyle={{ padding: '16px' }}
    >
      {/* 资产类型 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
          🗂️ 资产类型
        </div>
        <Checkbox.Group
          value={filter.assetTypes || []}
          onChange={handleAssetTypeChange}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {assetTypes.map(type => (
              <Checkbox key={type.value} value={type.value}>
                <span style={{ color: type.color, marginRight: '4px' }}>●</span>
                {type.label}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* 所属部门 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
          👥 所属部门
        </div>
        <Checkbox.Group
          value={filter.departments || []}
          onChange={handleDepartmentChange}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {departments.map(dept => (
              <Checkbox key={dept} value={dept}>
                {dept}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* 质量等级 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
          ⭐ 质量等级
        </div>
        <Checkbox.Group
          value={filter.qualityLevels || []}
          onChange={handleQualityLevelChange}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {qualityLevels.map(level => (
              <Checkbox key={level.value} value={level.value}>
                <span style={{ color: level.color, marginRight: '4px' }}>●</span>
                {level.label}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* 创建时间 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
          📅 创建时间
        </div>
        <RangePicker
          style={{ width: '100%' }}
          value={
            filter.dateRange
              ? [dayjs(filter.dateRange[0]), dayjs(filter.dateRange[1])]
              : null
          }
          onChange={handleDateRangeChange}
          placeholder={['开始日期', '结束日期']}
          allowClear
        />
      </div>

      {/* 快速筛选 */}
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
          🔥 快速筛选
        </div>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="text"
            size="small"
            block
            style={{ textAlign: 'left', padding: '4px 8px' }}
            onClick={() => handleDateRangeChange([dayjs().subtract(7, 'day'), dayjs()])}
          >
            最近一周
          </Button>
          <Button
            type="text"
            size="small"
            block
            style={{ textAlign: 'left', padding: '4px 8px' }}
            onClick={() => handleDateRangeChange([dayjs().subtract(30, 'day'), dayjs()])}
          >
            最近一月
          </Button>
          <Button
            type="text"
            size="small"
            block
            style={{ textAlign: 'left', padding: '4px 8px' }}
            onClick={() => handleQualityLevelChange(['excellent'])}
          >
            高质量资产
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default FilterPanel;
