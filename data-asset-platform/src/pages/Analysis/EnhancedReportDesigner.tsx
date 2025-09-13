import React, { useState, useCallback } from 'react';
import {
  Layout,
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Switch,
  Select,
  Table,
  Tag,
  Alert,
  message,
  Divider,
  Tooltip,
  Collapse,
  Form,
  Input,
  InputNumber,
  Checkbox,
  Radio,
  DatePicker,
  Empty
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  TableOutlined,
  PlusOutlined,
  DeleteOutlined,
  LinkOutlined,
  DatabaseOutlined,
  SettingOutlined,
  FileTextOutlined,
  DragOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  FunctionOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

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

// 表关联配置接口
interface TableJoin {
  id: string;
  leftTable: string;
  rightTable: string;
  leftField: string;
  rightField: string;
  joinType: 'inner' | 'left' | 'right' | 'full';
}

// 字段配置接口
interface ReportField {
  id: string;
  tableId: string;
  fieldName: string;
  displayName: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  visible: boolean;
  order: number;
  width?: number;
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min' | 'none';
  format?: string;
  groupBy?: boolean;
  sortOrder?: 'asc' | 'desc' | 'none';
}

// 筛选条件接口
interface FilterCondition {
  id: string;
  fieldId: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'like' | 'in' | 'between';
  value: any;
  value2?: any; // for between operator
  logic: 'and' | 'or';
}

// 报表配置接口
interface ReportConfig {
  id: string;
  name: string;
  description: string;
  tables: TableConfig[];
  joins: TableJoin[];
  fields: ReportField[];
  filters: FilterCondition[];
  groupBy: string[];
  orderBy: Array<{ fieldId: string; direction: 'asc' | 'desc' }>;
  limit?: number;
}

const EnhancedReportDesigner: React.FC = () => {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();

  // 主要状态
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    id: reportId || 'new',
    name: '新建报表',
    description: '',
    tables: [],
    joins: [],
    fields: [],
    filters: [],
    groupBy: [],
    orderBy: [],
    limit: 1000
  });

  const [activeStep, setActiveStep] = useState(1); // 当前步骤：1-数据源，2-字段选择，3-筛选条件，4-样式配置，5-预览

  // 模拟数据源
  const availableTables = [
    {
      id: 'sales',
      name: 'sales_data',
      alias: '销售数据表',
      fields: [
        { name: 'id', displayName: '销售ID', dataType: 'number' as const },
        { name: 'product_id', displayName: '产品ID', dataType: 'number' as const },
        { name: 'customer_id', displayName: '客户ID', dataType: 'number' as const },
        { name: 'amount', displayName: '销售金额', dataType: 'number' as const },
        { name: 'quantity', displayName: '销售数量', dataType: 'number' as const },
        { name: 'date', displayName: '销售日期', dataType: 'date' as const },
        { name: 'region', displayName: '销售地区', dataType: 'string' as const }
      ]
    },
    {
      id: 'products',
      name: 'product_info',
      alias: '产品信息表',
      fields: [
        { name: 'product_id', displayName: '产品ID', dataType: 'number' as const },
        { name: 'product_name', displayName: '产品名称', dataType: 'string' as const },
        { name: 'category', displayName: '产品分类', dataType: 'string' as const },
        { name: 'price', displayName: '产品价格', dataType: 'number' as const },
        { name: 'supplier', displayName: '供应商', dataType: 'string' as const }
      ]
    },
    {
      id: 'customers',
      name: 'customer_info',
      alias: '客户信息表',
      fields: [
        { name: 'customer_id', displayName: '客户ID', dataType: 'number' as const },
        { name: 'customer_name', displayName: '客户名称', dataType: 'string' as const },
        { name: 'city', displayName: '所在城市', dataType: 'string' as const },
        { name: 'level', displayName: '客户等级', dataType: 'string' as const },
        { name: 'phone', displayName: '联系电话', dataType: 'string' as const }
      ]
    }
  ];

  // 数据表管理函数
  const handleAddTable = useCallback((tableId: string) => {
    const table = availableTables.find(t => t.id === tableId);
    if (table && !reportConfig.tables.find(t => t.id === tableId)) {
      const newTable: TableConfig = {
        ...table,
        isMain: reportConfig.tables.length === 0
      };
      
      setReportConfig(prev => ({
        ...prev,
        tables: [...prev.tables, newTable]
      }));
      
      message.success(`已添加表: ${table.alias}`);
    }
  }, [reportConfig.tables, availableTables]);

  const handleRemoveTable = useCallback((tableId: string) => {
    setReportConfig(prev => ({
      ...prev,
      tables: prev.tables.filter(t => t.id !== tableId),
      joins: prev.joins.filter(j => j.leftTable !== tableId && j.rightTable !== tableId),
      fields: prev.fields.filter(f => f.tableId !== tableId)
    }));
    message.success('已删除表');
  }, []);

  // 表关联管理函数
  const handleAddJoin = useCallback(() => {
    if (reportConfig.tables.length < 2) {
      message.warning('至少需要两个表才能创建关联');
      return;
    }

    const newJoin: TableJoin = {
      id: `join_${Date.now()}`,
      leftTable: reportConfig.tables[0].id,
      rightTable: reportConfig.tables[1].id,
      leftField: '',
      rightField: '',
      joinType: 'inner'
    };

    setReportConfig(prev => ({
      ...prev,
      joins: [...prev.joins, newJoin]
    }));
  }, [reportConfig.tables]);

  const handleUpdateJoin = useCallback((joinId: string, updates: Partial<TableJoin>) => {
    setReportConfig(prev => ({
      ...prev,
      joins: prev.joins.map(join => 
        join.id === joinId ? { ...join, ...updates } : join
      )
    }));
  }, []);

  const handleRemoveJoin = useCallback((joinId: string) => {
    setReportConfig(prev => ({
      ...prev,
      joins: prev.joins.filter(j => j.id !== joinId)
    }));
  }, []);

  // 字段管理函数
  const handleAddField = useCallback((tableId: string, fieldName: string) => {
    const table = reportConfig.tables.find(t => t.id === tableId);
    const field = table?.fields.find(f => f.name === fieldName);
    
    if (field && !reportConfig.fields.find(f => f.tableId === tableId && f.fieldName === fieldName)) {
      const newField: ReportField = {
        id: `field_${tableId}_${fieldName}`,
        tableId,
        fieldName,
        displayName: field.displayName,
        dataType: field.dataType,
        visible: true,
        order: reportConfig.fields.length,
        aggregation: 'none',
        groupBy: false,
        sortOrder: 'none'
      };

      setReportConfig(prev => ({
        ...prev,
        fields: [...prev.fields, newField]
      }));
    }
  }, [reportConfig.tables, reportConfig.fields]);

  const handleUpdateField = useCallback((fieldId: string, updates: Partial<ReportField>) => {
    setReportConfig(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  }, []);

  const handleRemoveField = useCallback((fieldId: string) => {
    setReportConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
  }, []);

  // 筛选条件管理函数
  const handleAddFilter = useCallback(() => {
    if (reportConfig.fields.length === 0) {
      message.warning('请先添加字段');
      return;
    }

    const newFilter: FilterCondition = {
      id: `filter_${Date.now()}`,
      fieldId: reportConfig.fields[0].id,
      operator: '=',
      value: '',
      logic: 'and'
    };

    setReportConfig(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }));
  }, [reportConfig.fields]);

  const handleUpdateFilter = useCallback((filterId: string, updates: Partial<FilterCondition>) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.map(filter => 
        filter.id === filterId ? { ...filter, ...updates } : filter
      )
    }));
  }, []);

  const handleRemoveFilter = useCallback((filterId: string) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId)
    }));
  }, []);

  // 生成预览数据（模拟）
  const generatePreviewData = useCallback(() => {
    // 这里应该根据配置生成实际的数据查询
    return [
      { id: 1, product_name: 'iPhone 14', amount: 5999, quantity: 2, customer_name: '张三', date: '2024-01-15' },
      { id: 2, product_name: 'MacBook Pro', amount: 12999, quantity: 1, customer_name: '李四', date: '2024-01-16' },
      { id: 3, product_name: 'iPad Air', amount: 3999, quantity: 3, customer_name: '王五', date: '2024-01-17' }
    ];
  }, [reportConfig]);

  // 渲染步骤指示器
  const renderStepIndicator = () => (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={16} justify="center">
        {[
          { step: 1, title: '数据源配置', icon: <DatabaseOutlined /> },
          { step: 2, title: '字段选择', icon: <TableOutlined /> },
          { step: 3, title: '筛选条件', icon: <FilterOutlined /> },
          { step: 4, title: '样式配置', icon: <SettingOutlined /> },
          { step: 5, title: '预览导出', icon: <EyeOutlined /> }
        ].map(({ step, title, icon }) => (
          <Col key={step}>
            <Card
              size="small"
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: activeStep === step ? '#e6f7ff' : '#fafafa',
                borderColor: activeStep === step ? '#1890ff' : '#d9d9d9'
              }}
              onClick={() => setActiveStep(step)}
            >
              <Space direction="vertical" size="small">
                <div style={{ fontSize: 18, color: activeStep === step ? '#1890ff' : '#666' }}>
                  {icon}
                </div>
                <Text style={{ fontSize: 12, color: activeStep === step ? '#1890ff' : '#666' }}>
                  {title}
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  // 渲染数据源配置步骤
  const renderDataSourceStep = () => (
    <Card title="数据源配置" style={{ marginBottom: 16 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 表选择和管理 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text strong>数据表选择</Text>
            <Select
              style={{ width: 200 }}
              placeholder="选择要添加的表"
              onChange={handleAddTable}
              value=""
            >
              {availableTables
                .filter(table => !reportConfig.tables.find(t => t.id === table.id))
                .map(table => (
                  <Option key={table.id} value={table.id}>
                    {table.alias} ({table.name})
                  </Option>
                ))
              }
            </Select>
          </div>

          <Row gutter={[16, 16]}>
            {reportConfig.tables.map((table, index) => (
              <Col key={table.id} xs={24} sm={12} md={8}>
                <Card
                  size="small"
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TableOutlined />
                      <span>{table.alias}</span>
                      {table.isMain && <Tag color="green">主表</Tag>}
                    </div>
                  }
                  extra={
                    reportConfig.tables.length > 1 && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        onClick={() => handleRemoveTable(table.id)}
                      >
                        删除
                      </Button>
                    )
                  }
                >
                  <Space wrap>
                    {table.fields.slice(0, 6).map(field => (
                      <Tag key={field.name} color="blue">{field.displayName}</Tag>
                    ))}
                    {table.fields.length > 6 && <Tag>+{table.fields.length - 6}个字段</Tag>}
                  </Space>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    {table.fields.length} 个字段
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* 表关联配置 */}
        {reportConfig.tables.length >= 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text strong>表关联关系</Text>
              <Button
                type="primary"
                icon={<LinkOutlined />}
                onClick={handleAddJoin}
                size="small"
              >
                添加关联
              </Button>
            </div>

            <Row gutter={[16, 16]}>
              {reportConfig.joins.map((join, index) => {
                const leftTable = reportConfig.tables.find(t => t.id === join.leftTable);
                const rightTable = reportConfig.tables.find(t => t.id === join.rightTable);

                return (
                  <Col key={join.id} xs={24}>
                    <Card
                      size="small"
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <LinkOutlined style={{ color: '#1890ff' }} />
                            <Text strong>表关联 #{index + 1}</Text>
                          </Space>
                          <Button
                            type="text"
                            danger
                            size="small"
                            onClick={() => handleRemoveJoin(join.id)}
                          >
                            删除
                          </Button>
                        </div>
                      }
                    >
                      <Row gutter={[16, 8]} align="middle">
                        <Col xs={24} md={10}>
                          <Text type="secondary" style={{ fontSize: 12 }}>左表.字段</Text>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <Select
                              style={{ flex: 1 }}
                              value={join.leftTable}
                              onChange={(value) => handleUpdateJoin(join.id, { leftTable: value, leftField: '' })}
                            >
                              {reportConfig.tables.map(table => (
                                <Option key={table.id} value={table.id}>
                                  {table.alias}
                                </Option>
                              ))}
                            </Select>
                            <Select
                              style={{ flex: 1 }}
                              value={join.leftField}
                              onChange={(value) => handleUpdateJoin(join.id, { leftField: value })}
                              placeholder="选择字段"
                            >
                              {leftTable?.fields.map(field => (
                                <Option key={field.name} value={field.name}>
                                  {field.displayName}
                                </Option>
                              ))}
                            </Select>
                          </div>
                        </Col>

                        <Col xs={24} md={4}>
                          <Text type="secondary" style={{ fontSize: 12 }}>关联类型</Text>
                          <Select
                            style={{ width: '100%', marginTop: 4 }}
                            value={join.joinType}
                            onChange={(value) => handleUpdateJoin(join.id, { joinType: value })}
                          >
                            <Option value="inner">INNER</Option>
                            <Option value="left">LEFT</Option>
                            <Option value="right">RIGHT</Option>
                            <Option value="full">FULL</Option>
                          </Select>
                        </Col>

                        <Col xs={24} md={10}>
                          <Text type="secondary" style={{ fontSize: 12 }}>右表.字段</Text>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <Select
                              style={{ flex: 1 }}
                              value={join.rightTable}
                              onChange={(value) => handleUpdateJoin(join.id, { rightTable: value, rightField: '' })}
                            >
                              {reportConfig.tables.map(table => (
                                <Option key={table.id} value={table.id}>
                                  {table.alias}
                                </Option>
                              ))}
                            </Select>
                            <Select
                              style={{ flex: 1 }}
                              value={join.rightField}
                              onChange={(value) => handleUpdateJoin(join.id, { rightField: value })}
                              placeholder="选择字段"
                            >
                              {rightTable?.fields.map(field => (
                                <Option key={field.name} value={field.name}>
                                  {field.displayName}
                                </Option>
                              ))}
                            </Select>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        )}
      </Space>
    </Card>
  );

  // 渲染字段选择步骤
  const renderFieldSelectionStep = () => (
    <Card title="字段选择" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Text strong>可用字段</Text>
          <div style={{ marginTop: 12, maxHeight: 400, overflow: 'auto' }}>
            {reportConfig.tables.map(table => (
              <Card key={table.id} size="small" style={{ marginBottom: 8 }}>
                <Text strong style={{ color: '#1890ff' }}>{table.alias}</Text>
                <div style={{ marginTop: 8 }}>
                  {table.fields.map(field => (
                    <div key={field.name} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '4px 0'
                    }}>
                      <Space>
                        <Text>{field.displayName}</Text>
                        <Tag size="small" color={
                          field.dataType === 'number' ? 'blue' : 
                          field.dataType === 'date' ? 'green' : 'default'
                        }>
                          {field.dataType}
                        </Tag>
                      </Space>
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddField(table.id, field.name)}
                        disabled={reportConfig.fields.some(f => f.tableId === table.id && f.fieldName === field.name)}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Col>

        <Col xs={24} md={12}>
          <Text strong>已选字段</Text>
          <div style={{ marginTop: 12, maxHeight: 400, overflow: 'auto' }}>
            {reportConfig.fields.length === 0 ? (
              <Empty description="请从左侧添加字段" />
            ) : (
              reportConfig.fields.map((field, index) => {
                const table = reportConfig.tables.find(t => t.id === field.tableId);
                return (
                  <Card key={field.id} size="small" style={{ marginBottom: 8 }}>
                    <Row gutter={8} align="middle">
                      <Col span={2}>
                        <DragOutlined style={{ cursor: 'move', color: '#999' }} />
                      </Col>
                      <Col span={10}>
                        <Text strong>{field.displayName}</Text>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          {table?.alias}.{field.fieldName}
                        </div>
                      </Col>
                      <Col span={6}>
                        <Select
                          size="small"
                          style={{ width: '100%' }}
                          value={field.aggregation}
                          onChange={(value) => handleUpdateField(field.id, { aggregation: value })}
                        >
                          <Option value="none">无</Option>
                          <Option value="sum">求和</Option>
                          <Option value="avg">平均值</Option>
                          <Option value="count">计数</Option>
                          <Option value="max">最大值</Option>
                          <Option value="min">最小值</Option>
                        </Select>
                      </Col>
                      <Col span={4}>
                        <Checkbox
                          checked={field.groupBy}
                          onChange={(e) => handleUpdateField(field.id, { groupBy: e.target.checked })}
                        >
                          分组
                        </Checkbox>
                      </Col>
                      <Col span={2}>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveField(field.id)}
                        />
                      </Col>
                    </Row>
                  </Card>
                );
              })
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );

  // 渲染筛选条件步骤
  const renderFilterStep = () => (
    <Card 
      title="筛选条件" 
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddFilter}
          size="small"
        >
          添加筛选
        </Button>
      }
      style={{ marginBottom: 16 }}
    >
      {reportConfig.filters.length === 0 ? (
        <Empty description="暂无筛选条件" />
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {reportConfig.filters.map((filter, index) => {
            const field = reportConfig.fields.find(f => f.id === filter.fieldId);
            const table = reportConfig.tables.find(t => t.id === field?.tableId);
            
            return (
              <Card key={filter.id} size="small">
                <Row gutter={[8, 8]} align="middle">
                  <Col span={4}>
                    <Select
                      style={{ width: '100%' }}
                      value={filter.fieldId}
                      onChange={(value) => handleUpdateFilter(filter.id, { fieldId: value })}
                    >
                      {reportConfig.fields.map(f => {
                        const t = reportConfig.tables.find(table => table.id === f.tableId);
                        return (
                          <Option key={f.id} value={f.id}>
                            {t?.alias}.{f.displayName}
                          </Option>
                        );
                      })}
                    </Select>
                  </Col>
                  
                  <Col span={3}>
                    <Select
                      style={{ width: '100%' }}
                      value={filter.operator}
                      onChange={(value) => handleUpdateFilter(filter.id, { operator: value })}
                    >
                      <Option value="=">等于</Option>
                      <Option value="!=">不等于</Option>
                      <Option value=">">大于</Option>
                      <Option value="<">小于</Option>
                      <Option value=">=">大于等于</Option>
                      <Option value="<=">小于等于</Option>
                      <Option value="like">包含</Option>
                      <Option value="in">在列表中</Option>
                      <Option value="between">介于</Option>
                    </Select>
                  </Col>
                  
                  <Col span={6}>
                    {filter.operator === 'between' ? (
                      <Input.Group compact>
                        <Input
                          style={{ width: '45%' }}
                          placeholder="起始值"
                          value={filter.value}
                          onChange={(e) => handleUpdateFilter(filter.id, { value: e.target.value })}
                        />
                        <Input
                          style={{ width: '10%', textAlign: 'center', pointerEvents: 'none' }}
                          placeholder="~"
                          disabled
                        />
                        <Input
                          style={{ width: '45%' }}
                          placeholder="结束值"
                          value={filter.value2}
                          onChange={(e) => handleUpdateFilter(filter.id, { value2: e.target.value })}
                        />
                      </Input.Group>
                    ) : (
                      <Input
                        placeholder="筛选值"
                        value={filter.value}
                        onChange={(e) => handleUpdateFilter(filter.id, { value: e.target.value })}
                      />
                    )}
                  </Col>
                  
                  {index > 0 && (
                    <Col span={2}>
                      <Radio.Group
                        value={filter.logic}
                        onChange={(e) => handleUpdateFilter(filter.id, { logic: e.target.value })}
                      >
                        <Radio.Button value="and">且</Radio.Button>
                        <Radio.Button value="or">或</Radio.Button>
                      </Radio.Group>
                    </Col>
                  )}
                  
                  <Col span={2}>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveFilter(filter.id)}
                    />
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      )}
    </Card>
  );

  // 渲染样式配置步骤
  const renderStyleStep = () => (
    <Card title="样式配置" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form layout="vertical" size="small">
            <Form.Item label="报表名称">
              <Input
                value={reportConfig.name}
                onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入报表名称"
              />
            </Form.Item>
            
            <Form.Item label="报表描述">
              <Input.TextArea
                value={reportConfig.description}
                onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="请输入报表描述"
                rows={3}
              />
            </Form.Item>
            
            <Form.Item label="数据行数限制">
              <InputNumber
                style={{ width: '100%' }}
                value={reportConfig.limit}
                onChange={(value) => setReportConfig(prev => ({ ...prev, limit: value || 1000 }))}
                min={1}
                max={10000}
              />
            </Form.Item>
          </Form>
        </Col>
        
        <Col span={12}>
          <div>
            <Text strong>字段显示设置</Text>
            <div style={{ marginTop: 12, maxHeight: 300, overflow: 'auto' }}>
              {reportConfig.fields.map(field => (
                <div key={field.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div>
                    <Checkbox
                      checked={field.visible}
                      onChange={(e) => handleUpdateField(field.id, { visible: e.target.checked })}
                    >
                      {field.displayName}
                    </Checkbox>
                  </div>
                  <Space>
                    <InputNumber
                      size="small"
                      style={{ width: 80 }}
                      placeholder="宽度"
                      value={field.width}
                      onChange={(value) => handleUpdateField(field.id, { width: value || undefined })}
                    />
                    <Select
                      size="small"
                      style={{ width: 80 }}
                      value={field.sortOrder}
                      onChange={(value) => handleUpdateField(field.id, { sortOrder: value })}
                    >
                      <Option value="none">不排序</Option>
                      <Option value="asc">升序</Option>
                      <Option value="desc">降序</Option>
                    </Select>
                  </Space>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );

  // 渲染预览导出步骤
  const renderPreviewStep = () => {
    const previewData = generatePreviewData();
    const visibleFields = reportConfig.fields.filter(f => f.visible);
    
    const columns = visibleFields.map(field => ({
      title: field.displayName,
      dataIndex: field.fieldName,
      key: field.id,
      width: field.width
    }));

    return (
      <Card 
        title="报表预览" 
        extra={
          <Space>
            <Button icon={<DownloadOutlined />}>导出Excel</Button>
            <Button icon={<DownloadOutlined />}>导出PDF</Button>
            <Button type="primary" icon={<SaveOutlined />}>保存报表</Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {previewData.length === 0 ? (
          <Empty description="暂无数据" />
        ) : (
          <Table
            columns={columns}
            dataSource={previewData}
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
            size="small"
            rowKey="id"
          />
        )}
      </Card>
    );
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return renderDataSourceStep();
      case 2:
        return renderFieldSelectionStep();
      case 3:
        return renderFilterStep();
      case 4:
        return renderStyleStep();
      case 5:
        return renderPreviewStep();
      default:
        return null;
    }
  };

  return (
    <Layout style={{ height: '100vh', background: '#f0f2f5' }}>
      {/* 顶部工具栏 */}
      <Layout.Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Space>
          <Button 
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/analysis/report')}
          >
            返回
          </Button>
          <Divider type="vertical" />
          <FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>
            {reportConfig.name}
          </Title>
        </Space>
        
        <Space>
          <Button
            disabled={activeStep === 1}
            onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
          >
            上一步
          </Button>
          <Button
            type="primary"
            disabled={activeStep === 5}
            onClick={() => setActiveStep(prev => Math.min(5, prev + 1))}
          >
            下一步
          </Button>
        </Space>
      </Layout.Header>

      {/* 主要内容区 */}
      <Layout.Content style={{ padding: 24 }}>
        {renderStepIndicator()}
        {renderStepContent()}
      </Layout.Content>
    </Layout>
  );
};

export default EnhancedReportDesigner; 