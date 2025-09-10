import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Tooltip,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Switch,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DatabaseOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Field {
  id: string;
  fieldName: string;
  chineseName: string;
  dataType: string;
  length?: number;
  precision?: number;
  nullable: boolean;
  defaultValue?: string;
  description: string;
  category: string;
  status: 'active' | 'inactive';
  wordRoots: string[]; // 组成字段的词根
  creator: string;
  createTime: string;
  updateTime: string;
  usageCount: number;
}

const FieldManagement: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [viewingField, setViewingField] = useState<Field | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const areaRef = useRef<HTMLDivElement>(null);
  const [areaHeight, setAreaHeight] = useState<number>(0);

  // 模拟数据
  const mockFields: Field[] = [
    {
      id: '1',
      fieldName: 'user_id',
      chineseName: '用户标识',
      dataType: 'VARCHAR',
      length: 32,
      nullable: false,
      description: '系统中用户的唯一标识符',
      category: '标识字段',
      status: 'active',
      wordRoots: ['user', 'id'],
      creator: '数据架构师',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-15 10:30:00',
      usageCount: 156,
    },
    {
      id: '2',
      fieldName: 'user_name',
      chineseName: '用户姓名',
      dataType: 'VARCHAR',
      length: 100,
      nullable: false,
      description: '用户的真实姓名',
      category: '基本信息',
      status: 'active',
      wordRoots: ['user', 'name'],
      creator: '业务分析师',
      createTime: '2024-01-10 14:20:00',
      updateTime: '2024-01-12 09:15:00',
      usageCount: 142,
    },
    {
      id: '3',
      fieldName: 'order_amount',
      chineseName: '订单金额',
      dataType: 'DECIMAL',
      length: 10,
      precision: 2,
      nullable: false,
      description: '订单的总金额',
      category: '金额字段',
      status: 'active',
      wordRoots: ['order', 'amount'],
      creator: '业务分析师',
      createTime: '2024-01-08 16:45:00',
      updateTime: '2024-01-20 11:30:00',
      usageCount: 89,
    },
    {
      id: '4',
      fieldName: 'product_price',
      chineseName: '产品价格',
      dataType: 'DECIMAL',
      length: 8,
      precision: 2,
      nullable: true,
      description: '产品的销售价格',
      category: '金额字段',
      status: 'active',
      wordRoots: ['product', 'price'],
      creator: '产品经理',
      createTime: '2024-01-05 09:00:00',
      updateTime: '2024-01-25 14:20:00',
      usageCount: 234,
    },
    {
      id: '5',
      fieldName: 'temp_data',
      chineseName: '临时数据',
      dataType: 'TEXT',
      nullable: true,
      description: '临时存储的数据信息',
      category: '临时字段',
      status: 'inactive',
      wordRoots: ['temp', 'data'],
      creator: '开发人员',
      createTime: '2024-01-03 11:15:00',
      updateTime: '2024-01-28 16:45:00',
      usageCount: 12,
    },
  ];

  useLayoutEffect(() => {
    const compute = () => {
      if (!areaRef.current) return;
      const rect = areaRef.current.getBoundingClientRect();
      const bottomGap = 0;
      const space = Math.max(window.innerHeight - rect.top - bottomGap, 320);
      setAreaHeight(space);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFields(mockFields);
    } catch (error) {
      showError('获取字段列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingField(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Field) => {
    setEditingField(record);
    form.setFieldsValue({
      ...record,
      wordRoots: record.wordRoots,
    });
    setIsModalVisible(true);
  };

  const handleView = (record: Field) => {
    setViewingField(record);
    setIsViewModalVisible(true);
  };

  const handleDelete = async (record: Field) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setFields(prev => prev.filter(item => item.id !== record.id));
      showSuccess('删除成功');
    } catch (error) {
      showError('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const fieldData: Field = {
        ...values,
        id: editingField?.id || Date.now().toString(),
        creator: editingField?.creator || '当前用户',
        createTime: editingField?.createTime || new Date().toLocaleString(),
        updateTime: new Date().toLocaleString(),
        usageCount: editingField?.usageCount || 0,
      };

      if (editingField) {
        setFields(prev => prev.map(item => 
          item.id === editingField.id ? fieldData : item
        ));
        showSuccess('更新成功');
      } else {
        setFields(prev => [...prev, fieldData]);
        showSuccess('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const toggleStatus = async (record: Field) => {
    try {
      const newStatus = record.status === 'active' ? 'inactive' : 'active';
      setFields(prev => prev.map(item => 
        item.id === record.id 
          ? { ...item, status: newStatus, updateTime: new Date().toLocaleString() }
          : item
      ));
      showSuccess(`字段已${newStatus === 'active' ? '启用' : '禁用'}`);
    } catch (error) {
      showError('状态更新失败');
    }
  };

  const filteredFields = fields.filter(item =>
    item.fieldName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.chineseName.includes(searchText) ||
    item.category.includes(searchText) ||
    item.description.includes(searchText) ||
    item.dataType.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: '字段名称',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 140,
      render: (text: string) => (
        <Text code strong>{text}</Text>
      ),
    },
    {
      title: '中文名称',
      dataIndex: 'chineseName',
      key: 'chineseName',
      width: 120,
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 100,
      render: (text: string, record: Field) => (
        <Text>
          {text}
          {record.length && `(${record.length}${record.precision ? `,${record.precision}` : ''})`}
        </Text>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '组成词根',
      dataIndex: 'wordRoots',
      key: 'wordRoots',
      width: 150,
      render: (wordRoots: string[]) => (
        <Space wrap>
          {wordRoots.map((root, index) => (
            <Tag key={index} color="geekblue" style={{ fontSize: '11px' }}>
              {root}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 90,
      sorter: (a: Field, b: Field) => a.usageCount - b.usageCount,
      render: (count: number) => (
        <Text strong style={{ color: count > 100 ? '#52c41a' : count > 50 ? '#faad14' : '#8c8c8c' }}>
          {count}
        </Text>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 140,
      sorter: (a: Field, b: Field) => 
        new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: any, record: Field) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '禁用' : '启用'}>
            <Switch
              size="small"
              checked={record.status === 'active'}
              onChange={() => toggleStatus(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个字段吗？"
            description="删除后不可恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 12 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
          <DatabaseOutlined style={{ marginRight: 8 }} />
          字段管理
        </Title>
      </div>
      <div style={{ marginBottom: 20, color: 'rgba(0, 0, 0, 0.65)' }}>
        管理数据库字段定义，字段由词根组合而成，确保命名规范和数据一致性
      </div>
      <Divider style={{ margin: '8px 0 20px' }} />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div ref={areaRef} style={{ height: areaHeight || undefined, display: 'flex', flexDirection: 'column' }}>
            <Card
              title={
                <Space>
                  字段列表
                  <Text type="secondary" style={{ fontSize: '14px', fontWeight: 'normal' }}>
                    共 {filteredFields.length} 条记录
                  </Text>
                </Space>
              }
              extra={
                <Space>
                  <Input
                    placeholder="搜索字段名称、类型或描述"
                    prefix={<SearchOutlined />}
                    style={{ width: 250 }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    新增字段
                  </Button>
                </Space>
              }
              style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}
              bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              <div style={{ flex: 1, overflow: 'auto' }}>
                <Table
                  columns={columns}
                  dataSource={filteredFields}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 1330 }}
                  pagination={{
                    total: filteredFields.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
                  }}
                />
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingField ? '编辑字段' : '新增字段'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={700}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            category: '基本信息',
            nullable: false,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="字段名称"
                name="fieldName"
                rules={[
                  { required: true, message: '请输入字段名称' },
                  { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '只能包含字母、数字和下划线，且以字母或下划线开头' }
                ]}
              >
                <Input placeholder="请输入字段名称，如：user_id" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="中文名称"
                name="chineseName"
                rules={[{ required: true, message: '请输入中文名称' }]}
              >
                <Input placeholder="请输入字段的中文名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="数据类型"
                name="dataType"
                rules={[{ required: true, message: '请选择数据类型' }]}
              >
                <Select placeholder="请选择数据类型">
                  <Select.Option value="VARCHAR">VARCHAR</Select.Option>
                  <Select.Option value="CHAR">CHAR</Select.Option>
                  <Select.Option value="TEXT">TEXT</Select.Option>
                  <Select.Option value="INT">INT</Select.Option>
                  <Select.Option value="BIGINT">BIGINT</Select.Option>
                  <Select.Option value="DECIMAL">DECIMAL</Select.Option>
                  <Select.Option value="FLOAT">FLOAT</Select.Option>
                  <Select.Option value="DOUBLE">DOUBLE</Select.Option>
                  <Select.Option value="DATE">DATE</Select.Option>
                  <Select.Option value="DATETIME">DATETIME</Select.Option>
                  <Select.Option value="TIMESTAMP">TIMESTAMP</Select.Option>
                  <Select.Option value="BOOLEAN">BOOLEAN</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="长度"
                name="length"
              >
                <Input type="number" placeholder="字段长度" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="精度"
                name="precision"
              >
                <Input type="number" placeholder="小数精度" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="分类"
                name="category"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder="请选择分类">
                  <Select.Option value="标识字段">标识字段</Select.Option>
                  <Select.Option value="基本信息">基本信息</Select.Option>
                  <Select.Option value="金额字段">金额字段</Select.Option>
                  <Select.Option value="时间字段">时间字段</Select.Option>
                  <Select.Option value="状态字段">状态字段</Select.Option>
                  <Select.Option value="临时字段">临时字段</Select.Option>
                  <Select.Option value="统计字段">统计字段</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="组成词根"
                name="wordRoots"
                rules={[{ required: true, message: '请选择组成词根' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择组成该字段的词根"
                  options={[
                    { value: 'user', label: 'user (用户)' },
                    { value: 'order', label: 'order (订单)' },
                    { value: 'product', label: 'product (产品)' },
                    { value: 'id', label: 'id (标识)' },
                    { value: 'name', label: 'name (名称)' },
                    { value: 'amount', label: 'amount (金额)' },
                    { value: 'price', label: 'price (价格)' },
                    { value: 'date', label: 'date (日期)' },
                    { value: 'time', label: 'time (时间)' },
                    { value: 'status', label: 'status (状态)' },
                    { value: 'temp', label: 'temp (临时)' },
                    { value: 'data', label: 'data (数据)' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入详细描述' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="请详细描述该字段的用途和含义"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="是否可为空"
                name="nullable"
                valuePropName="checked"
              >
                <Switch checkedChildren="可为空" unCheckedChildren="不可为空" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                valuePropName="checked"
                getValueFromEvent={(checked) => checked ? 'active' : 'inactive'}
                getValueProps={(value) => ({ checked: value === 'active' })}
              >
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="默认值"
            name="defaultValue"
          >
            <Input placeholder="字段的默认值（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看详情模态框 */}
      <Modal
        title="字段详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {viewingField && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>字段名称：</Text>
                <Text code style={{ fontSize: '16px', marginLeft: 8 }}>
                  {viewingField.fieldName}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>中文名称：</Text>
                <Text style={{ marginLeft: 8 }}>{viewingField.chineseName}</Text>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>数据类型：</Text>
                <Text style={{ marginLeft: 8 }}>
                  {viewingField.dataType}
                  {viewingField.length && `(${viewingField.length}${viewingField.precision ? `,${viewingField.precision}` : ''})`}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>状态：</Text>
                <Tag 
                  color={viewingField.status === 'active' ? 'green' : 'red'}
                  style={{ marginLeft: 8 }}
                >
                  {viewingField.status === 'active' ? '启用' : '禁用'}
                </Tag>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>分类：</Text>
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {viewingField.category}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>是否可空：</Text>
                <Tag color={viewingField.nullable ? 'orange' : 'green'} style={{ marginLeft: 8 }}>
                  {viewingField.nullable ? '可为空' : '不可为空'}
                </Tag>
              </Col>
            </Row>

            <div style={{ marginBottom: 16 }}>
              <Text strong>描述：</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                {viewingField.description}
              </Paragraph>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>组成词根：</Text>
              <div style={{ marginTop: 8 }}>
                <Space wrap>
                  {viewingField.wordRoots.map((root, index) => (
                    <Tag key={index} color="geekblue">
                      {root}
                    </Tag>
                  ))}
                </Space>
              </div>
            </div>

            {viewingField.defaultValue && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>默认值：</Text>
                <Text code style={{ marginLeft: 8 }}>{viewingField.defaultValue}</Text>
              </div>
            )}

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Text strong>使用次数：</Text>
                <Text 
                  style={{ 
                    marginLeft: 8, 
                    color: viewingField.usageCount > 100 ? '#52c41a' : 
                           viewingField.usageCount > 50 ? '#faad14' : '#8c8c8c',
                    fontWeight: 'bold'
                  }}
                >
                  {viewingField.usageCount}
                </Text>
              </Col>
              <Col span={8}>
                <Text strong>创建人：</Text>
                <Text style={{ marginLeft: 8 }}>{viewingField.creator}</Text>
              </Col>
              <Col span={8}>
                <Text strong>创建时间：</Text>
                <Text style={{ marginLeft: 8 }}>{viewingField.createTime}</Text>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Text strong>最后更新：</Text>
                <Text style={{ marginLeft: 8 }}>{viewingField.updateTime}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FieldManagement; 