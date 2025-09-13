import React, { useState, useCallback } from 'react';
import {
  Space,
  Tabs,
  Upload,
  Button,
  Select,
  Table,
  Checkbox,
  Input,
  Form,
  Card,
  Tag,
  Divider,
  Typography,
  Switch,
  InputNumber,
  Radio,
  message,
  Modal,
  Row,
  Col,
  Collapse,
  Tooltip,
  Tree
} from 'antd';
import {
  UploadOutlined,
  DatabaseOutlined,
  ApiOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  DragOutlined,
  SettingOutlined,
  LinkOutlined,
  TableOutlined,
  DownOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// 表关联配置接口
interface TableJoin {
  id: string;
  leftTable: string;
  rightTable: string;
  leftField: string;
  rightField: string;
  joinType: 'inner' | 'left' | 'right' | 'full';
  alias?: string;
}

// 数据表配置接口
interface TableConfig {
  id: string;
  name: string;
  alias: string;
  fields: Array<{
    name: string;
    displayName: string;
    dataType: 'string' | 'number' | 'date' | 'boolean';
  }>;
  isMain?: boolean;
}

// 扩展的数据源配置接口
interface DataSourceConfig {
  type: 'database' | 'excel' | 'csv' | 'api' | 'manual';
  connection?: {
    database?: string;
    table?: string;
    query?: string;
  };
  data: any[];
  preview: any[];
  // 多表关联配置
  multiTable?: {
    enabled: boolean;
    tables: TableConfig[];
    joins: TableJoin[];
  };
}

interface FieldConfig {
  name: string;
  displayName: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  visible: boolean;
  width?: number;
  order: number;
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
  format?: string;
  // 添加表来源标识
  tableId?: string;
  tableName?: string;
  fullName?: string; // 如 table1.field1
}

interface FilterCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | 'like' | 'in';
  value: any;
  logic?: 'and' | 'or';
}

interface DataConfigPanelProps {
  dataSource: DataSourceConfig;
  fields: FieldConfig[];
  filters: FilterCondition[];
  groupBy: string[];
  orderBy: Array<{ field: string; direction: 'asc' | 'desc' }>;
  onDataSourceUpdate: (dataSource: DataSourceConfig) => void;
  onFieldsUpdate: (fields: FieldConfig[]) => void;
  onFiltersUpdate: (filters: FilterCondition[]) => void;
  onGroupByUpdate: (groupBy: string[]) => void;
  onOrderByUpdate: (orderBy: Array<{ field: string; direction: 'asc' | 'desc' }>) => void;
}

const DataConfigPanel: React.FC<DataConfigPanelProps> = ({
  dataSource,
  fields,
  filters,
  groupBy,
  orderBy,
  onDataSourceUpdate,
  onFieldsUpdate,
  onFiltersUpdate,
  onGroupByUpdate,
  onOrderByUpdate
}) => {
  const [activeTab, setActiveTab] = useState('dataSource');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [tempData, setTempData] = useState<any[]>([]);

  // 模拟数据库表列表
  const mockTables = [
    { value: 'sales_data', label: '销售数据表' },
    { value: 'user_info', label: '用户信息表' },
    { value: 'product_info', label: '产品信息表' },
    { value: 'order_details', label: '订单详情表' }
  ];

  // 模拟示例数据
  const generateSampleData = useCallback((type: string) => {
    switch (type) {
      case 'sales':
        return [
          { id: 1, product: 'iPhone 14', category: '手机', price: 5999, quantity: 10, date: '2024-01-15', region: '华东' },
          { id: 2, product: 'MacBook Pro', category: '电脑', price: 12999, quantity: 5, date: '2024-01-16', region: '华北' },
          { id: 3, product: 'iPad Air', category: '平板', price: 3999, quantity: 8, date: '2024-01-17', region: '华南' },
          { id: 4, product: 'Apple Watch', category: '手表', price: 2999, quantity: 15, date: '2024-01-18', region: '华东' },
          { id: 5, product: 'AirPods Pro', category: '耳机', price: 1999, quantity: 20, date: '2024-01-19', region: '华西' }
        ];
      case 'users':
        return [
          { id: 1, name: '张三', age: 28, city: '北京', department: '技术部', salary: 15000, joinDate: '2022-01-15' },
          { id: 2, name: '李四', age: 32, city: '上海', department: '销售部', salary: 12000, joinDate: '2021-03-20' },
          { id: 3, name: '王五', age: 26, city: '深圳', department: '市场部', salary: 10000, joinDate: '2023-05-10' },
          { id: 4, name: '赵六', age: 35, city: '杭州', department: '技术部', salary: 18000, joinDate: '2020-12-01' },
          { id: 5, name: '钱七', age: 29, city: '广州', department: '人事部', salary: 11000, joinDate: '2022-08-15' }
        ];
      default:
        return [];
    }
  }, []);

  // 从数据自动推断字段配置
  const inferFieldsFromData = useCallback((data: any[]) => {
    if (!data || data.length === 0) return [];

    const sample = data[0];
    return Object.keys(sample).map((key, index) => {
      const value = sample[key];
      let dataType: 'string' | 'number' | 'date' | 'boolean' = 'string';
      
      if (typeof value === 'number') {
        dataType = 'number';
      } else if (typeof value === 'boolean') {
        dataType = 'boolean';
      } else if (value && !isNaN(Date.parse(value))) {
        dataType = 'date';
      }

      return {
        name: key,
        displayName: key,
        dataType,
        visible: true,
        order: index,
        width: 120
      };
    });
  }, []);

  // 多表关联相关函数
  const handleEnableMultiTable = useCallback(() => {
    onDataSourceUpdate({
      ...dataSource,
      multiTable: {
        enabled: true,
        tables: [],
        joins: []
      }
    });
  }, [dataSource, onDataSourceUpdate]);

  const handleAddTable = useCallback((tableName: string) => {
    if (!dataSource.multiTable) return;
    
    const mockData = generateSampleData(tableName === 'sales_data' ? 'sales' : 'users');
    const fields = inferFieldsFromData(mockData);
    
    const newTable: TableConfig = {
      id: `table_${Date.now()}`,
      name: tableName,
      alias: tableName.replace('_', ''),
      fields: fields.map(f => ({
        name: f.name,
        displayName: f.displayName,
        dataType: f.dataType
      })),
      isMain: dataSource.multiTable.tables.length === 0
    };

    onDataSourceUpdate({
      ...dataSource,
      multiTable: {
        ...dataSource.multiTable,
        tables: [...dataSource.multiTable.tables, newTable]
      }
    });
  }, [dataSource, onDataSourceUpdate, generateSampleData, inferFieldsFromData]);

  const handleAddJoin = useCallback(() => {
    if (!dataSource.multiTable || dataSource.multiTable.tables.length < 2) return;

    const newJoin: TableJoin = {
      id: `join_${Date.now()}`,
      leftTable: dataSource.multiTable.tables[0].id,
      rightTable: dataSource.multiTable.tables[1].id,
      leftField: '',
      rightField: '',
      joinType: 'inner'
    };

    onDataSourceUpdate({
      ...dataSource,
      multiTable: {
        ...dataSource.multiTable,
        joins: [...dataSource.multiTable.joins, newJoin]
      }
    });
  }, [dataSource, onDataSourceUpdate]);

  const handleUpdateJoin = useCallback((joinId: string, updates: Partial<TableJoin>) => {
    if (!dataSource.multiTable) return;

    onDataSourceUpdate({
      ...dataSource,
      multiTable: {
        ...dataSource.multiTable,
        joins: dataSource.multiTable.joins.map(join =>
          join.id === joinId ? { ...join, ...updates } : join
        )
      }
    });
  }, [dataSource, onDataSourceUpdate]);

  const handleRemoveJoin = useCallback((joinId: string) => {
    if (!dataSource.multiTable) return;

    onDataSourceUpdate({
      ...dataSource,
      multiTable: {
        ...dataSource.multiTable,
        joins: dataSource.multiTable.joins.filter(join => join.id !== joinId)
      }
    });
  }, [dataSource, onDataSourceUpdate]);

  // 处理数据源类型变更
  const handleDataSourceTypeChange = useCallback((type: DataSourceConfig['type']) => {
    const newDataSource: DataSourceConfig = {
      ...dataSource,
      type,
      data: [],
      preview: []
    };

    if (type === 'manual') {
      // 提供示例数据选择
      setIsUploadModalOpen(true);
    }

    onDataSourceUpdate(newDataSource);
  }, [dataSource, onDataSourceUpdate]);

  // 处理示例数据选择
  const handleSampleDataSelect = useCallback((type: string) => {
    const sampleData = generateSampleData(type);
    const newFields = inferFieldsFromData(sampleData);
    
    onDataSourceUpdate({
      ...dataSource,
      type: 'manual',
      data: sampleData,
      preview: sampleData.slice(0, 5)
    });
    
    onFieldsUpdate(newFields);
    setIsUploadModalOpen(false);
    message.success('示例数据加载成功！');
  }, [dataSource, onDataSourceUpdate, onFieldsUpdate, generateSampleData, inferFieldsFromData]);

  // 处理文件上传
  const handleFileUpload: UploadProps['customRequest'] = useCallback((options) => {
    const { file, onSuccess, onError } = options;
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // 这里应该解析Excel/CSV文件
          // 暂时使用模拟数据
          const mockData = generateSampleData('sales');
          const newFields = inferFieldsFromData(mockData);
          
          onDataSourceUpdate({
            ...dataSource,
            type: 'excel',
            data: mockData,
            preview: mockData.slice(0, 5)
          });
          
          onFieldsUpdate(newFields);
          onSuccess?.('ok');
          message.success('文件上传成功！');
        } catch (parseError) {
          onError?.(parseError as Error);
          message.error('文件解析失败');
        }
      };
      reader.readAsArrayBuffer(file as File);
    } catch (error) {
      onError?.(error as Error);
      message.error('文件上传失败');
    }
  }, [dataSource, onDataSourceUpdate, onFieldsUpdate, generateSampleData, inferFieldsFromData]);

  // 处理数据库表选择
  const handleTableSelect = useCallback((tableName: string) => {
    // 模拟从数据库加载数据
    const mockData = generateSampleData('users');
    const newFields = inferFieldsFromData(mockData);
    
    onDataSourceUpdate({
      ...dataSource,
      connection: {
        ...dataSource.connection,
        table: tableName
      },
      data: mockData,
      preview: mockData.slice(0, 5)
    });
    
    onFieldsUpdate(newFields);
    message.success('数据表加载成功！');
  }, [dataSource, onDataSourceUpdate, onFieldsUpdate, generateSampleData, inferFieldsFromData]);

  // 处理字段可见性变更
  const handleFieldVisibilityChange = useCallback((fieldName: string, visible: boolean) => {
    const newFields = fields.map(field => 
      field.name === fieldName ? { ...field, visible } : field
    );
    onFieldsUpdate(newFields);
  }, [fields, onFieldsUpdate]);

  // 处理字段显示名称变更
  const handleFieldDisplayNameChange = useCallback((fieldName: string, displayName: string) => {
    const newFields = fields.map(field => 
      field.name === fieldName ? { ...field, displayName } : field
    );
    onFieldsUpdate(newFields);
  }, [fields, onFieldsUpdate]);

  // 处理字段格式变更
  const handleFieldFormatChange = useCallback((fieldName: string, format: string) => {
    const newFields = fields.map(field => 
      field.name === fieldName ? { ...field, format } : field
    );
    onFieldsUpdate(newFields);
  }, [fields, onFieldsUpdate]);

  // 添加筛选条件
  const handleAddFilter = useCallback(() => {
    const newFilter: FilterCondition = {
      field: fields.find(f => f.visible)?.name || '',
      operator: '=',
      value: '',
      logic: 'and'
    };
    onFiltersUpdate([...filters, newFilter]);
  }, [fields, filters, onFiltersUpdate]);

  // 删除筛选条件
  const handleRemoveFilter = useCallback((index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    onFiltersUpdate(newFilters);
  }, [filters, onFiltersUpdate]);

  // 更新筛选条件
  const handleFilterChange = useCallback((index: number, key: keyof FilterCondition, value: any) => {
    const newFilters = filters.map((filter, i) => 
      i === index ? { ...filter, [key]: value } : filter
    );
    onFiltersUpdate(newFilters);
  }, [filters, onFiltersUpdate]);

  // 渲染多表关联配置
  const renderMultiTableConfig = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {/* 表列表 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>数据表</Text>
          <Select
            style={{ width: 120 }}
            placeholder="添加表"
            value=""
            onChange={handleAddTable}
            options={mockTables}
          />
        </div>
        
        {dataSource.multiTable?.tables.map((table, index) => (
          <Card 
            key={table.id} 
            size="small" 
            style={{ marginBottom: 8 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TableOutlined />
                <span>{table.name}</span>
                {table.isMain && <Tag color="green">主表</Tag>}
              </div>
            }
            extra={
              dataSource.multiTable!.tables.length > 1 && (
                <Button 
                  type="text" 
                  danger 
                  size="small"
                  onClick={() => {
                    onDataSourceUpdate({
                      ...dataSource,
                      multiTable: {
                        ...dataSource.multiTable!,
                        tables: dataSource.multiTable!.tables.filter(t => t.id !== table.id)
                      }
                    });
                  }}
                >
                  删除
                </Button>
              )
            }
          >
            <Space wrap>
              {table.fields.slice(0, 6).map(field => (
                <Tag key={field.name} color="blue">{field.name}</Tag>
              ))}
              {table.fields.length > 6 && <Tag>+{table.fields.length - 6}个字段</Tag>}
            </Space>
          </Card>
        ))}
      </div>

      {/* 表关联配置 */}
      {dataSource.multiTable?.tables.length >= 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong>表关联</Text>
            <Button
              size="small"
              icon={<LinkOutlined />}
              onClick={handleAddJoin}
              disabled={dataSource.multiTable?.tables.length < 2}
            >
              添加关联
            </Button>
          </div>

          {dataSource.multiTable?.joins.map((join) => {
            const leftTable = dataSource.multiTable!.tables.find(t => t.id === join.leftTable);
            const rightTable = dataSource.multiTable!.tables.find(t => t.id === join.rightTable);
            
            return (
              <Card key={join.id} size="small" style={{ marginBottom: 8 }}>
                <Row gutter={[8, 8]}>
                  <Col span={10}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>左表.字段</Text>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Select
                          size="small"
                          style={{ flex: 1 }}
                          value={join.leftTable}
                          onChange={(value) => handleUpdateJoin(join.id, { leftTable: value })}
                          options={dataSource.multiTable!.tables.map(t => ({ 
                            value: t.id, 
                            label: t.name 
                          }))}
                        />
                        <Select
                          size="small"
                          style={{ flex: 1 }}
                          value={join.leftField}
                          onChange={(value) => handleUpdateJoin(join.id, { leftField: value })}
                          options={leftTable?.fields.map(f => ({ 
                            value: f.name, 
                            label: f.name 
                          })) || []}
                          placeholder="字段"
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={4}>
                    <div style={{ textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>关联类型</Text>
                      <Select
                        size="small"
                        style={{ width: '100%' }}
                        value={join.joinType}
                        onChange={(value) => handleUpdateJoin(join.id, { joinType: value })}
                        options={[
                          { value: 'inner', label: 'INNER' },
                          { value: 'left', label: 'LEFT' },
                          { value: 'right', label: 'RIGHT' },
                          { value: 'full', label: 'FULL' }
                        ]}
                      />
                    </div>
                  </Col>
                  <Col span={10}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>右表.字段</Text>
                        <Button
                          type="text"
                          danger
                          size="small"
                          onClick={() => handleRemoveJoin(join.id)}
                        >
                          删除
                        </Button>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Select
                          size="small"
                          style={{ flex: 1 }}
                          value={join.rightTable}
                          onChange={(value) => handleUpdateJoin(join.id, { rightTable: value })}
                          options={dataSource.multiTable!.tables.map(t => ({ 
                            value: t.id, 
                            label: t.name 
                          }))}
                        />
                        <Select
                          size="small"
                          style={{ flex: 1 }}
                          value={join.rightField}
                          onChange={(value) => handleUpdateJoin(join.id, { rightField: value })}
                          options={rightTable?.fields.map(f => ({ 
                            value: f.name, 
                            label: f.name 
                          })) || []}
                          placeholder="字段"
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </div>
      )}

      {/* 关联预览 */}
      {dataSource.multiTable?.tables.length > 0 && (
        <div>
          <Text strong>关联预览</Text>
          <Card size="small" style={{ marginTop: 8, backgroundColor: '#fafafa' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
              <div>SELECT *</div>
              <div>FROM {dataSource.multiTable.tables.find(t => t.isMain)?.name || dataSource.multiTable.tables[0]?.name}</div>
              {dataSource.multiTable.joins.map((join) => {
                const leftTable = dataSource.multiTable!.tables.find(t => t.id === join.leftTable);
                const rightTable = dataSource.multiTable!.tables.find(t => t.id === join.rightTable);
                return (
                  <div key={join.id}>
                    {join.joinType.toUpperCase()} JOIN {rightTable?.name} ON {leftTable?.name}.{join.leftField} = {rightTable?.name}.{join.rightField}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </Space>
  );

  // 渲染数据源配置
  const renderDataSourceConfig = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>数据源类型</Text>
        <Select
          style={{ width: '100%', marginTop: 8 }}
          value={dataSource.type}
          onChange={handleDataSourceTypeChange}
          options={[
            { value: 'manual', label: '手工录入', icon: <EditOutlined /> },
            { value: 'excel', label: 'Excel文件', icon: <UploadOutlined /> },
            { value: 'csv', label: 'CSV文件', icon: <UploadOutlined /> },
            { value: 'database', label: '数据库', icon: <DatabaseOutlined /> },
            { value: 'api', label: 'API接口', icon: <ApiOutlined /> }
          ]}
        />
      </div>

      {dataSource.type === 'excel' || dataSource.type === 'csv' ? (
        <div>
          <Text strong>上传文件</Text>
          <Upload
            style={{ width: '100%', marginTop: 8 }}
            accept={dataSource.type === 'excel' ? '.xlsx,.xls' : '.csv'}
            customRequest={handleFileUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
              选择{dataSource.type === 'excel' ? 'Excel' : 'CSV'}文件
            </Button>
          </Upload>
        </div>
      ) : null}

      {dataSource.type === 'database' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong>数据表配置</Text>
            <Switch
              checkedChildren="多表关联"
              unCheckedChildren="单表"
              checked={dataSource.multiTable?.enabled || false}
              onChange={(checked) => {
                if (checked) {
                  handleEnableMultiTable();
                } else {
                  onDataSourceUpdate({
                    ...dataSource,
                    multiTable: { enabled: false, tables: [], joins: [] }
                  });
                }
              }}
            />
          </div>

          {!dataSource.multiTable?.enabled ? (
            // 单表模式
            <Select
              style={{ width: '100%' }}
              placeholder="请选择数据表"
              value={dataSource.connection?.table}
              onChange={handleTableSelect}
              options={mockTables}
            />
          ) : (
            // 多表关联模式
            <div>
              {renderMultiTableConfig()}
            </div>
          )}
        </div>
      ) : null}

      {dataSource.preview.length > 0 && (
        <div>
          <Text strong>数据预览</Text>
          <Table
            style={{ marginTop: 8 }}
            size="small"
            dataSource={dataSource.preview}
            columns={Object.keys(dataSource.preview[0] || {}).map(key => ({
              title: key,
              dataIndex: key,
              key,
              width: 100,
              ellipsis: true
            }))}
            pagination={false}
            scroll={{ x: true }}
          />
        </div>
      )}
    </Space>
  );

  // 渲染字段配置
  const renderFieldsConfig = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>字段设置</Text>
        <Text type="secondary">拖拽调整顺序</Text>
      </div>
      
      {fields.map((field, index) => (
        <Card key={field.name} size="small" style={{ marginBottom: 8 }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DragOutlined style={{ color: '#999', cursor: 'move' }} />
                <Checkbox
                  checked={field.visible}
                  onChange={(e) => handleFieldVisibilityChange(field.name, e.target.checked)}
                />
                <Text strong>{field.name}</Text>
                <Tag color={field.dataType === 'number' ? 'blue' : field.dataType === 'date' ? 'green' : 'default'}>
                  {field.dataType}
                </Tag>
              </div>
            </div>
            
            {field.visible && (
              <div style={{ paddingLeft: 32 }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text>显示名称</Text>
                    <Input
                      size="small"
                      value={field.displayName}
                      onChange={(e) => handleFieldDisplayNameChange(field.name, e.target.value)}
                      placeholder="字段显示名称"
                    />
                  </div>
                  
                  {field.dataType === 'number' && (
                    <div>
                      <Text>数字格式</Text>
                      <Select
                        size="small"
                        style={{ width: '100%' }}
                        value={field.format}
                        onChange={(value) => handleFieldFormatChange(field.name, value)}
                        options={[
                          { value: 'number', label: '数字' },
                          { value: 'currency', label: '货币' },
                          { value: 'percentage', label: '百分比' },
                          { value: 'decimal2', label: '保留2位小数' }
                        ]}
                      />
                    </div>
                  )}
                </Space>
              </div>
            )}
          </Space>
        </Card>
      ))}
    </Space>
  );

  // 渲染筛选配置
  const renderFiltersConfig = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>筛选条件</Text>
        <Button size="small" icon={<PlusOutlined />} onClick={handleAddFilter}>
          添加条件
        </Button>
      </div>

      {filters.map((filter, index) => (
        <Card key={index} size="small">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>条件 {index + 1}</Text>
              <Button 
                size="small" 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveFilter(index)}
              />
            </div>
            
            <div>
              <Text>字段</Text>
              <Select
                size="small"
                style={{ width: '100%' }}
                value={filter.field}
                onChange={(value) => handleFilterChange(index, 'field', value)}
                options={fields.filter(f => f.visible).map(f => ({
                  value: f.name,
                  label: f.displayName
                }))}
              />
            </div>
            
            <div>
              <Text>操作符</Text>
              <Select
                size="small"
                style={{ width: '100%' }}
                value={filter.operator}
                onChange={(value) => handleFilterChange(index, 'operator', value)}
                options={[
                  { value: '=', label: '等于' },
                  { value: '!=', label: '不等于' },
                  { value: '>', label: '大于' },
                  { value: '<', label: '小于' },
                  { value: 'like', label: '包含' },
                  { value: 'in', label: '属于' }
                ]}
              />
            </div>
            
            <div>
              <Text>值</Text>
              <Input
                size="small"
                value={filter.value}
                onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                placeholder="筛选值"
              />
            </div>
          </Space>
        </Card>
      ))}
    </Space>
  );

  const tabItems = [
    {
      key: 'dataSource',
      label: '数据源',
      children: renderDataSourceConfig()
    },
    {
      key: 'fields',
      label: '字段',
      children: renderFieldsConfig()
    },
    {
      key: 'filters',
      label: '筛选',
      children: renderFiltersConfig()
    }
  ];

  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
        tabBarStyle={{ marginBottom: 16 }}
      />

      {/* 示例数据选择模态框 */}
      <Modal
        title="选择示例数据"
        open={isUploadModalOpen}
        onCancel={() => setIsUploadModalOpen(false)}
        footer={null}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            block 
            onClick={() => handleSampleDataSelect('sales')}
            style={{ textAlign: 'left', height: 'auto', padding: '12px 16px' }}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>销售数据示例</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                包含产品、价格、数量、日期等字段
              </div>
            </div>
          </Button>
          
          <Button 
            block 
            onClick={() => handleSampleDataSelect('users')}
            style={{ textAlign: 'left', height: 'auto', padding: '12px 16px' }}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>用户数据示例</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                包含姓名、年龄、部门、薪资等字段
              </div>
            </div>
          </Button>
        </Space>
      </Modal>
    </>
  );
};

export default DataConfigPanel; 