import React, { useState, useEffect } from 'react';
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
  Tabs,
  Switch,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface WordRoot {
  id: string;
  rootName: string;
  category: string;
  meaning: string;
  description: string;
  examples: string[];
  status: 'active' | 'inactive';
  creator: string;
  createTime: string;
  updateTime: string;
  usageCount: number;
}

const WordRootManagement: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [wordRoots, setWordRoots] = useState<WordRoot[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingWordRoot, setEditingWordRoot] = useState<WordRoot | null>(null);
  const [viewingWordRoot, setViewingWordRoot] = useState<WordRoot | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // 模拟数据
  const mockWordRoots: WordRoot[] = [
    {
      id: '1',
      rootName: 'user',
      category: '业务实体',
      meaning: '用户',
      description: '表示系统中的用户实体，包含个人和企业用户',
      examples: ['user_id', 'user_name', 'user_info', 'user_profile'],
      status: 'active',
      creator: '管理员',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-15 10:30:00',
      usageCount: 156,
    },
    {
      id: '2',
      rootName: 'order',
      category: '业务实体',
      meaning: '订单',
      description: '表示业务订单相关的数据实体',
      examples: ['order_id', 'order_status', 'order_amount', 'order_date'],
      status: 'active',
      creator: '数据架构师',
      createTime: '2024-01-10 14:20:00',
      updateTime: '2024-01-12 09:15:00',
      usageCount: 89,
    },
    {
      id: '3',
      rootName: 'product',
      category: '业务实体',
      meaning: '产品',
      description: '表示产品相关信息的数据实体',
      examples: ['product_id', 'product_name', 'product_price', 'product_category'],
      status: 'active',
      creator: '业务分析师',
      createTime: '2024-01-08 16:45:00',
      updateTime: '2024-01-20 11:30:00',
      usageCount: 234,
    },
    {
      id: '4',
      rootName: 'temp',
      category: '临时变量',
      meaning: '临时',
      description: '表示临时性数据或中间结果',
      examples: ['temp_table', 'temp_data', 'temp_result'],
      status: 'inactive',
      creator: '开发人员',
      createTime: '2024-01-05 09:00:00',
      updateTime: '2024-01-25 14:20:00',
      usageCount: 12,
    },
  ];

  useEffect(() => {
    fetchWordRoots();
  }, []);

  const fetchWordRoots = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWordRoots(mockWordRoots);
    } catch (error) {
      showError('获取词根列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingWordRoot(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: WordRoot) => {
    setEditingWordRoot(record);
    form.setFieldsValue({
      ...record,
      examples: record.examples.join('\n'),
    });
    setIsModalVisible(true);
  };

  const handleView = (record: WordRoot) => {
    setViewingWordRoot(record);
    setIsViewModalVisible(true);
  };

  const handleDelete = async (record: WordRoot) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setWordRoots(prev => prev.filter(item => item.id !== record.id));
      showSuccess('删除成功');
    } catch (error) {
      showError('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const examples = values.examples.split('\n').filter((item: string) => item.trim());
      
      const wordRootData: WordRoot = {
        ...values,
        examples,
        id: editingWordRoot?.id || Date.now().toString(),
        creator: editingWordRoot?.creator || '当前用户',
        createTime: editingWordRoot?.createTime || new Date().toLocaleString(),
        updateTime: new Date().toLocaleString(),
        usageCount: editingWordRoot?.usageCount || 0,
      };

      if (editingWordRoot) {
        setWordRoots(prev => prev.map(item => 
          item.id === editingWordRoot.id ? wordRootData : item
        ));
        showSuccess('更新成功');
      } else {
        setWordRoots(prev => [...prev, wordRootData]);
        showSuccess('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const toggleStatus = async (record: WordRoot) => {
    try {
      const newStatus = record.status === 'active' ? 'inactive' : 'active';
      setWordRoots(prev => prev.map(item => 
        item.id === record.id 
          ? { ...item, status: newStatus, updateTime: new Date().toLocaleString() }
          : item
      ));
      showSuccess(`词根已${newStatus === 'active' ? '启用' : '禁用'}`);
    } catch (error) {
      showError('状态更新失败');
    }
  };

  const filteredWordRoots = wordRoots.filter(item =>
    item.rootName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.meaning.includes(searchText) ||
    item.category.includes(searchText) ||
    item.description.includes(searchText)
  );

  const columns = [
    {
      title: '词根名称',
      dataIndex: 'rootName',
      key: 'rootName',
      width: 120,
      render: (text: string, record: WordRoot) => (
        <Space>
          <Text code strong>{text}</Text>
          <Tag color={record.status === 'active' ? 'green' : 'red'}>
            {record.status === 'active' ? '启用' : '禁用'}
          </Tag>
        </Space>
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
      title: '含义',
      dataIndex: 'meaning',
      key: 'meaning',
      width: 100,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 200 }}>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: '使用示例',
      dataIndex: 'examples',
      key: 'examples',
      width: 200,
      render: (examples: string[]) => (
        <Space wrap>
          {examples.slice(0, 2).map((example, index) => (
            <Tag key={index} color="geekblue" style={{ fontSize: '11px' }}>
              {example}
            </Tag>
          ))}
          {examples.length > 2 && (
            <Tag color="default">+{examples.length - 2}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 80,
      sorter: (a: WordRoot, b: WordRoot) => a.usageCount - b.usageCount,
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
      width: 150,
      sorter: (a: WordRoot, b: WordRoot) => 
        new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: WordRoot) => (
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
            title="确定要删除这个词根吗？"
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
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Title level={4} style={{ margin: 0 }}>
                  <FileTextOutlined /> 词根管理
                </Title>
                <Text type="secondary">
                  管理数据命名中使用的词根，确保命名标准化
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <Input
                  placeholder="搜索词根名称、含义或描述"
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
                  新增词根
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredWordRoots}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: filteredWordRoots.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
          }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingWordRoot ? '编辑词根' : '新增词根'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            category: '业务实体',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="词根名称"
                name="rootName"
                rules={[
                  { required: true, message: '请输入词根名称' },
                  { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '只能包含字母、数字和下划线，且以字母或下划线开头' }
                ]}
              >
                <Input placeholder="请输入词根名称，如：user" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="分类"
                name="category"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder="请选择分类">
                  <Select.Option value="业务实体">业务实体</Select.Option>
                  <Select.Option value="属性修饰">属性修饰</Select.Option>
                  <Select.Option value="状态标识">状态标识</Select.Option>
                  <Select.Option value="时间相关">时间相关</Select.Option>
                  <Select.Option value="临时变量">临时变量</Select.Option>
                  <Select.Option value="统计指标">统计指标</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="含义"
            name="meaning"
            rules={[{ required: true, message: '请输入词根含义' }]}
          >
            <Input placeholder="请输入词根的中文含义" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入详细描述' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="请详细描述该词根的用途和使用场景"
            />
          </Form.Item>

          <Form.Item
            label="使用示例"
            name="examples"
            rules={[{ required: true, message: '请输入使用示例' }]}
            extra="每行一个示例，展示该词根在实际命名中的应用"
          >
            <TextArea 
              rows={4} 
              placeholder={`user_id\nuser_name\nuser_profile\nuser_status`}
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            valuePropName="checked"
            getValueFromEvent={(checked) => checked ? 'active' : 'inactive'}
            getValueProps={(value) => ({ checked: value === 'active' })}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看详情模态框 */}
      <Modal
        title="词根详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {viewingWordRoot && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>词根名称：</Text>
                <Text code style={{ fontSize: '16px', marginLeft: 8 }}>
                  {viewingWordRoot.rootName}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>状态：</Text>
                <Tag 
                  color={viewingWordRoot.status === 'active' ? 'green' : 'red'}
                  style={{ marginLeft: 8 }}
                >
                  {viewingWordRoot.status === 'active' ? '启用' : '禁用'}
                </Tag>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>分类：</Text>
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {viewingWordRoot.category}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>含义：</Text>
                <Text style={{ marginLeft: 8 }}>{viewingWordRoot.meaning}</Text>
              </Col>
            </Row>

            <div style={{ marginBottom: 16 }}>
              <Text strong>描述：</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                {viewingWordRoot.description}
              </Paragraph>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>使用示例：</Text>
              <div style={{ marginTop: 8 }}>
                <Space wrap>
                  {viewingWordRoot.examples.map((example, index) => (
                    <Tag key={index} color="geekblue">
                      {example}
                    </Tag>
                  ))}
                </Space>
              </div>
            </div>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Text strong>使用次数：</Text>
                <Text 
                  style={{ 
                    marginLeft: 8, 
                    color: viewingWordRoot.usageCount > 100 ? '#52c41a' : 
                           viewingWordRoot.usageCount > 50 ? '#faad14' : '#8c8c8c',
                    fontWeight: 'bold'
                  }}
                >
                  {viewingWordRoot.usageCount}
                </Text>
              </Col>
              <Col span={8}>
                <Text strong>创建人：</Text>
                <Text style={{ marginLeft: 8 }}>{viewingWordRoot.creator}</Text>
              </Col>
              <Col span={8}>
                <Text strong>创建时间：</Text>
                <Text style={{ marginLeft: 8 }}>{viewingWordRoot.createTime}</Text>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Text strong>最后更新：</Text>
                <Text style={{ marginLeft: 8 }}>{viewingWordRoot.updateTime}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WordRootManagement; 