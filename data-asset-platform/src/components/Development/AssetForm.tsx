import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Tag,
  Upload,
  Switch,
  InputNumber,
  DatePicker,
  Space,
  Divider,
  message,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  SaveOutlined,
  EyeOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';
import type { Asset, Field } from '@types/index';

const { Option } = Select;
const { TextArea } = Input;

interface AssetFormProps {
  initialData?: Partial<Asset>;
  onSave: (data: Partial<Asset>) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const AssetForm: React.FC<AssetFormProps> = ({ initialData, onSave, onCancel, mode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<Partial<Field>[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
      setFields(initialData.fields || []);
      setTags(initialData.tags || []);
    }
  }, [initialData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const assetData = {
        ...values,
        tags,
        fields,
        createdAt: mode === 'create' ? new Date().toISOString() : initialData?.createdAt,
        updatedAt: new Date().toISOString(),
      };

      await onSave(assetData);
      showSuccess(mode === 'create' ? '资产创建成功' : '资产更新成功');
    } catch (error) {
      console.error('保存失败:', error);
      showError('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setFields([...fields, {
      name: '',
      type: 'string',
      description: '',
      nullable: true,
      primaryKey: false,
    }]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const basicInfoTab = (
    <Card title="基本信息" style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="资产名称"
            rules={[{ required: true, message: '请输入资产名称' }]}
          >
            <Input placeholder="请输入资产名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="type"
            label="资产类型"
            rules={[{ required: true, message: '请选择资产类型' }]}
          >
            <Select placeholder="请选择资产类型">
              <Option value="table">数据表</Option>
              <Option value="view">视图</Option>
              <Option value="api">API接口</Option>
              <Option value="file">文件</Option>
              <Option value="dashboard">仪表板</Option>
              <Option value="report">报表</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="department"
            label="所属部门"
            rules={[{ required: true, message: '请选择所属部门' }]}
          >
            <Select placeholder="请选择所属部门">
              <Option value="数据中心">数据中心</Option>
              <Option value="产品部">产品部</Option>
              <Option value="技术部">技术部</Option>
              <Option value="运营部">运营部</Option>
              <Option value="财务部">财务部</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="owner"
            label="负责人"
            rules={[{ required: true, message: '请输入负责人' }]}
          >
            <Input placeholder="请输入负责人" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="description"
            label="资产描述"
            rules={[{ required: true, message: '请输入资产描述' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请详细描述该资产的用途、数据来源、更新频率等信息"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">标签管理</Divider>
      <Row gutter={[16, 16]} align="middle">
        <Col span={18}>
          <Input
            placeholder="输入标签名称"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onPressEnter={handleAddTag}
          />
        </Col>
        <Col span={6}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTag}>
            添加标签
          </Button>
        </Col>
      </Row>
      <div style={{ marginTop: '12px' }}>
        {tags.map((tag, index) => (
          <Tag
            key={index}
            closable
            onClose={() => handleRemoveTag(tag)}
            style={{ marginBottom: '8px' }}
          >
            {tag}
          </Tag>
        ))}
      </div>
    </Card>
  );

  const fieldsTab = (
    <Card title="字段定义">
      <div style={{ marginBottom: '16px' }}>
        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddField} block>
          添加字段
        </Button>
      </div>
      
      {fields.map((field, index) => (
        <Card 
          key={index} 
          size="small" 
          style={{ marginBottom: '12px' }}
          extra={
            <Button 
              type="text" 
              danger 
              icon={<MinusCircleOutlined />}
              onClick={() => handleRemoveField(index)}
            >
              删除
            </Button>
          }
        >
          <Row gutter={[12, 12]}>
            <Col span={6}>
              <Input
                placeholder="字段名称"
                value={field.name}
                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="类型"
                value={field.type}
                onChange={(value) => handleFieldChange(index, 'type', value)}
                style={{ width: '100%' }}
              >
                <Option value="string">字符串</Option>
                <Option value="number">数字</Option>
                <Option value="boolean">布尔</Option>
                <Option value="date">日期</Option>
                <Option value="timestamp">时间戳</Option>
              </Select>
            </Col>
            <Col span={8}>
              <Input
                placeholder="描述"
                value={field.description}
                onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
              />
            </Col>
            <Col span={3}>
              <Switch
                checkedChildren="可空"
                unCheckedChildren="非空"
                checked={field.nullable}
                onChange={(checked) => handleFieldChange(index, 'nullable', checked)}
              />
            </Col>
            <Col span={3}>
              <Switch
                checkedChildren="主键"
                unCheckedChildren="普通"
                checked={field.primaryKey}
                onChange={(checked) => handleFieldChange(index, 'primaryKey', checked)}
              />
            </Col>
          </Row>
        </Card>
      ))}
    </Card>
  );

  const configTab = (
    <Card title="高级配置">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item name="qualityScore" label="初始质量评分">
            <InputNumber
              min={0}
              max={100}
              placeholder="0-100"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="accessLevel" label="访问级别">
            <Select placeholder="请选择访问级别">
              <Option value="public">公开</Option>
              <Option value="internal">内部</Option>
              <Option value="confidential">机密</Option>
              <Option value="restricted">限制</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="updateFrequency" label="更新频率">
            <Select placeholder="请选择更新频率">
              <Option value="realtime">实时</Option>
              <Option value="daily">每日</Option>
              <Option value="weekly">每周</Option>
              <Option value="monthly">每月</Option>
              <Option value="quarterly">季度</Option>
              <Option value="yearly">年度</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="dataSource" label="数据源">
            <Input placeholder="请输入数据源" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="businessRules" label="业务规则">
            <TextArea 
              rows={3} 
              placeholder="请描述相关的业务规则和约束条件"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="page-container">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'table',
          department: '数据中心',
          qualityScore: 85,
          accessLevel: 'internal',
          updateFrequency: 'daily',
        }}
      >
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>
            {mode === 'create' ? '创建资产' : '编辑资产'}
          </h2>
          <Space>
            <Button onClick={onCancel}>
              取消
            </Button>
            <Button icon={<EyeOutlined />}>
              预览
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
            >
              {mode === 'create' ? '创建' : '保存'}
            </Button>
          </Space>
        </div>

        <Tabs
          defaultActiveKey="basic"
          items={[
            {
              key: 'basic',
              label: (
                <span>
                  <FileTextOutlined style={{ marginRight: '8px' }} />
                  基本信息
                </span>
              ),
              children: basicInfoTab,
            },
            {
              key: 'fields',
              label: (
                <span>
                  <UnorderedListOutlined style={{ marginRight: '8px' }} />
                  字段定义
                </span>
              ),
              children: fieldsTab,
            },
            {
              key: 'config',
              label: (
                <span>
                  <SettingOutlined style={{ marginRight: '8px' }} />
                  高级配置
                </span>
              ),
              children: configTab,
            },
          ]}
        />
      </Form>
    </div>
  );
};

export default AssetForm;
