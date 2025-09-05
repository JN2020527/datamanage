import React, { useState, useEffect } from 'react';
import {
  Card,
  Collapse,
  Checkbox,
  Radio,
  Slider,
  DatePicker,
  Select,
  Input,
  Space,
  Button,
  Tag,
  Badge,
  Typography,
  Divider,
  Tooltip,
  Switch
} from 'antd';
import {
  FilterOutlined,
  ClearOutlined,
  SaveOutlined,
  HistoryOutlined,
  StarOutlined,
  CalendarOutlined,
  UserOutlined,
  DatabaseOutlined,
  TagOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { searchHistory } from '@utils/searchHistory';
import dayjs from 'dayjs';

const { Panel } = Collapse;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface FilterConfig {
  key: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'date' | 'select' | 'input' | 'tags';
  options?: Array<{ label: string; value: any; count?: number }>;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  multiple?: boolean;
}

interface EnhancedFilterProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange?: (key: string, value: any) => void;
  onReset?: () => void;
  onSave?: (name: string, filters: Record<string, any>) => void;
  savedFilters?: Array<{ name: string; filters: Record<string, any> }>;
  className?: string;
  collapsible?: boolean;
  showFilterCount?: boolean;
  autoApply?: boolean;
}

const EnhancedFilter: React.FC<EnhancedFilterProps> = ({
  filters,
  values,
  onChange,
  onReset,
  onSave,
  savedFilters = [],
  className = '',
  collapsible = true,
  showFilterCount = true,
  autoApply = false
}) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [filterStats, setFilterStats] = useState<Record<string, number>>({});
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['basic']);

  // 计算活跃过滤器数量
  const getActiveFilterCount = () => {
    return Object.keys(values).filter(key => {
      const value = values[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return value !== undefined && value !== null && value !== '';
    }).length;
  };

  // 更新过滤器值
  const handleFilterChange = (key: string, value: any) => {
    const newValues = { ...values, [key]: value };
    
    if (autoApply) {
      onChange?.(key, value);
    } else {
      setActiveFilters(newValues);
    }
  };

  // 应用过滤器
  const handleApplyFilters = () => {
    Object.keys(activeFilters).forEach(key => {
      onChange?.(key, activeFilters[key]);
    });
    setActiveFilters({});
  };

  // 重置过滤器
  const handleReset = () => {
    onReset?.();
    setActiveFilters({});
  };

  // 保存过滤器配置
  const handleSaveFilter = () => {
    if (saveFilterName.trim()) {
      onSave?.(saveFilterName.trim(), values);
      setSaveFilterName('');
      setShowSaveModal(false);
    }
  };

  // 渲染不同类型的过滤器
  const renderFilter = (filter: FilterConfig) => {
    const currentValue = values[filter.key] || filter.defaultValue;
    const pendingValue = activeFilters[filter.key];
    const displayValue = pendingValue !== undefined ? pendingValue : currentValue;

    switch (filter.type) {
      case 'checkbox':
        return (
          <Checkbox.Group
            value={displayValue || []}
            onChange={(value) => handleFilterChange(filter.key, value)}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              {filter.options?.map(option => (
                <div key={option.value} className="flex items-center justify-between w-full">
                  <Checkbox value={option.value}>
                    {option.label}
                  </Checkbox>
                  {showFilterCount && option.count !== undefined && (
                    <Badge count={option.count} size="small" />
                  )}
                </div>
              ))}
            </Space>
          </Checkbox.Group>
        );

      case 'radio':
        return (
          <Radio.Group
            value={displayValue}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              {filter.options?.map(option => (
                <div key={option.value} className="flex items-center justify-between w-full">
                  <Radio value={option.value}>
                    {option.label}
                  </Radio>
                  {showFilterCount && option.count !== undefined && (
                    <Badge count={option.count} size="small" />
                  )}
                </div>
              ))}
            </Space>
          </Radio.Group>
        );

      case 'range':
        return (
          <div className="px-2">
            <Slider
              range
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              value={displayValue || [filter.min || 0, filter.max || 100]}
              onChange={(value) => handleFilterChange(filter.key, value)}
              tooltip={{
                formatter: (value) => `${value}${filter.key === 'qualityScore' ? '%' : ''}`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{filter.min || 0}</span>
              <span>{filter.max || 100}</span>
            </div>
          </div>
        );

      case 'date':
        return (
          <RangePicker
            value={displayValue ? [dayjs(displayValue[0]), dayjs(displayValue[1])] : null}
            onChange={(dates, dateStrings) => 
              handleFilterChange(filter.key, dateStrings)
            }
            placeholder={['开始日期', '结束日期']}
            className="w-full"
          />
        );

      case 'select':
        return (
          <Select
            mode={filter.multiple ? 'multiple' : undefined}
            value={displayValue}
            onChange={(value) => handleFilterChange(filter.key, value)}
            placeholder={filter.placeholder}
            className="w-full"
            showSearch
            filterOption={(input, option) =>
              (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {filter.options?.map(option => (
              <Option key={option.value} value={option.value}>
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {showFilterCount && option.count !== undefined && (
                    <Badge count={option.count} size="small" />
                  )}
                </div>
              </Option>
            ))}
          </Select>
        );

      case 'input':
        return (
          <Input
            value={displayValue || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            allowClear
          />
        );

      case 'tags':
        return (
          <div>
            <Select
              mode="tags"
              value={displayValue || []}
              onChange={(value) => handleFilterChange(filter.key, value)}
              placeholder={filter.placeholder}
              className="w-full"
              tokenSeparators={[',']}
            />
            {filter.options && filter.options.length > 0 && (
              <div className="mt-2">
                <Text type="secondary" className="text-xs">常用标签：</Text>
                <div className="mt-1">
                  <Space wrap>
                    {filter.options.slice(0, 8).map(option => (
                      <Tag
                        key={option.value}
                        className="cursor-pointer"
                        onClick={() => {
                          const currentTags = displayValue || [];
                          if (!currentTags.includes(option.value)) {
                            handleFilterChange(filter.key, [...currentTags, option.value]);
                          }
                        }}
                      >
                        {option.label}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // 分组过滤器
  const filterGroups = {
    basic: filters.filter(f => ['type', 'status', 'qualityScore'].includes(f.key)),
    advanced: filters.filter(f => ['owner', 'tags', 'dateRange'].includes(f.key)),
    custom: filters.filter(f => !['type', 'status', 'qualityScore', 'owner', 'tags', 'dateRange'].includes(f.key))
  };

  const activeFilterCount = getActiveFilterCount();
  const hasPendingChanges = Object.keys(activeFilters).length > 0;

  return (
    <Card
      className={`enhanced-filter ${className}`}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterOutlined />
            <span>筛选器</span>
            {activeFilterCount > 0 && (
              <Badge count={activeFilterCount} size="small" />
            )}
          </div>
          <Space>
            {hasPendingChanges && !autoApply && (
              <Button size="small" type="primary" onClick={handleApplyFilters}>
                应用
              </Button>
            )}
            <Button
              size="small"
              icon={<ClearOutlined />}
              onClick={handleReset}
              disabled={activeFilterCount === 0}
            >
              重置
            </Button>
          </Space>
        </div>
      }
      styles={{ body: { padding: '16px' } }}
    >
      {/* 已保存的过滤器 */}
      {savedFilters.length > 0 && (
        <div className="mb-4">
          <Text type="secondary" className="text-xs block mb-2">
            <HistoryOutlined className="mr-1" />
            已保存的筛选
          </Text>
          <Space wrap>
            {savedFilters.map((saved, index) => (
              <Tag
                key={index}
                icon={<StarOutlined />}
                className="cursor-pointer"
                onClick={() => {
                  Object.keys(saved.filters).forEach(key => {
                    onChange?.(key, saved.filters[key]);
                  });
                }}
              >
                {saved.name}
              </Tag>
            ))}
          </Space>
          <Divider className="my-3" />
        </div>
      )}

      {/* 过滤器面板 */}
      {collapsible ? (
        <Collapse
          activeKey={expandedPanels}
          onChange={setExpandedPanels}
          ghost
          expandIconPosition="end"
        >
          {filterGroups.basic.length > 0 && (
            <Panel
              header={
                <div className="flex items-center gap-2">
                  <DatabaseOutlined />
                  <span>基础筛选</span>
                </div>
              }
              key="basic"
            >
              <Space direction="vertical" className="w-full" size="large">
                {filterGroups.basic.map(filter => (
                  <motion.div
                    key={filter.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-2">
                      <Text strong className="text-sm">{filter.label}</Text>
                    </div>
                    {renderFilter(filter)}
                  </motion.div>
                ))}
              </Space>
            </Panel>
          )}

          {filterGroups.advanced.length > 0 && (
            <Panel
              header={
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  <span>高级筛选</span>
                </div>
              }
              key="advanced"
            >
              <Space direction="vertical" className="w-full" size="large">
                {filterGroups.advanced.map(filter => (
                  <motion.div
                    key={filter.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-2">
                      <Text strong className="text-sm">{filter.label}</Text>
                    </div>
                    {renderFilter(filter)}
                  </motion.div>
                ))}
              </Space>
            </Panel>
          )}

          {filterGroups.custom.length > 0 && (
            <Panel
              header={
                <div className="flex items-center gap-2">
                  <TagOutlined />
                  <span>自定义筛选</span>
                </div>
              }
              key="custom"
            >
              <Space direction="vertical" className="w-full" size="large">
                {filterGroups.custom.map(filter => (
                  <motion.div
                    key={filter.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-2">
                      <Text strong className="text-sm">{filter.label}</Text>
                    </div>
                    {renderFilter(filter)}
                  </motion.div>
                ))}
              </Space>
            </Panel>
          )}
        </Collapse>
      ) : (
        <Space direction="vertical" className="w-full" size="large">
          {filters.map(filter => (
            <motion.div
              key={filter.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-2">
                <Text strong className="text-sm">{filter.label}</Text>
              </div>
              {renderFilter(filter)}
            </motion.div>
          ))}
        </Space>
      )}

      {/* 保存过滤器 */}
      {onSave && activeFilterCount > 0 && (
        <>
          <Divider className="my-4" />
          <div className="flex items-center gap-2">
            <Input
              placeholder="保存筛选配置"
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              size="small"
              className="flex-1"
            />
            <Button
              size="small"
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveFilter}
              disabled={!saveFilterName.trim()}
            >
              保存
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default EnhancedFilter;
