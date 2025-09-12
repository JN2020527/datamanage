import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';
import { getAssetTypeInfo } from '@utils/index';

const { Text } = Typography;
const { TextArea } = Input;

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  fields: any[];
  config: any;
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  creator: string;
}

interface TemplateManagerProps {
  onSelectTemplate: (template: Template) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [form] = Form.useForm();
  const { showSuccess, showError } = useNotification();

  // 模拟模板数据
  const mockTemplates: Template[] = [
    {
      id: '1',
      name: '用户行为数据表',
      type: 'table',
      description: '标准的用户行为数据表模板，包含用户ID、行为类型、时间戳等基础字段',
      fields: [
        { name: 'user_id', type: 'string', description: '用户ID', nullable: false, primaryKey: true },
        { name: 'action_type', type: 'string', description: '行为类型', nullable: false },
        { name: 'timestamp', type: 'timestamp', description: '行为时间', nullable: false },
        { name: 'properties', type: 'string', description: '行为属性JSON', nullable: true },
      ],
      config: {
        qualityScore: 90,
        accessLevel: 'internal',
        updateFrequency: 'realtime',
      },
      isDefault: true,
      usageCount: 45,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      creator: '系统管理员',
    },
    {
      id: '2',
      name: '商品信息表',
      type: 'table',
      description: '电商商品信息标准模板，包含商品基础信息、价格、库存等字段',
      fields: [
        { name: 'product_id', type: 'string', description: '商品ID', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', description: '商品名称', nullable: false },
        { name: 'price', type: 'number', description: '价格', nullable: false },
        { name: 'stock', type: 'number', description: '库存数量', nullable: false },
        { name: 'category', type: 'string', description: '商品分类', nullable: false },
      ],
      config: {
        qualityScore: 85,
        accessLevel: 'public',
        updateFrequency: 'daily',
      },
      isDefault: false,
      usageCount: 23,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
      creator: '张三',
    },
    {
      id: '3',
      name: 'API接口文档',
      type: 'api',
      description: 'RESTful API接口标准文档模板',
      fields: [
        { name: 'endpoint', type: 'string', description: '接口地址', nullable: false },
        { name: 'method', type: 'string', description: '请求方法', nullable: false },
        { name: 'parameters', type: 'string', description: '请求参数', nullable: true },
        { name: 'response', type: 'string', description: '响应格式', nullable: true },
      ],
      config: {
        qualityScore: 88,
        accessLevel: 'internal',
        updateFrequency: 'weekly',
      },
      isDefault: false,
      usageCount: 12,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-18T00:00:00Z',
      creator: '李四',
    },
  ];

  useEffect(() => {
    setTemplates(mockTemplates);
  }, []);

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    form.setFieldsValue(template);
    setModalVisible(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      setTemplates(templates.filter(t => t.id !== id));
      showSuccess('模板删除成功');
    } catch (error) {
      showError('删除失败，请重试');
    }
  };

  const handleCloneTemplate = async (template: Template) => {
    try {
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (副本)`,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: '当前用户',
        isDefault: false,
      };
      setTemplates([newTemplate, ...templates]);
      showSuccess('模板复制成功');
    } catch (error) {
      showError('复制失败，请重试');
    }
  };

  const handleToggleDefault = async (id: string) => {
    try {
      setTemplates(templates.map(t => ({
        ...t,
        isDefault: t.id === id ? !t.isDefault : t.isDefault,
      })));
      showSuccess('设置已更新');
    } catch (error) {
      showError('设置失败，请重试');
    }
  };

  const handleSaveTemplate = async (values: any) => {
    setLoading(true);
    try {
      if (editingTemplate) {
        // 编辑模板
        setTemplates(templates.map(t => 
          t.id === editingTemplate.id 
            ? { ...t, ...values, updatedAt: new Date().toISOString() }
            : t
        ));
        showSuccess('模板更新成功');
      } else {
        // 创建新模板
        const newTemplate: Template = {
          ...values,
          id: Date.now().toString(),
          fields: [],
          config: {},
          isDefault: false,
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          creator: '当前用户',
        };
        setTemplates([newTemplate, ...templates]);
        showSuccess('模板创建成功');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      showError('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Template) => (
        <Space>
          <Text strong>{text}</Text>
          {record.isDefault && (
            <Tag color="gold" icon={<StarFilled />}>
              默认
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeInfo = getAssetTypeInfo(type);
        return (
          <Tag color={typeInfo.color}>
            {React.createElement(typeInfo.icon)} {typeInfo.text}
          </Tag>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
      sorter: (a: Template, b: Template) => a.usageCount - b.usageCount,
    },
    {
      title: '创建者',
      dataIndex: 'creator',
      key: 'creator',
      width: 120,
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record: Template) => (
        <Space size="small">
          <Tooltip title="使用模板">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onSelectTemplate(record)}
            >
              使用
            </Button>
          </Tooltip>
          <Tooltip title="编辑模板">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditTemplate(record)}
            />
          </Tooltip>
          <Tooltip title="复制模板">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCloneTemplate(record)}
            />
          </Tooltip>
          <Tooltip title={record.isDefault ? '取消默认' : '设为默认'}>
            <Button
              size="small"
              icon={record.isDefault ? <StarFilled /> : <StarOutlined />}
              onClick={() => handleToggleDefault(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个模板吗？"
            onConfirm={() => handleDeleteTemplate(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="模板管理"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateTemplate}
        >
          创建模板
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={templates}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
        }}
      />

      <Modal
        title={editingTemplate ? '编辑模板' : '创建模板'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveTemplate}
        >
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="资产类型"
            rules={[{ required: true, message: '请选择资产类型' }]}
          >
            <Select placeholder="请选择资产类型">
              <Select.Option value="table">数据表</Select.Option>
              <Select.Option value="view">视图</Select.Option>
              <Select.Option value="api">API接口</Select.Option>
              <Select.Option value="file">文件</Select.Option>
              <Select.Option value="dashboard">仪表板</Select.Option>
              <Select.Option value="report">报表</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="模板描述"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述模板的用途和适用场景"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TemplateManager;
