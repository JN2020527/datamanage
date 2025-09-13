import React, { useMemo, useState, useCallback } from 'react';
import {
  Table,
  Empty,
  Typography,
  Button,
  Space,
  Pagination,
  Input,
  Select,
  Tag,
  message,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  SettingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';

const { Text } = Typography;

// 接口定义
interface FieldConfig {
  name: string;
  displayName: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  visible: boolean;
  width?: number;
  order: number;
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
  format?: string;
}

interface TableStyleConfig {
  theme: 'default' | 'simple' | 'bordered' | 'striped';
  headerStyle: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    textAlign: 'left' | 'center' | 'right';
  };
  bodyStyle: {
    fontSize: number;
    rowHeight: number;
    alternateRowColor: boolean;
    borderStyle: 'none' | 'horizontal' | 'vertical' | 'all';
  };
  colors: {
    primary: string;
    secondary: string;
    border: string;
    text: string;
  };
}

interface TablePreviewPanelProps {
  data: any[];
  fields: FieldConfig[];
  style: TableStyleConfig;
  onFieldsUpdate: (fields: FieldConfig[]) => void;
}

const TablePreviewPanel: React.FC<TablePreviewPanelProps> = ({
  data,
  fields,
  style,
  onFieldsUpdate
}) => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortInfo, setSortInfo] = useState<{ field: string; order: 'ascend' | 'descend' } | null>(null);

  // 格式化数值
  const formatValue = useCallback((value: any, field: FieldConfig) => {
    if (value === null || value === undefined) return '-';
    
    if (field.dataType === 'number') {
      const num = Number(value);
      if (isNaN(num)) return value;
      
      switch (field.format) {
        case 'currency':
          return `¥${num.toLocaleString()}`;
        case 'percentage':
          return `${(num * 100).toFixed(2)}%`;
        case 'decimal2':
          return num.toFixed(2);
        default:
          return num.toLocaleString();
      }
    }
    
    if (field.dataType === 'date') {
      try {
        const date = new Date(value);
        return date.toLocaleDateString('zh-CN');
      } catch {
        return value;
      }
    }
    
    return value;
  }, []);

  // 根据样式配置生成表格样式
  const tableStyles = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      fontSize: style.bodyStyle.fontSize,
    };

    const headerStyle: React.CSSProperties = {
      backgroundColor: style.headerStyle.backgroundColor,
      color: style.headerStyle.textColor,
      fontSize: style.headerStyle.fontSize,
      fontWeight: style.headerStyle.fontWeight,
      textAlign: style.headerStyle.textAlign,
    };

    let bordered = false;
    if (style.bodyStyle.borderStyle === 'all' || style.bodyStyle.borderStyle === 'vertical') {
      bordered = true;
    }

    return {
      baseStyle,
      headerStyle,
      bordered,
      size: 'middle' as const,
      rowClassName: (record: any, index: number) => {
        if (style.bodyStyle.alternateRowColor && index % 2 === 1) {
          return 'table-row-alternate';
        }
        return '';
      }
    };
  }, [style]);

  // 生成表格列配置
  const columns: ColumnsType<any> = useMemo(() => {
    return fields
      .filter(field => field.visible)
      .sort((a, b) => a.order - b.order)
      .map(field => ({
        title: field.displayName,
        dataIndex: field.name,
        key: field.name,
        width: field.width || 120,
        sorter: field.dataType === 'number' || field.dataType === 'date',
        sortOrder: sortInfo?.field === field.name ? sortInfo.order : null,
        ellipsis: {
          showTitle: false,
        },
        render: (value: any, record: any, index: number) => {
          const formattedValue = formatValue(value, field);
          
          return (
            <Tooltip title={formattedValue} placement="topLeft">
              <span style={{ 
                fontSize: style.bodyStyle.fontSize,
                color: style.colors.text 
              }}>
                {formattedValue}
              </span>
            </Tooltip>
          );
        },
        onHeaderCell: () => ({
          style: tableStyles.headerStyle,
        }),
      }));
  }, [fields, formatValue, sortInfo, style, tableStyles.headerStyle]);

  // 筛选和搜索数据
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // 应用搜索
    if (searchText) {
      result = result.filter(record => 
        Object.values(record).some(value => 
          String(value).toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
    
    // 应用排序
    if (sortInfo) {
      result.sort((a, b) => {
        const aVal = a[sortInfo.field];
        const bVal = b[sortInfo.field];
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal > bVal ? 1 : -1;
        return sortInfo.order === 'descend' ? -comparison : comparison;
      });
    }
    
    return result;
  }, [data, searchText, sortInfo]);

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // 处理表格变化
  const handleTableChange: TableProps<any>['onChange'] = useCallback((pagination, filters, sorter) => {
    if (Array.isArray(sorter)) {
      setSortInfo(sorter[0] ? {
        field: sorter[0].field as string,
        order: sorter[0].order as 'ascend' | 'descend'
      } : null);
    } else if (sorter) {
      setSortInfo({
        field: sorter.field as string,
        order: sorter.order as 'ascend' | 'descend'
      });
    } else {
      setSortInfo(null);
    }
  }, []);

  // 处理列宽调整
  const handleColumnResize = useCallback((field: string, width: number) => {
    const newFields = fields.map(f => 
      f.name === field ? { ...f, width } : f
    );
    onFieldsUpdate(newFields);
  }, [fields, onFieldsUpdate]);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setSearchText('');
    setSortInfo(null);
    message.success('数据已刷新');
  }, []);

  // 导出数据
  const handleExport = useCallback(() => {
    message.info('导出功能开发中...');
  }, []);

  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Empty 
          description="暂无数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Text type="secondary">
            请先在左侧配置数据源
          </Text>
        </Empty>
      </div>
    );
  }

  if (fields.filter(f => f.visible).length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Empty 
          description="暂无可显示的字段"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Text type="secondary">
            请先在左侧选择要显示的字段
          </Text>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <Space>
          <Input
            placeholder="搜索表格内容..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            value={pageSize}
            onChange={setPageSize}
            style={{ width: 120 }}
            options={[
              { value: 10, label: '10条/页' },
              { value: 20, label: '20条/页' },
              { value: 50, label: '50条/页' },
              { value: 100, label: '100条/页' }
            ]}
          />
        </Space>

        <Space>
          <Tag color="blue">
            共 {filteredData.length} 条数据
          </Tag>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            title="刷新数据"
          />
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            title="导出数据"
          />
          <Button 
            icon={<FullscreenOutlined />} 
            title="全屏预览"
          />
        </Space>
      </div>

      {/* 表格 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={paginatedData}
          pagination={false}
          onChange={handleTableChange}
          scroll={{ x: true, y: 'calc(100% - 60px)' }}
          size={tableStyles.size}
          bordered={tableStyles.bordered}
          rowClassName={tableStyles.rowClassName}
          rowKey={(record, index) => index?.toString() || Math.random().toString()}
          style={{
            ...tableStyles.baseStyle,
            height: '100%'
          }}
        />
      </div>

      {/* 分页器 */}
      {filteredData.length > pageSize && (
        <div style={{ 
          marginTop: 16, 
          display: 'flex', 
          justifyContent: 'center' 
        }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredData.length}
            onChange={setCurrentPage}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
            }
          />
        </div>
      )}

      {/* 动态样式 */}
      <style jsx global>{`
        .table-row-alternate {
          background-color: ${style.colors.secondary} !important;
        }
        
        .ant-table-thead > tr > th {
          background-color: ${style.headerStyle.backgroundColor} !important;
          color: ${style.headerStyle.textColor} !important;
          font-size: ${style.headerStyle.fontSize}px !important;
          font-weight: ${style.headerStyle.fontWeight} !important;
          text-align: ${style.headerStyle.textAlign} !important;
          border-color: ${style.colors.border} !important;
        }
        
        .ant-table-tbody > tr > td {
          border-color: ${style.colors.border} !important;
          height: ${style.bodyStyle.rowHeight}px !important;
          padding: 8px 16px !important;
        }
        
        .ant-table-tbody > tr:hover > td {
          background-color: ${style.colors.secondary} !important;
        }
        
        ${style.bodyStyle.borderStyle === 'none' ? `
          .ant-table-tbody > tr > td {
            border: none !important;
          }
        ` : ''}
        
        ${style.bodyStyle.borderStyle === 'horizontal' ? `
          .ant-table-tbody > tr > td {
            border-left: none !important;
            border-right: none !important;
          }
        ` : ''}
        
        ${style.bodyStyle.borderStyle === 'vertical' ? `
          .ant-table-tbody > tr > td {
            border-top: none !important;
            border-bottom: none !important;
          }
        ` : ''}
      `}</style>
    </div>
  );
};

export default TablePreviewPanel; 