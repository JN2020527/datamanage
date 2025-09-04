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
  TreeSelect,
  Switch,
  DatePicker,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface DataStandard {
  id: string;
  name: string;
  category: string;
  description: string;
  dataType: string;
  format: string;
  constraints: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    allowedValues?: string[];
  };
  tags: string[];
  status: 'draft' | 'active' | 'deprecated';
  version: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  compliance: string[];
}

const DataStandards: React.FC = () => {
  const [standards, setStandards] = useState<DataStandard[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStandard, setEditingStandard] = useState<DataStandard | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { showSuccess, showError } = useNotification();

  // 模拟数据
  const mockStandards: DataStandard[] = [
    {
      id: '1',
      name: '用户ID标准',
      category: '身份标识',
      description: '用户唯一标识符的数据标准，确保用户ID的唯一性和格式规范',
      dataType: 'string',
      format: 'UUID',
      constraints: {
        required: true,
        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
      },
      tags: ['身份', '唯一标识', 'UUID'],
      status: 'active',
      version: '1.2.0',
      owner: '数据架构师',
      createdAt: '2024-01-15',
      updatedAt: '2024-08-20',
      compliance: ['GDPR', 'SOX'],
    },
    {
      id: '2',
      name: '手机号码标准',
      category: '联系信息',
      description: '中国大陆手机号码格式标准，支持三大运营商所有号段',
      dataType: 'string',
      format: 'mobile',
      constraints: {
        required: false,
        pattern: '^1[3-9]\\d{9}$',
        minLength: 11,
        maxLength: 11,
      },
      tags: ['联系方式', '手机', '通信'],
      status: 'active',
      version: '2.1.0',
      owner: '业务分析师',
      createdAt: '2024-02-10',
      updatedAt: '2024-09-01',
      compliance: ['个人信息保护法'],
    },
    {
      id: '3',
      name: '金额标准',
      category: '财务数据',
      description: '财务金额的统一格式标准，支持多币种，精度到分',
      dataType: 'decimal',
      format: 'currency',
      constraints: {
        required: true,
        minLength: 0,
        maxLength: 15,
      },
      tags: ['金额', '财务', '货币'],
      status: 'active',
      version: '1.0.0',
      owner: '财务专家',
      createdAt: '2024-03-05',
      updatedAt: '2024-07-15',
      compliance: ['SOX', '会计准则'],
    },
    {
      id: '4',
      name: '邮箱地址标准',
      category: '联系信息',
      description: '电子邮箱地址格式标准，符合RFC 5322规范',
      dataType: 'string',
      format: 'email',
      constraints: {
        required: false,
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      },
      tags: ['邮箱', '联系方式', '通信'],
      status: 'active',
      version: '1.1.0',
      owner: '业务分析师',
      createdAt: '2024-01-20',
      updatedAt: '2024-06-10',
      compliance: ['GDPR'],
    },
  ];

  const categories = [
    '身份标识',
    '联系信息',
    '财务数据',
    '时间日期',
    '地理位置',
    '业务编码',
    '其他',
  ];

  const dataTypes = [
    'string',
    'integer',
    'decimal',
    'boolean',
    'date',
    'datetime',
    'json',
    'array',
  ];

  const complianceOptions = [
    'GDPR',
    'SOX',
    '个人信息保护法',
    '网络安全法',
    '会计准则',
    'ISO 27001',
    'CCPA',
  ];

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setStandards(mockStandards);
    } catch (error) {
      showError('加载数据标准失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStandard(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (standard: DataStandard) => {
    setEditingStandard(standard);
    form.setFieldsValue({
      ...standard,
      constraints: {
        ...standard.constraints,
        allowedValues: standard.constraints.allowedValues?.join('\n'),
      },
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const standardData = {
        ...values,
        constraints: {
          ...values.constraints,
          allowedValues: values.constraints?.allowedValues
            ? values.constraints.allowedValues.split('\n').filter(Boolean)
            : undefined,
        },
        id: editingStandard?.id || Date.now().toString(),
        version: editingStandard ? `${editingStandard.version}.1` : '1.0.0',
        createdAt: editingStandard?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      if (editingStandard) {
        setStandards(prev =>
          prev.map(item => (item.id === editingStandard.id ? standardData : item))
        );
        showSuccess('数据标准更新成功');
      } else {
        setStandards(prev => [...prev, standardData]);
        showSuccess('数据标准创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      showError('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setStandards(prev => prev.filter(item => item.id !== id));
      showSuccess('数据标准删除成功');
    } catch (error) {
      showError('删除失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'draft': return 'orange';
      case 'deprecated': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '生效中';
      case 'draft': return '草稿';
      case 'deprecated': return '已废弃';
      default: return status;
    }
  };

  const columns = [
    {
      title: '标准名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DataStandard) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description.slice(0, 50)}...
          </Text>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 100,
      render: (text: string) => <Tag color="cyan">{text}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
    },
    {
      title: '合规要求',
      dataIndex: 'compliance',
      key: 'compliance',
      width: 150,
      render: (compliance: string[]) => (
        <Space wrap>
          {compliance.map(item => (
            <Tag key={item} color="purple" size="small">
              {item}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 100,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 100,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: DataStandard) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个数据标准吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="删除">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderConstraintsForm = () => (
    <Card title="约束条件" size="small">
      <Form.Item name={['constraints', 'required']} valuePropName="checked">
        <Switch checkedChildren="必填" unCheckedChildren="可选" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="最小长度" name={['constraints', 'minLength']}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="最大长度" name={['constraints', 'maxLength']}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="正则表达式" name={['constraints', 'pattern']}>
        <Input placeholder="如：^\\d{11}$" />
      </Form.Item>

      <Form.Item label="允许的值" name={['constraints', 'allowedValues']}>
        <TextArea
          rows={4}
          placeholder="每行一个值，例如：&#10;选项1&#10;选项2&#10;选项3"
        />
      </Form.Item>
    </Card>
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <FileTextOutlined /> 数据标准管理
          </Title>
          <Text type="secondary">
            定义和管理企业数据标准，确保数据质量和一致性
          </Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建标准
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={standards}
          rowKey="id"
          loading={loading}
          pagination={{
            total: standards.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingStandard ? '编辑数据标准' : '新建数据标准'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'draft',
            owner: '当前用户',
            constraints: {
              required: false,
            },
          }}
        >
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="标准名称"
                          name="name"
                          rules={[{ required: true, message: '请输入标准名称' }]}
                        >
                          <Input placeholder="输入数据标准名称" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="分类"
                          name="category"
                          rules={[{ required: true, message: '请选择分类' }]}
                        >
                          <Select placeholder="选择标准分类">
                            {categories.map(cat => (
                              <Select.Option key={cat} value={cat}>
                                {cat}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label="描述"
                      name="description"
                      rules={[{ required: true, message: '请输入描述' }]}
                    >
                      <TextArea rows={3} placeholder="详细描述这个数据标准的用途和规则" />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          label="数据类型"
                          name="dataType"
                          rules={[{ required: true, message: '请选择数据类型' }]}
                        >
                          <Select placeholder="选择数据类型">
                            {dataTypes.map(type => (
                              <Select.Option key={type} value={type}>
                                {type}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="格式" name="format">
                          <Input placeholder="如：UUID, email, mobile" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="状态"
                          name="status"
                          rules={[{ required: true, message: '请选择状态' }]}
                        >
                          <Select>
                            <Select.Option value="draft">草稿</Select.Option>
                            <Select.Option value="active">生效中</Select.Option>
                            <Select.Option value="deprecated">已废弃</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="负责人" name="owner">
                          <Input placeholder="输入负责人姓名" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="标签" name="tags">
                          <Select
                            mode="tags"
                            placeholder="添加标签"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="合规要求" name="compliance">
                      <Select
                        mode="multiple"
                        placeholder="选择相关的合规要求"
                        style={{ width: '100%' }}
                      >
                        {complianceOptions.map(option => (
                          <Select.Option key={option} value={option}>
                            {option}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'constraints',
                label: '约束规则',
                children: renderConstraintsForm(),
              },
            ]}
          />

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingStandard ? '更新' : '创建'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DataStandards;
