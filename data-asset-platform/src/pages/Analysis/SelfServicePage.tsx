import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Button,
  Steps,
  Row,
  Col,
  Select,
  Input,
  Table,
  Tag,
  Space,
  Alert,
  Modal,
  Form,
  InputNumber,
  Checkbox,
  List,
  Tooltip,
  Empty,
  Spin,
  Radio,
  Divider,
  Transfer,
  Tree,
  Collapse,
  Tabs,
  Popconfirm,
  Badge,
} from 'antd';
import {
  DatabaseOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  TableOutlined,
  BarChartOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  LinkOutlined,
  BranchesOutlined,
  SwapOutlined,
  MinusCircleOutlined,
  SettingOutlined,
  FunctionOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@hooks/useNotification';
import type { Asset } from '@types/index';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;

// 数据表结构
interface DataTable {
  id: string;
  name: string;
  catalog: string;
  description: string;
  fields: Field[];
  recordCount: number;
  lastUpdated: string;
  alias?: string; // 表别名
}

// 字段信息
interface Field {
  name: string;
  type: string;
  description: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  referencedTable?: string;
  referencedField?: string;
}

// 选中的表信息
interface SelectedTable {
  table: DataTable;
  alias: string;
}

// 表关联关系
interface TableJoin {
  id: string;
  leftTable: string;
  leftField: string;
  rightTable: string;
  rightField: string;
  joinType: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
}

// 选中的字段信息
interface SelectedField {
  tableAlias: string;
  tableName: string;
  fieldName: string;
  alias?: string;
  aggregateFunction?: 'COUNT' | 'SUM' | 'AVG' | 'MAX' | 'MIN';
}

// 查询历史
interface QueryHistory {
  id: string;
  name: string;
  sql: string;
  tables: string[];
  createdAt: string;
  status: 'success' | 'failed' | 'running';
  recordCount?: number;
  executionTime?: number;
}

// 筛选条件
interface FilterCondition {
  tableAlias: string;
  field: string;
  operator: string;
  value: any;
  logic?: 'AND' | 'OR';
}

const SelfServicePage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useNotification();

  // 步骤控制
  const [currentStep, setCurrentStep] = useState(0);
  
  // 数据表相关
  const [dataTables, setDataTables] = useState<DataTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  
  // 表关联
  const [tableJoins, setTableJoins] = useState<TableJoin[]>([]);
  
  // 字段选择
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [fieldSearchText, setFieldSearchText] = useState('');
  
  // 筛选条件
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  
  // 查询设置
  const [rowLimit, setRowLimit] = useState<number>(1000);
  const [queryName, setQueryName] = useState<string>('');
  
  // 查询结果
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [generatedSQL, setGeneratedSQL] = useState<string>('');
  
  // 查询历史
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  
  // 预览模态框
  const [previewVisible, setPreviewVisible] = useState(false);
  
  // 手动添加关联模态框
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinForm] = Form.useForm();

  // 模拟数据表
  const mockDataTables: DataTable[] = [
    {
      id: 'table_001',
      name: '用户行为分析表',
      catalog: '客户类',
      description: '记录用户在平台上的各种行为数据',
      recordCount: 1245632,
      lastUpdated: '2024-01-15',
      fields: [
        { name: 'user_id', type: 'string', description: '用户ID', nullable: false, isPrimaryKey: true, isForeignKey: true, referencedTable: '客户信息表', referencedField: 'customer_id' },
        { name: 'event_type', type: 'string', description: '事件类型', nullable: false },
        { name: 'event_time', type: 'datetime', description: '事件时间', nullable: false },
        { name: 'page_url', type: 'string', description: '页面URL', nullable: true },
        { name: 'device_type', type: 'string', description: '设备类型', nullable: true },
        { name: 'session_id', type: 'string', description: '会话ID', nullable: true },
        { name: 'order_id', type: 'string', description: '关联订单ID', nullable: true, isForeignKey: true, referencedTable: '订单数据表', referencedField: 'order_id' },
      ],
    },
    {
      id: 'table_002',
      name: '订单数据表',
      catalog: '收入类',
      description: '电商平台订单核心数据',
      recordCount: 856742,
      lastUpdated: '2024-01-14',
      fields: [
        { name: 'order_id', type: 'string', description: '订单ID', nullable: false, isPrimaryKey: true },
        { name: 'user_id', type: 'string', description: '用户ID', nullable: false, isForeignKey: true, referencedTable: '客户信息表', referencedField: 'customer_id' },
        { name: 'order_time', type: 'datetime', description: '下单时间', nullable: false },
        { name: 'order_amount', type: 'decimal', description: '订单金额', nullable: false },
        { name: 'order_status', type: 'string', description: '订单状态', nullable: false },
        { name: 'payment_method', type: 'string', description: '支付方式', nullable: true },
        { name: 'product_id', type: 'string', description: '产品ID', nullable: false, isForeignKey: true, referencedTable: '产品信息表', referencedField: 'product_id' },
      ],
    },
    {
      id: 'table_003',
      name: '客户信息表',
      catalog: '客户类',
      description: '客户基础信息表',
      recordCount: 234567,
      lastUpdated: '2024-01-13',
      fields: [
        { name: 'customer_id', type: 'string', description: '客户ID', nullable: false, isPrimaryKey: true },
        { name: 'customer_name', type: 'string', description: '客户姓名', nullable: false },
        { name: 'phone', type: 'string', description: '手机号', nullable: true },
        { name: 'email', type: 'string', description: '邮箱', nullable: true },
        { name: 'register_time', type: 'datetime', description: '注册时间', nullable: false },
        { name: 'customer_level', type: 'string', description: '客户等级', nullable: true },
        { name: 'region_id', type: 'string', description: '地区ID', nullable: true, isForeignKey: true, referencedTable: '地区信息表', referencedField: 'region_id' },
      ],
    },
    {
      id: 'table_004',
      name: '产品信息表',
      catalog: '产品类',
      description: '产品基础信息表',
      recordCount: 12345,
      lastUpdated: '2024-01-12',
      fields: [
        { name: 'product_id', type: 'string', description: '产品ID', nullable: false, isPrimaryKey: true },
        { name: 'product_name', type: 'string', description: '产品名称', nullable: false },
        { name: 'category_id', type: 'string', description: '分类ID', nullable: false },
        { name: 'price', type: 'decimal', description: '价格', nullable: false },
        { name: 'description', type: 'string', description: '产品描述', nullable: true },
        { name: 'created_time', type: 'datetime', description: '创建时间', nullable: false },
      ],
    },
    {
      id: 'table_005',
      name: '地区信息表',
      catalog: '基础数据',
      description: '地区基础信息表',
      recordCount: 3456,
      lastUpdated: '2024-01-10',
      fields: [
        { name: 'region_id', type: 'string', description: '地区ID', nullable: false, isPrimaryKey: true },
        { name: 'region_name', type: 'string', description: '地区名称', nullable: false },
        { name: 'parent_id', type: 'string', description: '父级地区ID', nullable: true },
        { name: 'level', type: 'int', description: '地区级别', nullable: false },
        { name: 'population', type: 'int', description: '人口数量', nullable: true },
      ],
    },
  ];

  useEffect(() => {
    loadDataTables();
    loadQueryHistory();
  }, []);

  // 加载数据表
  const loadDataTables = async () => {
    setTableLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      setDataTables(mockDataTables);
    } catch (error) {
      showError('加载数据表失败');
    } finally {
      setTableLoading(false);
    }
  };

  // 加载查询历史
  const loadQueryHistory = async () => {
    const mockHistory: QueryHistory[] = [
      {
        id: 'query_001',
        name: '用户活跃度分析',
        sql: 'SELECT user_id, COUNT(*) as event_count FROM user_behavior WHERE event_time >= \'2024-01-01\' GROUP BY user_id',
        tables: ['用户行为分析表'],
        createdAt: '2024-01-15 10:30:00',
        status: 'success',
        recordCount: 15420,
        executionTime: 2.3,
      },
      {
        id: 'query_002',
        name: '订单趋势统计',
        sql: 'SELECT DATE(order_time) as order_date, COUNT(*) as order_count, SUM(order_amount) as total_amount FROM orders WHERE order_time >= \'2024-01-01\' GROUP BY DATE(order_time)',
        tables: ['订单数据表'],
        createdAt: '2024-01-14 15:45:00',
        status: 'success',
        recordCount: 30,
        executionTime: 1.8,
      },
    ];
    setQueryHistory(mockHistory);
  };

  // 添加数据表
  const handleAddTable = (table: DataTable) => {
    const alias = generateTableAlias(table.name);
    const newSelectedTable: SelectedTable = {
      table,
      alias,
    };
    
    setSelectedTables([...selectedTables, newSelectedTable]);
    // 移除自动跳转逻辑，让用户主动选择何时进入下一步
  };

  // 移除数据表
  const handleRemoveTable = (tableAlias: string) => {
    setSelectedTables(selectedTables.filter(st => st.alias !== tableAlias));
    // 移除相关的字段选择
    setSelectedFields(selectedFields.filter(field => field.tableAlias !== tableAlias));
    // 移除相关的关联关系
    setTableJoins(tableJoins.filter(join => 
      join.leftTable !== tableAlias && join.rightTable !== tableAlias
    ));
    // 移除相关的筛选条件
    setFilterConditions(filterConditions.filter(condition => 
      condition.tableAlias !== tableAlias
    ));
  };

  // 生成表别名
  const generateTableAlias = (tableName: string): string => {
    const existingAliases = selectedTables.map(st => st.alias);
    let alias = tableName.charAt(0).toLowerCase();
    let counter = 1;
    
    while (existingAliases.includes(alias)) {
      alias = tableName.charAt(0).toLowerCase() + counter;
      counter++;
    }
    
    return alias;
  };

  // 添加表关联
  const handleAddJoin = (join: Omit<TableJoin, 'id'>) => {
    const newJoin: TableJoin = {
      ...join,
      id: `join_${Date.now()}`,
    };
    setTableJoins([...tableJoins, newJoin]);
  };

  // 移除表关联
  const handleRemoveJoin = (joinId: string) => {
    setTableJoins(tableJoins.filter(join => join.id !== joinId));
  };

  // 自动建议关联关系
  const suggestJoins = (): Omit<TableJoin, 'id'>[] => {
    const suggestions: Omit<TableJoin, 'id'>[] = [];
    
    for (let i = 0; i < selectedTables.length; i++) {
      for (let j = i + 1; j < selectedTables.length; j++) {
        const table1 = selectedTables[i];
        const table2 = selectedTables[j];
        
        // 查找外键关系
        table1.table.fields.forEach(field => {
          if (field.isForeignKey && field.referencedTable === table2.table.name) {
            const referencedField = table2.table.fields.find(f => f.name === field.referencedField);
            if (referencedField) {
              suggestions.push({
                leftTable: table1.alias,
                leftField: field.name,
                rightTable: table2.alias,
                rightField: referencedField.name,
                joinType: 'LEFT',
              });
            }
          }
        });

        table2.table.fields.forEach(field => {
          if (field.isForeignKey && field.referencedTable === table1.table.name) {
            const referencedField = table1.table.fields.find(f => f.name === field.referencedField);
            if (referencedField) {
              suggestions.push({
                leftTable: table2.alias,
                leftField: field.name,
                rightTable: table1.alias,
                rightField: referencedField.name,
                joinType: 'LEFT',
              });
            }
          }
        });
      }
    }
    
    return suggestions;
  };

  // 添加字段选择
  const handleAddField = (field: SelectedField) => {
    setSelectedFields([...selectedFields, field]);
  };

  // 移除字段选择
  const handleRemoveField = (index: number) => {
    setSelectedFields(selectedFields.filter((_, i) => i !== index));
  };

  // 更新字段设置
  const handleUpdateField = (index: number, updates: Partial<SelectedField>) => {
    const newFields = [...selectedFields];
    newFields[index] = { ...newFields[index], ...updates };
    setSelectedFields(newFields);
  };

  // 添加筛选条件
  const addFilterCondition = () => {
    if (selectedTables.length === 0) return;
    
    const firstTable = selectedTables[0];
    const newCondition: FilterCondition = {
      tableAlias: firstTable.alias,
      field: firstTable.table.fields[0].name,
      operator: '=',
      value: '',
      logic: filterConditions.length > 0 ? 'AND' : undefined,
    };
    setFilterConditions([...filterConditions, newCondition]);
  };

  // 删除筛选条件
  const removeFilterCondition = (index: number) => {
    setFilterConditions(filterConditions.filter((_, i) => i !== index));
  };

  // 更新筛选条件
  const updateFilterCondition = (index: number, field: keyof FilterCondition, value: any) => {
    const newConditions = [...filterConditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setFilterConditions(newConditions);
  };

  // 生成SQL
  const generateSQL = () => {
    if (selectedTables.length === 0 || selectedFields.length === 0) {
      return '';
    }

    // SELECT 子句
    const selectFields = selectedFields.map(field => {
      let fieldStr = `${field.tableAlias}.${field.fieldName}`;
      if (field.aggregateFunction) {
        fieldStr = `${field.aggregateFunction}(${fieldStr})`;
      }
      if (field.alias) {
        fieldStr += ` AS ${field.alias}`;
      }
      return fieldStr;
    });

    let sql = `SELECT ${selectFields.join(', ')}`;
    
    // FROM 子句
    const mainTable = selectedTables[0];
    sql += ` FROM ${mainTable.table.name} ${mainTable.alias}`;
    
    // JOIN 子句
    tableJoins.forEach(join => {
      const rightTable = selectedTables.find(st => st.alias === join.rightTable);
      if (rightTable) {
        sql += ` ${join.joinType} JOIN ${rightTable.table.name} ${join.rightTable}`;
        sql += ` ON ${join.leftTable}.${join.leftField} = ${join.rightTable}.${join.rightField}`;
      }
    });
    
    // WHERE 子句
    if (filterConditions.length > 0) {
      const whereClause = filterConditions.map((condition, index) => {
        let clause = '';
        if (index > 0 && condition.logic) {
          clause += ` ${condition.logic} `;
        }
        clause += `${condition.tableAlias}.${condition.field} ${condition.operator} '${condition.value}'`;
        return clause;
      }).join('');
      
      sql += ` WHERE${whereClause}`;
    }
    
    sql += ` LIMIT ${rowLimit}`;
    
    return sql;
  };

  // 预览查询
  const handlePreview = () => {
    const sql = generateSQL();
    setGeneratedSQL(sql);
    setPreviewVisible(true);
  };

  // 执行查询
  const executeQuery = async () => {
    if (selectedTables.length === 0 || selectedFields.length === 0) {
      showWarning('请先选择数据表和字段');
      return;
    }

    setQueryLoading(true);
    try {
      // 模拟查询执行
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 生成模拟结果数据
      const mockResult = Array.from({ length: Math.min(rowLimit, 50) }, (_, index) => {
        const row: any = {};
        selectedFields.forEach(field => {
          const table = selectedTables.find(st => st.alias === field.tableAlias);
          const fieldInfo = table?.table.fields.find(f => f.name === field.fieldName);
          const columnName = field.alias || `${field.tableAlias}_${field.fieldName}`;
          
          if (fieldInfo) {
            switch (fieldInfo.type) {
              case 'string':
                row[columnName] = `${field.fieldName}_${index + 1}`;
                break;
              case 'decimal':
                if (field.aggregateFunction) {
                  row[columnName] = (Math.random() * 10000).toFixed(2);
                } else {
                  row[columnName] = (Math.random() * 1000).toFixed(2);
                }
                break;
              case 'int':
                if (field.aggregateFunction === 'COUNT') {
                  row[columnName] = Math.floor(Math.random() * 1000);
                } else {
                  row[columnName] = Math.floor(Math.random() * 100);
                }
                break;
              case 'datetime':
                row[columnName] = new Date(Date.now() - Math.random() * 86400000 * 30).toISOString().slice(0, 19);
                break;
              default:
                row[columnName] = `value_${index + 1}`;
            }
          }
        });
        return row;
      });

      setQueryResult(mockResult);
      setCurrentStep(3);
      showSuccess(`查询完成，共返回 ${mockResult.length} 条记录`);
      
      // 保存到历史记录
      if (queryName) {
        const newHistory: QueryHistory = {
          id: `query_${Date.now()}`,
          name: queryName,
          sql: generateSQL(),
          tables: selectedTables.map(st => st.table.name),
          createdAt: new Date().toLocaleString(),
          status: 'success',
          recordCount: mockResult.length,
          executionTime: 2.0,
        };
        setQueryHistory([newHistory, ...queryHistory]);
      }
    } catch (error) {
      showError('查询执行失败');
    } finally {
      setQueryLoading(false);
    }
  };

  // 导出数据
  const exportData = (format: 'excel' | 'csv' | 'pdf') => {
    showSuccess(`正在导出${format.toUpperCase()}格式文件...`);
    // 这里实现实际的导出逻辑
  };

  // 重置查询
  const resetQuery = () => {
    setCurrentStep(0);
    setSelectedTables([]);
    setTableJoins([]);
    setSelectedFields([]);
    setFilterConditions([]);
    setQueryResult([]);
    setQueryName('');
    setGeneratedSQL('');
  };

  // 从历史记录加载查询
  const loadFromHistory = (history: QueryHistory) => {
    // 这里可以解析历史记录的SQL，重新设置查询条件
    setGeneratedSQL(history.sql);
    setQueryName(history.name);
    setHistoryVisible(false);
    showSuccess('已加载历史查询');
  };

  // 手动添加关联
  const handleManualAddJoin = () => {
    setJoinModalVisible(true);
    // 重置表单
    joinForm.resetFields();
    // 设置默认值
    if (selectedTables.length >= 2) {
      joinForm.setFieldsValue({
        leftTable: selectedTables[0].alias,
        rightTable: selectedTables[1].alias,
        joinType: 'LEFT',
      });
    }
  };

  // 确认添加关联
  const handleConfirmAddJoin = async () => {
    try {
      const values = await joinForm.validateFields();
      const newJoin: Omit<TableJoin, 'id'> = {
        leftTable: values.leftTable,
        leftField: values.leftField,
        rightTable: values.rightTable,
        rightField: values.rightField,
        joinType: values.joinType,
      };
      
      handleAddJoin(newJoin);
      setJoinModalVisible(false);
      showSuccess('关联关系添加成功');
    } catch (error) {
      // 表单验证失败
    }
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderTableSelection();
      case 1:
        return renderTableJoinConfig();
      case 2:
        return renderFieldSelection();
      case 3:
        return renderQueryConfig();
      case 4:
        return renderQueryResult();
      default:
        return null;
    }
  };

  // 渲染数据表选择
  const renderTableSelection = () => (
    <Card 
      title={
        <Space>
          <span>选择数据表</span>
          <Badge count={selectedTables.length} style={{ backgroundColor: '#52c41a' }} />
          {selectedTables.length > 1 && (
            <Tag color="blue" icon={<LinkOutlined />}>多表关联查询</Tag>
          )}
        </Space>
      } 
      extra={
        <Space>
          <Button icon={<HistoryOutlined />} onClick={() => setHistoryVisible(true)}>
            查询历史
          </Button>
          {selectedTables.length > 0 && (
            <Button 
              type="primary" 
              onClick={() => setCurrentStep(1)}
              icon={selectedTables.length > 1 ? <LinkOutlined /> : <TableOutlined />}
            >
              {selectedTables.length > 1 ? '下一步：配置关联' : '下一步：选择字段'}
            </Button>
          )}
        </Space>
      }
    >
      <Row gutter={16}>
        <Col span={8}>
          <Search
            placeholder="搜索数据表"
            onSearch={(value) => console.log(value)}
            style={{ marginBottom: 16 }}
          />
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {tableLoading ? (
              <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '50px' }} />
            ) : (
              dataTables.map(table => {
                const isSelected = selectedTables.some(st => st.table.id === table.id);
                return (
                  <Card
                    key={table.id}
                    size="small"
                    hoverable={!isSelected}
                    style={{
                      marginBottom: 8,
                      cursor: isSelected ? 'default' : 'pointer',
                      border: isSelected ? '2px solid #52c41a' : '1px solid #d9d9d9',
                      backgroundColor: isSelected ? '#f6ffed' : '#ffffff',
                      position: 'relative',
                    }}
                    onClick={() => !isSelected && handleAddTable(table)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <DatabaseOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        <Text strong>{table.name}</Text>
                        {isSelected && <Badge status="success" style={{ marginLeft: 8 }} />}
                      </div>
                      
                      {isSelected ? (
                        <Tooltip title="移除此表">
                          <Button 
                            size="small" 
                            type="text" 
                            danger 
                            icon={<MinusCircleOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTable(selectedTables.find(st => st.table.id === table.id)?.alias || '');
                            }}
                            style={{ 
                              opacity: 0.7,
                              border: 'none',
                              boxShadow: 'none',
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title="添加到查询">
                          <Button 
                            size="small" 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddTable(table);
                            }}
                            style={{ 
                              fontSize: '12px', 
                              height: '24px', 
                              lineHeight: '22px',
                              borderRadius: '4px',
                              boxShadow: '0 2px 4px rgba(24,144,255,0.2)',
                            }}
                          />
                        </Tooltip>
                      )}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <Tag color="blue">{table.catalog}</Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {table.description}
                    </Text>
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {table.recordCount.toLocaleString()} 条记录
                      </Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {table.lastUpdated}
                      </Text>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </Col>
        <Col span={16}>
          {selectedTables.length > 0 ? (
            <Card 
              title={
                <Space>
                  <span>已选择的数据表</span>
                  <Badge count={selectedTables.length} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              } 
              size="small"
              extra={
                <Button 
                  size="small" 
                  danger 
                  onClick={() => {
                    setSelectedTables([]);
                    setTableJoins([]);
                    setSelectedFields([]);
                    setFilterConditions([]);
                  }}
                >
                  清空所有
                </Button>
              }
            >
              <List
                dataSource={selectedTables}
                renderItem={(selectedTable, index) => (
                  <List.Item
                    actions={[
                      <Button 
                        size="small" 
                        type="text"
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveTable(selectedTable.alias)}
                      >
                        移除
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<DatabaseOutlined style={{ color: '#1890ff' }} />}
                      title={
                        <Space>
                          <Text strong>{selectedTable.table.name}</Text>
                          <Tag color="orange">别名: {selectedTable.alias}</Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div>{selectedTable.table.description}</div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {selectedTable.table.recordCount.toLocaleString()} 条记录 • {selectedTable.table.fields.length} 个字段
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
              
              {selectedTables.length === 1 && (
                <Alert
                  message="单表查询"
                  description="您已选择一个数据表。可以直接进入下一步选择字段，或继续添加更多表进行关联查询。"
                  type="success"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
              
              {selectedTables.length > 1 && (
                <Alert
                  message="多表关联查询"
                  description={`您已选择 ${selectedTables.length} 个数据表。下一步将配置表之间的关联关系，以实现复杂的数据分析。`}
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
              
              <div style={{ 
                marginTop: 16, 
                padding: 12, 
                backgroundColor: '#fafafa', 
                borderRadius: 6,
                border: '1px dashed #d9d9d9'
              }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  💡 提示：点击左侧表卡片上的"添加"按钮可以选择更多数据表进行关联查询
                </Text>
              </div>
            </Card>
          ) : (
            <Card size="small">
              <Empty 
                description={
                  <div>
                    <div>请从左侧选择数据表</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      支持选择多个表进行关联查询
                    </Text>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <div style={{ 
                marginTop: 16, 
                padding: 12, 
                backgroundColor: '#f0f8ff', 
                borderRadius: 6,
                border: '1px dashed #91d5ff'
              }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  🔍 <strong>使用指南：</strong><br/>
                  • 单击表卡片或点击"添加"按钮选择数据表<br/>
                  • 支持选择多个表进行关联查询<br/>
                  • 选择完成后点击右上角"下一步"按钮继续
                </Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </Card>
  );

  // 渲染表关联配置
  const renderTableJoinConfig = () => (
    <Card 
      title="配置表关联"
      extra={
        <Space>
          <Button onClick={() => setCurrentStep(0)}>返回上一步</Button>
          <Button type="primary" onClick={() => setCurrentStep(2)}>
            下一步：选择字段
          </Button>
        </Space>
      }
    >
      {selectedTables.length < 2 ? (
        <Alert
          message="单表查询"
          description="您只选择了一个数据表，可以跳过关联配置直接进入下一步。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <>
          <Alert
            message="智能关联建议"
            description="系统已基于外键关系为您推荐最佳的表关联方式，您也可以手动配置关联关系。"
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button 
                size="small" 
                type="primary" 
                onClick={() => {
                  const suggestions = suggestJoins();
                  suggestions.forEach(suggestion => handleAddJoin(suggestion));
                  showSuccess('已自动添加关联关系');
                }}
              >
                应用建议
              </Button>
            }
          />
          
          <Row gutter={16}>
            <Col span={12}>
              <Card title="当前关联关系" size="small" extra={
                <Button 
                  type="dashed" 
                  size="small" 
                  icon={<PlusOutlined />}
                  onClick={handleManualAddJoin}
                  disabled={selectedTables.length < 2}
                >
                  手动添加
                </Button>
              }>
                {tableJoins.length > 0 ? (
                  <List
                    dataSource={tableJoins}
                    renderItem={(join, index) => {
                      const leftTable = selectedTables.find(st => st.alias === join.leftTable);
                      const rightTable = selectedTables.find(st => st.alias === join.rightTable);
                      return (
                        <List.Item
                          actions={[
                            <Button 
                              size="small" 
                              danger 
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveJoin(join.id)}
                            >
                              删除
                            </Button>
                          ]}
                        >
                          <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                              <Space>
                                <Tag color="blue">{leftTable?.table.name}</Tag>
                                <SwapOutlined />
                                <Tag color="green">{rightTable?.table.name}</Tag>
                                <Tag color="orange">{join.joinType}</Tag>
                              </Space>
                            </div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {join.leftTable}.{join.leftField} = {join.rightTable}.{join.rightField}
                            </Text>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                ) : (
                  <Empty description="暂无关联关系" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="关联预览" size="small">
                {tableJoins.length > 0 ? (
                  <div style={{ 
                    backgroundColor: '#f6f8fa', 
                    padding: '16px', 
                    borderRadius: '6px',
                    fontFamily: 'Monaco, Consolas, monospace',
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {generateSQL() || '-- SQL预览将在选择字段后显示'}
                  </div>
                ) : (
                  <Empty description="配置关联关系后可预览SQL" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Card>
  );

  // 渲染字段选择
  const renderFieldSelection = () => (
    <Card 
      title="选择字段"
      extra={
        <Space>
          <Button onClick={() => setCurrentStep(1)}>返回上一步</Button>
          {selectedFields.length > 0 && (
            <Button type="primary" onClick={() => setCurrentStep(3)}>
              下一步：配置查询
            </Button>
          )}
        </Space>
      }
    >
      <Row gutter={16}>
        <Col span={14}>
          <Tabs defaultActiveKey="0">
            {selectedTables.map((selectedTable, index) => (
              <TabPane 
                tab={
                  <Space>
                    <DatabaseOutlined />
                    {selectedTable.table.name}
                    <Tag color="orange" style={{ marginLeft: 4 }}>
                      {selectedTable.alias}
                    </Tag>
                  </Space>
                } 
                key={index.toString()}
              >
                <div style={{ marginBottom: 16 }}>
                  <Search
                    placeholder={`搜索 ${selectedTable.table.name} 的字段`}
                    value={fieldSearchText}
                    onChange={(e) => setFieldSearchText(e.target.value)}
                  />
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {selectedTable.table.fields
                    .filter(field => 
                      field.name.toLowerCase().includes(fieldSearchText.toLowerCase()) ||
                      field.description.toLowerCase().includes(fieldSearchText.toLowerCase())
                    )
                    .map(field => (
                      <Card 
                        key={field.name} 
                        size="small" 
                        style={{ marginBottom: 8, cursor: 'pointer' }}
                        onClick={() => {
                          const newField: SelectedField = {
                            tableAlias: selectedTable.alias,
                            tableName: selectedTable.table.name,
                            fieldName: field.name,
                          };
                          handleAddField(newField);
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            {field.isPrimaryKey && <Tag color="red">PK</Tag>}
                            {field.isForeignKey && <Tag color="purple">FK</Tag>}
                            <Text code>{field.name}</Text>
                            <Tag color="green">{field.type}</Tag>
                          </Space>
                          <Button 
                            type="primary" 
                            size="small" 
                            icon={<PlusOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newField: SelectedField = {
                                tableAlias: selectedTable.alias,
                                tableName: selectedTable.table.name,
                                fieldName: field.name,
                              };
                              handleAddField(newField);
                            }}
                          />
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {field.description}
                        </Text>
                      </Card>
                    ))}
                </div>
              </TabPane>
            ))}
          </Tabs>
        </Col>
        <Col span={10}>
          <Card title="已选字段" size="small">
            {selectedFields.length > 0 ? (
              <List
                size="small"
                dataSource={selectedFields}
                renderItem={(field, index) => (
                  <List.Item
                    actions={[
                      <Tooltip title="设置聚合函数">
                        <Button 
                          size="small" 
                          icon={<FunctionOutlined />}
                          onClick={() => {
                            // 这里可以打开模态框设置聚合函数
                          }}
                        />
                      </Tooltip>,
                      <Tooltip title="设置别名">
                        <Button 
                          size="small" 
                          icon={<SettingOutlined />}
                          onClick={() => {
                            // 这里可以打开模态框设置别名
                          }}
                        />
                      </Tooltip>,
                      <Button 
                        size="small" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveField(index)}
                      />
                    ]}
                  >
                    <div style={{ width: '100%' }}>
                      <div>
                        <Space>
                          <Tag color="blue" style={{ margin: 0 }}>{field.tableAlias}</Tag>
                          <Text code>{field.fieldName}</Text>
                          {field.aggregateFunction && (
                            <Tag color="orange">{field.aggregateFunction}</Tag>
                          )}
                          {field.alias && (
                            <Tag color="purple">AS {field.alias}</Tag>
                          )}
                        </Space>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="请从左侧选择字段" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>
    </Card>
  );

  // 渲染查询配置
  const renderQueryConfig = () => (
    <Card 
      title="配置查询条件"
      extra={
        <Space>
          <Button onClick={() => setCurrentStep(1)}>返回上一步</Button>
          <Button type="primary" onClick={handlePreview}>
            预览SQL
          </Button>
        </Space>
      }
    >
      <Row gutter={16}>
        <Col span={12}>
          <Card title="筛选条件" size="small" extra={
            <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addFilterCondition}>
              添加条件
            </Button>
          }>
            {filterConditions.length > 0 ? (
              filterConditions.map((condition, index) => (
                <div key={index} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                  {index > 0 && (
                    <Radio.Group
                      value={condition.logic}
                      onChange={(e) => updateFilterCondition(index, 'logic', e.target.value)}
                      style={{ marginBottom: 8 }}
                      size="small"
                    >
                      <Radio.Button value="AND">AND</Radio.Button>
                      <Radio.Button value="OR">OR</Radio.Button>
                    </Radio.Group>
                  )}
                  <Row gutter={8}>
                    <Col span={4}>
                      <Select
                        size="small"
                        value={condition.tableAlias}
                        onChange={(value) => updateFilterCondition(index, 'tableAlias', value)}
                        style={{ width: '100%' }}
                        placeholder="表"
                      >
                        {selectedTables.map(st => (
                          <Option key={st.alias} value={st.alias}>
                            {st.alias}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={6}>
                      <Select
                        size="small"
                        value={condition.field}
                        onChange={(value) => updateFilterCondition(index, 'field', value)}
                        style={{ width: '100%' }}
                        placeholder="字段"
                      >
                        {selectedTables
                          .find(st => st.alias === condition.tableAlias)
                          ?.table.fields.map(field => (
                            <Option key={field.name} value={field.name}>
                              <Space>
                                <Text code>{field.name}</Text>
                                <Tag color="green" style={{ margin: 0 }}>{field.type}</Tag>
                              </Space>
                            </Option>
                          ))}
                      </Select>
                    </Col>
                    <Col span={5}>
                      <Select
                        size="small"
                        value={condition.operator}
                        onChange={(value) => updateFilterCondition(index, 'operator', value)}
                        style={{ width: '100%' }}
                      >
                        <Option value="=">等于</Option>
                        <Option value="!=">不等于</Option>
                        <Option value=">">大于</Option>
                        <Option value="<">小于</Option>
                        <Option value=">=">大于等于</Option>
                        <Option value="<=">小于等于</Option>
                        <Option value="LIKE">包含</Option>
                        <Option value="IN">在范围内</Option>
                      </Select>
                    </Col>
                    <Col span={7}>
                      <Input
                        size="small"
                        value={condition.value}
                        onChange={(e) => updateFilterCondition(index, 'value', e.target.value)}
                        placeholder="值"
                      />
                    </Col>
                    <Col span={2}>
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeFilterCondition(index)}
                      />
                    </Col>
                  </Row>
                </div>
              ))
            ) : (
              <Empty description="暂无筛选条件" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="查询设置" size="small">
            <Form layout="vertical">
              <Form.Item label="查询名称">
                <Input
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  placeholder="为本次查询命名（可选）"
                />
              </Form.Item>
              <Form.Item label="返回行数限制">
                <InputNumber
                  value={rowLimit}
                  onChange={(value) => setRowLimit(value || 1000)}
                  min={1}
                  max={100000}
                  style={{ width: '100%' }}
                  placeholder="最大返回行数"
                />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlayCircleOutlined />}
                    onClick={executeQuery}
                    loading={queryLoading}
                  >
                    执行查询
                  </Button>
                  <Button onClick={resetQuery}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  // 渲染查询结果
  const renderQueryResult = () => {
    const columns = selectedFields.map(field => {
      const columnName = field.alias || `${field.tableAlias}_${field.fieldName}`;
      return {
        title: (
          <Space>
            <Tag color="blue" style={{ margin: 0 }}>{field.tableAlias}</Tag>
            <Text>{field.fieldName}</Text>
            {field.aggregateFunction && (
              <Tag color="orange">{field.aggregateFunction}</Tag>
            )}
            {field.alias && (
              <Tag color="purple">AS {field.alias}</Tag>
            )}
          </Space>
        ),
        dataIndex: columnName,
        key: columnName,
        ellipsis: true,
      };
    });

    return (
      <Card 
        title={`查询结果 - 共 ${queryResult.length} 条记录`}
        extra={
          <Space>
            <Button onClick={() => setCurrentStep(3)}>返回配置</Button>
            <Button icon={<FileExcelOutlined />} onClick={() => exportData('excel')}>
              导出Excel
            </Button>
            <Button icon={<FilePdfOutlined />} onClick={() => exportData('pdf')}>
              导出PDF
            </Button>
            <Button type="primary" onClick={resetQuery}>
              新建查询
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={queryResult}
          columns={columns}
          pagination={{
            total: queryResult.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          scroll={{ x: 'max-content', y: 400 }}
          size="small"
        />
      </Card>
    );
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <DatabaseOutlined style={{ marginRight: '12px', color: '#000000' }} />
          政企提数
        </Title>
        <Text type="secondary">无需编写SQL，通过可视化界面快速获取所需数据</Text>
      </div>

      {/* 步骤导航 */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ 
          padding: '20px 24px',
          overflowX: 'auto',
        }}>
          <Steps 
            current={currentStep} 
            direction="horizontal"
            labelPlacement="horizontal"
            style={{ 
              minWidth: '600px', // 设置最小宽度保证所有步骤正常显示
            }}
          >
            <Steps.Step 
              title="选择数据表" 
              icon={<DatabaseOutlined />}
              style={{ minWidth: '120px' }}
            />
            <Steps.Step 
              title="配置关联" 
              icon={<LinkOutlined />}
              style={{ minWidth: '120px' }}
            />
            <Steps.Step 
              title="选择字段" 
              icon={<TableOutlined />}
              style={{ minWidth: '120px' }}
            />
            <Steps.Step 
              title="配置查询" 
              icon={<FilterOutlined />}
              style={{ minWidth: '120px' }}
            />
            <Steps.Step 
              title="查看结果" 
              icon={<BarChartOutlined />}
              style={{ minWidth: '120px' }}
            />
          </Steps>
        </div>
      </Card>

      {/* 步骤内容 */}
      {renderStepContent()}

      {/* SQL预览模态框 */}
      <Modal
        title="SQL预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPreviewVisible(false)}>
            取消
          </Button>,
          <Button key="execute" type="primary" onClick={() => {
            setPreviewVisible(false);
            executeQuery();
          }}>
            执行查询
          </Button>,
        ]}
        width={800}
      >
        <Alert
          message="生成的SQL语句"
          type="info"
          style={{ marginBottom: 16 }}
        />
        <div style={{
          backgroundColor: '#f6f8fa',
          padding: '16px',
          borderRadius: '6px',
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          border: '1px solid #e1e4e8',
        }}>
          {generateSQL()}
        </div>
      </Modal>

      {/* 查询历史模态框 */}
      <Modal
        title="查询历史"
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={null}
        width={1000}
      >
        <Table
          dataSource={queryHistory}
          rowKey="id"
          columns={[
            {
              title: '查询名称',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: '涉及表',
              dataIndex: 'tables',
              key: 'tables',
              render: (tables: string[]) => (
                <div>
                  {tables.map(table => (
                    <Tag key={table}>{table}</Tag>
                  ))}
                </div>
              ),
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => {
                const statusConfig = {
                  success: { color: 'green', icon: <CheckCircleOutlined />, text: '成功' },
                  failed: { color: 'red', icon: <WarningOutlined />, text: '失败' },
                  running: { color: 'blue', icon: <ClockCircleOutlined />, text: '运行中' },
                };
                const config = statusConfig[status as keyof typeof statusConfig];
                return (
                  <Tag color={config.color} icon={config.icon}>
                    {config.text}
                  </Tag>
                );
              },
            },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              key: 'createdAt',
            },
            {
              title: '记录数',
              dataIndex: 'recordCount',
              key: 'recordCount',
              render: (count: number) => count?.toLocaleString() || '-',
            },
            {
              title: '操作',
              key: 'actions',
              render: (_, record: QueryHistory) => (
                <Space size="small">
                  <Tooltip title="查看SQL">
                    <Button size="small" icon={<EyeOutlined />} />
                  </Tooltip>
                  <Tooltip title="复制查询">
                    <Button size="small" icon={<CopyOutlined />} onClick={() => loadFromHistory(record)} />
                  </Tooltip>
                </Space>
              ),
            },
          ]}
          pagination={{ pageSize: 10 }}
        />
      </Modal>

      {/* 手动添加关联模态框 */}
      <Modal
        title="手动配置表关联"
        open={joinModalVisible}
        onCancel={() => setJoinModalVisible(false)}
        onOk={handleConfirmAddJoin}
        width={600}
        destroyOnClose
      >
        <Alert
          message="配置关联关系"
          description="请选择要关联的两个表及其字段，系统将自动生成对应的JOIN语句。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form
          form={joinForm}
          layout="vertical"
          initialValues={{ joinType: 'LEFT' }}
        >
          <Row gutter={16}>
            <Col span={11}>
              <Form.Item
                name="leftTable"
                label="左表"
                rules={[{ required: true, message: '请选择左表' }]}
              >
                <Select placeholder="选择左表" style={{ width: '100%' }}>
                  {selectedTables.map(st => (
                    <Option key={st.alias} value={st.alias}>
                      <Space>
                        <DatabaseOutlined style={{ color: '#1890ff' }} />
                        <Text>{st.table.name}</Text>
                        <Tag color="orange">({st.alias})</Tag>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="leftField"
                label="左表字段"
                rules={[{ required: true, message: '请选择左表字段' }]}
              >
                <Select 
                  placeholder="选择左表字段" 
                  style={{ width: '100%' }}
                  disabled={!Form.useWatch('leftTable', joinForm)}
                >
                  {(() => {
                    const leftTableAlias = Form.useWatch('leftTable', joinForm);
                    const leftTable = selectedTables.find(st => st.alias === leftTableAlias);
                    return leftTable?.table.fields.map(field => (
                      <Option key={field.name} value={field.name}>
                        <Space>
                          {field.isPrimaryKey && <Tag color="red">PK</Tag>}
                          {field.isForeignKey && <Tag color="purple">FK</Tag>}
                          <Text code>{field.name}</Text>
                          <Tag color="green">{field.type}</Tag>
                        </Space>
                      </Option>
                    ));
                  })()}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 30 }}>
              <SwapOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            </Col>
            
            <Col span={11}>
              <Form.Item
                name="rightTable"
                label="右表"
                rules={[{ required: true, message: '请选择右表' }]}
              >
                <Select placeholder="选择右表" style={{ width: '100%' }}>
                  {selectedTables.map(st => (
                    <Option key={st.alias} value={st.alias}>
                      <Space>
                        <DatabaseOutlined style={{ color: '#1890ff' }} />
                        <Text>{st.table.name}</Text>
                        <Tag color="orange">({st.alias})</Tag>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="rightField"
                label="右表字段"
                rules={[{ required: true, message: '请选择右表字段' }]}
              >
                <Select 
                  placeholder="选择右表字段" 
                  style={{ width: '100%' }}
                  disabled={!Form.useWatch('rightTable', joinForm)}
                >
                  {(() => {
                    const rightTableAlias = Form.useWatch('rightTable', joinForm);
                    const rightTable = selectedTables.find(st => st.alias === rightTableAlias);
                    return rightTable?.table.fields.map(field => (
                      <Option key={field.name} value={field.name}>
                        <Space>
                          {field.isPrimaryKey && <Tag color="red">PK</Tag>}
                          {field.isForeignKey && <Tag color="purple">FK</Tag>}
                          <Text code>{field.name}</Text>
                          <Tag color="green">{field.type}</Tag>
                        </Space>
                      </Option>
                    ));
                  })()}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="joinType"
            label="关联类型"
            rules={[{ required: true, message: '请选择关联类型' }]}
          >
            <Radio.Group>
              <Radio.Button value="INNER">
                <Space>
                  <BranchesOutlined />
                  INNER JOIN
                </Space>
              </Radio.Button>
              <Radio.Button value="LEFT">
                <Space>
                  <BranchesOutlined />
                  LEFT JOIN
                </Space>
              </Radio.Button>
              <Radio.Button value="RIGHT">
                <Space>
                  <BranchesOutlined />
                  RIGHT JOIN
                </Space>
              </Radio.Button>
              <Radio.Button value="FULL">
                <Space>
                  <BranchesOutlined />
                  FULL JOIN
                </Space>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <Alert
            message="JOIN 类型说明"
            description={
              <div>
                <div><strong>INNER JOIN:</strong> 只返回两个表中都存在匹配记录的行</div>
                <div><strong>LEFT JOIN:</strong> 返回左表所有记录，右表无匹配时显示NULL</div>
                <div><strong>RIGHT JOIN:</strong> 返回右表所有记录，左表无匹配时显示NULL</div>
                <div><strong>FULL JOIN:</strong> 返回两个表的所有记录，无匹配时显示NULL</div>
              </div>
            }
            type="info"
            style={{ marginTop: 16 }}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default SelfServicePage;
