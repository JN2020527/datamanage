import React, { useState } from 'react';
import {
  Card,
  Button,
  Select,
  Table,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Switch,
  Divider,
  Alert,
  message
} from 'antd';
import {
  LinkOutlined,
  TableOutlined,
  PlusOutlined,
  DeleteOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface TableConfig {
  id: string;
  name: string;
  alias: string;
  fields: string[];
  data: any[];
}

interface JoinConfig {
  id: string;
  leftTable: string;
  rightTable: string;
  leftField: string;
  rightField: string;
  joinType: 'inner' | 'left' | 'right' | 'full';
}

const MultiTableDemo: React.FC = () => {
  const [multiTableEnabled, setMultiTableEnabled] = useState(false);
  const [selectedTables, setSelectedTables] = useState<TableConfig[]>([]);
  const [joins, setJoins] = useState<JoinConfig[]>([]);

  // 模拟数据表
  const availableTables = [
    {
      id: 'sales',
      name: 'sales_data',
      alias: '销售数据表',
      fields: ['id', 'product_id', 'customer_id', 'amount', 'date'],
      data: [
        { id: 1, product_id: 101, customer_id: 1001, amount: 1500, date: '2024-01-15' },
        { id: 2, product_id: 102, customer_id: 1002, amount: 2800, date: '2024-01-16' },
        { id: 3, product_id: 101, customer_id: 1003, amount: 1200, date: '2024-01-17' }
      ]
    },
    {
      id: 'products',
      name: 'product_info',
      alias: '产品信息表',
      fields: ['product_id', 'product_name', 'category', 'price'],
      data: [
        { product_id: 101, product_name: 'iPhone 14', category: '手机', price: 5999 },
        { product_id: 102, product_name: 'MacBook Pro', category: '电脑', price: 12999 },
        { product_id: 103, product_name: 'iPad Air', category: '平板', price: 3999 }
      ]
    },
    {
      id: 'customers',
      name: 'customer_info',
      alias: '客户信息表',
      fields: ['customer_id', 'customer_name', 'city', 'level'],
      data: [
        { customer_id: 1001, customer_name: '张三', city: '北京', level: 'VIP' },
        { customer_id: 1002, customer_name: '李四', city: '上海', level: '普通' },
        { customer_id: 1003, customer_name: '王五', city: '深圳', level: 'VIP' }
      ]
    }
  ];

  const handleAddTable = (tableId: string) => {
    const table = availableTables.find(t => t.id === tableId);
    if (table && !selectedTables.find(t => t.id === tableId)) {
      setSelectedTables([...selectedTables, table]);
      message.success(`已添加表: ${table.alias}`);
    }
  };

  const handleRemoveTable = (tableId: string) => {
    setSelectedTables(selectedTables.filter(t => t.id !== tableId));
    setJoins(joins.filter(j => j.leftTable !== tableId && j.rightTable !== tableId));
    message.success('已删除表');
  };

  const handleAddJoin = () => {
    if (selectedTables.length < 2) {
      message.warning('至少需要两个表才能创建关联');
      return;
    }

    const newJoin: JoinConfig = {
      id: `join_${Date.now()}`,
      leftTable: selectedTables[0].id,
      rightTable: selectedTables[1].id,
      leftField: '',
      rightField: '',
      joinType: 'inner'
    };

    setJoins([...joins, newJoin]);
  };

  const handleUpdateJoin = (joinId: string, updates: Partial<JoinConfig>) => {
    setJoins(joins.map(join => 
      join.id === joinId ? { ...join, ...updates } : join
    ));
  };

  const handleRemoveJoin = (joinId: string) => {
    setJoins(joins.filter(j => j.id !== joinId));
  };

  const generateJoinedData = () => {
    if (selectedTables.length === 0) return [];
    
    let result = selectedTables[0].data;
    
    joins.forEach(join => {
      const leftTable = selectedTables.find(t => t.id === join.leftTable);
      const rightTable = selectedTables.find(t => t.id === join.rightTable);
      
      if (leftTable && rightTable && join.leftField && join.rightField) {
        const newResult: any[] = [];
        
        result.forEach(leftRow => {
          rightTable.data.forEach(rightRow => {
            if (leftRow[join.leftField] === rightRow[join.rightField]) {
              newResult.push({
                ...leftRow,
                ...Object.fromEntries(
                  Object.entries(rightRow).map(([key, value]) => [`${rightTable.alias}_${key}`, value])
                )
              });
            }
          });
        });
        
        result = newResult;
      }
    });
    
    return result.slice(0, 5); // 限制显示5条
  };

  const getJoinedColumns = () => {
    const columns: any[] = [];
    
    selectedTables.forEach(table => {
      table.fields.forEach(field => {
        columns.push({
          title: `${table.alias}.${field}`,
          dataIndex: table.id === selectedTables[0].id ? field : `${table.alias}_${field}`,
          key: `${table.id}_${field}`,
          width: 120
        });
      });
    });
    
    return columns;
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>
          <DatabaseOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          多表数据关联功能演示
        </Title>
        <Text type="secondary">
          演示如何配置多个数据表之间的关联关系，实现复杂数据查询
        </Text>
      </div>

      {/* 启用多表关联开关 */}
      <Card title="多表关联配置" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Switch
            checkedChildren="多表关联"
            unCheckedChildren="单表"
            checked={multiTableEnabled}
            onChange={setMultiTableEnabled}
          />
          <Text type="secondary" style={{ marginLeft: 8 }}>
            启用多表关联模式
          </Text>
        </div>

        {multiTableEnabled && (
          <>
            {/* 表选择和管理 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text strong>数据表选择</Text>
                <Select
                  style={{ width: 200 }}
                  placeholder="选择要添加的表"
                  onChange={handleAddTable}
                  value=""
                >
                  {availableTables
                    .filter(table => !selectedTables.find(t => t.id === table.id))
                    .map(table => (
                      <Option key={table.id} value={table.id}>
                        {table.alias} ({table.name})
                      </Option>
                    ))
                  }
                </Select>
              </div>

              <Row gutter={[16, 16]}>
                {selectedTables.map((table, index) => (
                  <Col key={table.id} xs={24} sm={12} md={8}>
                    <Card
                      size="small"
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <TableOutlined />
                          <span>{table.alias}</span>
                          {index === 0 && <Tag color="green">主表</Tag>}
                        </div>
                      }
                      extra={
                        selectedTables.length > 1 && (
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
                        {table.fields.map(field => (
                          <Tag key={field} color="blue">{field}</Tag>
                        ))}
                      </Space>
                      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                        {table.data.length} 条记录
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* 表关联配置 */}
            {selectedTables.length >= 2 && (
              <div style={{ marginBottom: 24 }}>
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
                   {joins.map((join, index) => {
                     const leftTable = selectedTables.find(t => t.id === join.leftTable);
                     const rightTable = selectedTables.find(t => t.id === join.rightTable);

                     return (
                       <Col key={join.id} xs={24}>
                         <Card 
                           className="join-config-card"
                           style={{ 
                             border: '1px solid #e8e8e8',
                             borderRadius: 8,
                             boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                             transition: 'all 0.3s ease'
                           }}
                           hoverable
                           title={
                             <Row justify="space-between" align="middle">
                               <Col>
                                 <Space>
                                   <LinkOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                                   <Text strong style={{ fontSize: 16 }}>
                                     表关联 #{index + 1}
                                   </Text>
                                 </Space>
                               </Col>
                               <Col>
                                 <Button
                                   type="text"
                                   danger
                                   size="small"
                                   icon={<DeleteOutlined />}
                                   onClick={() => handleRemoveJoin(join.id)}
                                   style={{ 
                                     display: 'flex',
                                     alignItems: 'center',
                                     gap: 4
                                   }}
                                 >
                                   删除
                                 </Button>
                               </Col>
                             </Row>
                           }
                           bodyStyle={{ padding: '20px 24px' }}
                         >
                           {/* 关联配置主体区域 */}
                           <Row gutter={[24, 20]} align="middle">
                             {/* 左表配置区域 */}
                             <Col xs={24} md={10}>
                               <div style={{ 
                                 padding: 16,
                                 backgroundColor: '#f8f9ff',
                                 borderRadius: 6,
                                 border: '1px solid #e6f0ff'
                               }}>
                                 <div style={{ marginBottom: 12 }}>
                                   <Text strong style={{ 
                                     color: '#1890ff',
                                     fontSize: 14,
                                     display: 'flex',
                                     alignItems: 'center',
                                     gap: 6
                                   }}>
                                     <TableOutlined />
                                     左表
                                   </Text>
                                 </div>
                                 <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                   <div>
                                     <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
                                       数据表
                                     </Text>
                                     <Select
                                       style={{ width: '100%' }}
                                       value={join.leftTable}
                                       onChange={(value) => handleUpdateJoin(join.id, { leftTable: value, leftField: '' })}
                                       placeholder="选择左表"
                                     >
                                       {selectedTables.map(table => (
                                         <Option key={table.id} value={table.id}>
                                           <Space>
                                             <TableOutlined style={{ color: '#666' }} />
                                             {table.alias}
                                           </Space>
                                         </Option>
                                       ))}
                                     </Select>
                                   </div>
                                   <div>
                                     <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
                                       关联字段
                                     </Text>
                                     <Select
                                       style={{ width: '100%' }}
                                       value={join.leftField}
                                       onChange={(value) => handleUpdateJoin(join.id, { leftField: value })}
                                       placeholder="选择字段"
                                       disabled={!join.leftTable}
                                     >
                                       {leftTable?.fields.map(field => (
                                         <Option key={field} value={field}>
                                           <Text code style={{ fontSize: 12 }}>{field}</Text>
                                         </Option>
                                       ))}
                                     </Select>
                                   </div>
                                 </Space>
                               </div>
                             </Col>

                             {/* 关联类型区域 */}
                             <Col xs={24} md={4}>
                               <div style={{ 
                                 textAlign: 'center',
                                 padding: '16px 8px',
                                 backgroundColor: '#fafafa',
                                 borderRadius: 6,
                                 border: '1px solid #e8e8e8',
                                 height: '100%',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 justifyContent: 'center'
                               }}>
                                 <Text type="secondary" style={{ 
                                   fontSize: 12, 
                                   marginBottom: 8, 
                                   display: 'block' 
                                 }}>
                                   关联类型
                                 </Text>
                                 <Select
                                   style={{ width: '100%' }}
                                   value={join.joinType}
                                   onChange={(value) => handleUpdateJoin(join.id, { joinType: value })}
                                 >
                                   <Option value="inner">
                                     <Text strong style={{ color: '#52c41a' }}>INNER</Text>
                                   </Option>
                                   <Option value="left">
                                     <Text strong style={{ color: '#1890ff' }}>LEFT</Text>
                                   </Option>
                                   <Option value="right">
                                     <Text strong style={{ color: '#722ed1' }}>RIGHT</Text>
                                   </Option>
                                   <Option value="full">
                                     <Text strong style={{ color: '#fa8c16' }}>FULL</Text>
                                   </Option>
                                 </Select>
                               </div>
                             </Col>

                             {/* 右表配置区域 */}
                             <Col xs={24} md={10}>
                               <div style={{ 
                                 padding: 16,
                                 backgroundColor: '#f6fff8',
                                 borderRadius: 6,
                                 border: '1px solid #e6ffe6'
                               }}>
                                 <div style={{ marginBottom: 12 }}>
                                   <Text strong style={{ 
                                     color: '#52c41a',
                                     fontSize: 14,
                                     display: 'flex',
                                     alignItems: 'center',
                                     gap: 6
                                   }}>
                                     <TableOutlined />
                                     右表
                                   </Text>
                                 </div>
                                 <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                   <div>
                                     <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
                                       数据表
                                     </Text>
                                     <Select
                                       style={{ width: '100%' }}
                                       value={join.rightTable}
                                       onChange={(value) => handleUpdateJoin(join.id, { rightTable: value, rightField: '' })}
                                       placeholder="选择右表"
                                     >
                                       {selectedTables.map(table => (
                                         <Option key={table.id} value={table.id}>
                                           <Space>
                                             <TableOutlined style={{ color: '#666' }} />
                                             {table.alias}
                                           </Space>
                                         </Option>
                                       ))}
                                     </Select>
                                   </div>
                                   <div>
                                     <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
                                       关联字段
                                     </Text>
                                     <Select
                                       style={{ width: '100%' }}
                                       value={join.rightField}
                                       onChange={(value) => handleUpdateJoin(join.id, { rightField: value })}
                                       placeholder="选择字段"
                                       disabled={!join.rightTable}
                                     >
                                       {rightTable?.fields.map(field => (
                                         <Option key={field} value={field}>
                                           <Text code style={{ fontSize: 12 }}>{field}</Text>
                                         </Option>
                                       ))}
                                     </Select>
                                   </div>
                                 </Space>
                               </div>
                             </Col>
                           </Row>

                           {/* 关联条件预览 */}
                           {join.leftTable && join.rightTable && join.leftField && join.rightField && (
                             <div style={{ 
                               marginTop: 20,
                               padding: 16,
                               backgroundColor: '#fff9e6',
                               borderRadius: 6,
                               border: '1px solid #ffe58f'
                             }}>
                               <Row align="middle" gutter={12}>
                                 <Col>
                                   <Text type="secondary" style={{ fontSize: 12 }}>
                                     关联条件:
                                   </Text>
                                 </Col>
                                 <Col flex="auto">
                                   <Text 
                                     code 
                                     style={{ 
                                       fontSize: 13,
                                       fontFamily: 'Monaco, Consolas, monospace',
                                       backgroundColor: 'transparent',
                                       padding: '4px 8px',
                                       border: '1px solid #d9d9d9',
                                       borderRadius: 4,
                                       color: '#2c3e50'
                                     }}
                                   >
                                     {leftTable?.alias}.{join.leftField} = {rightTable?.alias}.{join.rightField}
                                   </Text>
                                 </Col>
                               </Row>
                             </div>
                           )}
                         </Card>
                       </Col>
                     );
                   })}
                 </Row>

                                 {/* SQL预览 */}
                 {joins.length > 0 && joins.every(join => join.leftField && join.rightField) && (
                   <div style={{ marginTop: 24 }}>
                     <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                       <DatabaseOutlined style={{ marginRight: 8 }} />
                       SQL语句预览
                     </Text>
                     <Card 
                       size="small" 
                       style={{ 
                         marginTop: 12, 
                         backgroundColor: '#f8f9fa',
                         border: '1px solid #e9ecef'
                       }}
                     >
                       <div style={{ 
                         fontFamily: 'Monaco, Consolas, "Courier New", monospace', 
                         fontSize: 13,
                         lineHeight: 1.6,
                         color: '#24292e'
                       }}>
                         <div style={{ color: '#0969da', fontWeight: 'bold' }}>SELECT</div>
                         <div style={{ paddingLeft: 20, color: '#6f42c1' }}>*</div>
                         <div style={{ color: '#0969da', fontWeight: 'bold', marginTop: 4 }}>FROM</div>
                         <div style={{ paddingLeft: 20, color: '#d73a49', fontWeight: 'bold' }}>
                           {selectedTables[0]?.name}
                         </div>
                         {joins.map((join, index) => {
                           const leftTable = selectedTables.find(t => t.id === join.leftTable);
                           const rightTable = selectedTables.find(t => t.id === join.rightTable);
                           return (
                             <div key={join.id} style={{ marginTop: 4 }}>
                               <span style={{ color: '#0969da', fontWeight: 'bold' }}>
                                 {join.joinType.toUpperCase()} JOIN
                               </span>
                               <span style={{ color: '#d73a49', fontWeight: 'bold', marginLeft: 8 }}>
                                 {rightTable?.name}
                               </span>
                               <span style={{ color: '#0969da', fontWeight: 'bold', marginLeft: 8 }}>
                                 ON
                               </span>
                               <div style={{ paddingLeft: 20, marginTop: 2 }}>
                                 <span style={{ color: '#d73a49' }}>{leftTable?.name}</span>
                                 <span style={{ color: '#6f42c1' }}>.</span>
                                 <span style={{ color: '#005cc5' }}>{join.leftField}</span>
                                 <span style={{ color: '#d73a49', margin: '0 8px' }}>=</span>
                                 <span style={{ color: '#d73a49' }}>{rightTable?.name}</span>
                                 <span style={{ color: '#6f42c1' }}>.</span>
                                 <span style={{ color: '#005cc5' }}>{join.rightField}</span>
                               </div>
                             </div>
                           );
                         })}
                       </div>
                     </Card>
                   </div>
                 )}
              </div>
            )}
          </>
        )}
      </Card>

      {/* 关联结果预览 */}
      {multiTableEnabled && selectedTables.length > 0 && (
        <Card title="关联结果预览">
          {joins.length === 0 ? (
            <Alert
              message="未配置表关联"
              description="请添加表关联关系以查看合并后的数据"
              type="info"
              showIcon
            />
          ) : (
            <Table
              dataSource={generateJoinedData()}
              columns={getJoinedColumns()}
              pagination={false}
              scroll={{ x: true }}
              size="small"
              rowKey={(record, index) => index?.toString() || '0'}
            />
          )}
        </Card>
      )}

      {/* 功能说明 */}
      <Card title="功能说明" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              <TableOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
              <Title level={5}>多表选择</Title>
              <Text type="secondary">支持从多个数据表中选择需要关联的表</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              <LinkOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
              <Title level={5}>关联配置</Title>
              <Text type="secondary">支持INNER、LEFT、RIGHT、FULL四种关联类型</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              <DatabaseOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
              <Title level={5}>SQL生成</Title>
              <Text type="secondary">自动生成标准SQL查询语句</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              <PlusOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
              <Title level={5}>实时预览</Title>
              <Text type="secondary">实时显示关联后的数据结果</Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MultiTableDemo; 