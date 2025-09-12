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
  Table,
  Modal,
  Alert,
  Cascader,
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
  FolderOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';
import type { Asset, Field } from '@types/index';

const { Option } = Select;
const { TextArea } = Input;

// 资产目录数据（与目录管理中的结构保持一致）
const catalogTreeData = [
  {
    label: '客户类',
    value: '1003',
    children: [
      { label: '集团客户', value: '1004' },
      { label: '战客', value: '1005' },
      { label: '商客', value: '1006' },
      { label: '成员类', value: '1007' },
    ],
  },
  {
    label: '收入类',
    value: '1008',
    children: [
      { label: '财务收入', value: '1009' },
      { label: '省内白名单市场收入', value: '1010' },
      { label: '管会收入', value: '1011' },
      { label: '集团信息化收入', value: '1012' },
      {
        label: '欠费',
        value: '1013',
        children: [
          { label: '正常欠费', value: '1014' },
          { label: '核销欠费', value: '1015' },
          { label: '销账', value: '1017' },
        ],
      },
    ],
  },
];

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
  const [assetType, setAssetType] = useState<string>('table');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [catalogPath, setCatalogPath] = useState<string[]>([]);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
      setFields(initialData.fields || []);
      setTags(initialData.tags || []);
      setAssetType(initialData.type || 'table');
      // 处理目录路径
      if (initialData.catalogPath) {
        setCatalogPath(initialData.catalogPath);
      }
    }
  }, [initialData, form]);

  // 监听资产类型变化
  const handleTypeChange = (type: string) => {
    setAssetType(type);
    // 根据类型自动添加一些默认字段
    if (type === 'table' && fields.length === 0) {
      setFields([
        { name: 'id', type: 'string', description: '主键ID', nullable: false, primaryKey: true },
        { name: 'created_at', type: 'timestamp', description: '创建时间', nullable: false, primaryKey: false },
        { name: 'updated_at', type: 'timestamp', description: '更新时间', nullable: false, primaryKey: false },
      ]);
    } else if (type === 'metric' && fields.length === 0) {
      setFields([
        { name: 'metric_name', type: 'string', description: '指标名称', nullable: false, primaryKey: true },
        { name: 'metric_value', type: 'number', description: '指标值', nullable: false, primaryKey: false },
        { name: 'calculate_time', type: 'timestamp', description: '计算时间', nullable: false, primaryKey: false },
      ]);
    } else if (type === 'tag' && fields.length === 0) {
      setFields([
        { name: 'tag_name', type: 'string', description: '标签名称', nullable: false, primaryKey: true },
        { name: 'tag_value', type: 'string', description: '标签值', nullable: true, primaryKey: false },
        { name: 'tag_type', type: 'string', description: '标签类型', nullable: false, primaryKey: false },
      ]);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const assetData = {
        ...values,
        tags,
        fields,
        catalogPath,
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

  // 生成示例数据预览
  const generateSampleData = () => {
    const data = [];
    for (let i = 0; i < 5; i++) {
      const row: any = {};
      fields.forEach(field => {
        switch (field.type) {
          case 'string':
            row[field.name || ''] = `示例${field.name}${i + 1}`;
            break;
          case 'number':
            row[field.name || ''] = Math.floor(Math.random() * 1000);
            break;
          case 'boolean':
            row[field.name || ''] = Math.random() > 0.5;
            break;
          case 'date':
          case 'timestamp':
            row[field.name || ''] = new Date().toISOString().split('T')[0];
            break;
          default:
            row[field.name || ''] = `示例数据${i + 1}`;
        }
      });
      data.push(row);
    }
    setSampleData(data);
  };

  const handlePreview = () => {
    generateSampleData();
    setPreviewVisible(true);
  };

  const basicInfoTab = (
    <Card title="基本信息" style={{ marginBottom: '24px' }}>
      {/* 类型说明提示 */}
      {assetType && (
        <Alert
          message={
            assetType === 'table' ? '数据表：结构化数据存储，包含字段定义和数据约束' :
            assetType === 'metric' ? '指标：业务度量指标，用于统计分析和监控' :
            assetType === 'tag' ? '标签：数据分类标记，用于数据治理和分类管理' : ''
          }
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

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
            <Select 
              placeholder="请选择资产类型"
              onChange={handleTypeChange}
              value={assetType}
            >
              <Option value="table">数据表</Option>
              <Option value="metric">指标</Option>
              <Option value="tag">标签</Option>
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
            name="catalogPath"
            label="资产目录"
            rules={[{ required: true, message: '请选择资产目录' }]}
            extra="选择资产在目录树中的位置，支持一级、二级、三级目录"
          >
            <Cascader
              options={catalogTreeData}
              value={catalogPath}
              onChange={(value) => {
                setCatalogPath(value as string[]);
                form.setFieldsValue({ catalogPath: value });
              }}
              placeholder="请选择资产所属目录，例如：客户类 > 集团客户"
              expandTrigger="hover"
              showSearch={{
                filter: (inputValue, path) =>
                  path.some(option => option.label?.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
              }}
              style={{ width: '100%' }}
              displayRender={(labels, selectedOptions) => {
                if (labels.length === 0) return '请选择目录';
                return (
                  <span>
                    <FolderOutlined style={{ marginRight: '4px', color: '#1890ff' }} />
                    {labels.join(' > ')}
                  </span>
                );
              }}
              size="large"
            />
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
    <Card title={`字段定义 (${fields.length}个字段)`}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddField}>
          添加字段
        </Button>
        {assetType === 'table' && fields.length > 0 && (
          <Button type="link" onClick={handlePreview}>
            预览表结构
          </Button>
        )}
      </div>
      
      {fields.length === 0 && (
        <Alert
          message={`暂无字段定义，点击"添加字段"开始设计${
            assetType === 'table' ? '数据表' : 
            assetType === 'metric' ? '指标' : '标签'
          }结构`}
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      
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
                {assetType === 'table' ? (
                  <>
                    <Option value="string">VARCHAR</Option>
                    <Option value="number">INT/DECIMAL</Option>
                    <Option value="boolean">BOOLEAN</Option>
                    <Option value="date">DATE</Option>
                    <Option value="timestamp">TIMESTAMP</Option>
                    <Option value="text">TEXT</Option>
                    <Option value="json">JSON</Option>
                  </>
                ) : assetType === 'metric' ? (
                  <>
                    <Option value="string">文本</Option>
                    <Option value="number">数值</Option>
                    <Option value="percentage">百分比</Option>
                    <Option value="currency">货币</Option>
                    <Option value="count">计数</Option>
                  </>
                ) : (
                  <>
                    <Option value="string">字符串</Option>
                    <Option value="category">分类</Option>
                    <Option value="level">等级</Option>
                    <Option value="status">状态</Option>
                  </>
                )}
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
          catalogPath: [],
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
            <Button 
              icon={<EyeOutlined />}
              onClick={handlePreview}
              disabled={assetType !== 'table' || fields.length === 0}
            >
              预览数据
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

      {/* 数据预览模态框 */}
      <Modal
        title="数据预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        width="80%"
      >
        <div style={{ marginBottom: '16px' }}>
          <Alert
            message="以下是根据字段定义生成的示例数据，仅供预览结构参考"
            type="info"
            showIcon
          />
        </div>
        {fields.length > 0 ? (
          <Table
            columns={fields.map(field => ({
              title: (
                <div>
                  <div style={{ fontWeight: 'bold' }}>{field.name}</div>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                    {field.type} {field.primaryKey && '(主键)'} {!field.nullable && '(必填)'}
                  </div>
                </div>
              ),
              dataIndex: field.name,
              key: field.name,
              render: (text) => (
                <div>
                  {field.type === 'boolean' ? (text ? '是' : '否') : text}
                </div>
              )
            }))}
            dataSource={sampleData}
            rowKey={(record, index) => index?.toString() || '0'}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            请先添加字段定义
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssetForm;
