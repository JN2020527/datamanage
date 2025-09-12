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
  Switch,
  InputNumber,
  Space,
  Divider,
  message,
  Tabs,
  Modal,
  Alert,
  Cascader,
  Radio,
  TreeSelect,
  Transfer,
  Checkbox,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  FolderOutlined,
  TagOutlined,
  BranchesOutlined,
  FilterOutlined,
  EyeOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';
import type { Asset } from '@types/index';

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

// 标签类型选项
const TAG_TYPES = [
  { label: '属性标签', value: 'attribute', description: '描述对象的基本属性特征' },
  { label: '行为标签', value: 'behavior', description: '基于行为数据生成的标签' },
  { label: '偏好标签', value: 'preference', description: '反映用户偏好的标签' },
  { label: '风险标签', value: 'risk', description: '用于风险识别和控制' },
  { label: '价值标签', value: 'value', description: '评估对象价值等级' },
];

// 标签层级选项
const TAG_LEVELS = [
  { label: '一级标签', value: 1 },
  { label: '二级标签', value: 2 },
  { label: '三级标签', value: 3 },
  { label: '四级标签', value: 4 },
];

// 应用对象选项
const APPLY_OBJECTS = [
  { key: 'user', title: '用户', description: '针对用户的标签' },
  { key: 'product', title: '产品', description: '针对产品的标签' },
  { key: 'order', title: '订单', description: '针对订单的标签' },
  { key: 'merchant', title: '商户', description: '针对商户的标签' },
  { key: 'content', title: '内容', description: '针对内容的标签' },
];

// 数据源选项
const DATA_SOURCES = [
  { label: '用户行为分析表', value: 'user_behavior' },
  { label: '订单数据表', value: 'order_data' },
  { label: '销售业绩表', value: 'sales_performance' },
  { label: '客户信息表', value: 'customer_info' },
  { label: '财务收入表', value: 'financial_income' },
];

// 标签值类型
const VALUE_TYPES = [
  { label: '枚举值', value: 'enum', description: '固定的几个可选值' },
  { label: '数值型', value: 'numeric', description: '连续的数值范围' },
  { label: '布尔型', value: 'boolean', description: '是/否两个值' },
  { label: '文本型', value: 'text', description: '自由文本内容' },
  { label: '日期型', value: 'date', description: '日期时间值' },
];

interface TagFormProps {
  initialData?: Partial<Asset>;
  onSave: (data: Partial<Asset>) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const TagForm: React.FC<TagFormProps> = ({ initialData, onSave, onCancel, mode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [catalogPath, setCatalogPath] = useState<string[]>([]);
  const [tagType, setTagType] = useState<string>('attribute');
  const [valueType, setValueType] = useState<string>('enum');
  const [enumValues, setEnumValues] = useState<string[]>([]);
  const [newEnumValue, setNewEnumValue] = useState('');
  const [applyObjects, setApplyObjects] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
      setTags(initialData.tags || []);
      if (initialData.catalogPath) {
        setCatalogPath(initialData.catalogPath);
      }
      setTagType(initialData.tagType || 'attribute');
      setValueType(initialData.valueType || 'enum');
      setEnumValues(initialData.enumValues || []);
      setApplyObjects(initialData.applyObjects || []);
    }
  }, [initialData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const tagData = {
        ...values,
        type: 'tag',
        tags,
        catalogPath,
        tagType,
        valueType,
        enumValues,
        applyObjects,
        createdAt: mode === 'create' ? new Date().toISOString() : initialData?.createdAt,
        updatedAt: new Date().toISOString(),
      };

      await onSave(tagData);
      showSuccess(mode === 'create' ? '标签创建成功' : '标签更新成功');
    } catch (error) {
      console.error('保存失败:', error);
      showError('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddEnumValue = () => {
    if (newEnumValue.trim() && !enumValues.includes(newEnumValue.trim())) {
      setEnumValues([...enumValues, newEnumValue.trim()]);
      setNewEnumValue('');
    }
  };

  const handleRemoveEnumValue = (valueToRemove: string) => {
    setEnumValues(enumValues.filter(value => value !== valueToRemove));
  };

  const handleValueTypeChange = (type: string) => {
    setValueType(type);
    // 清除枚举值（如果不是枚举类型）
    if (type !== 'enum') {
      setEnumValues([]);
    }
  };

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const selectedTagType = TAG_TYPES.find(type => type.value === tagType);
  const selectedValueType = VALUE_TYPES.find(type => type.value === valueType);

  return (
    <div className="page-container">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'tag',
          department: '数据中心',
          qualityScore: 85,
          accessLevel: 'internal',
          tagType: 'attribute',
          valueType: 'enum',
          tagLevel: 1,
          catalogPath: [],
        }}
      >
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
            <TagOutlined style={{ marginRight: '8px', color: '#FAAD14' }} />
            {mode === 'create' ? '创建标签' : '编辑标签'}
          </h2>
          <Space>
            <Button onClick={onCancel}>
              取消
            </Button>
            <Button type="primary" onClick={handlePreview}>
              预览标签
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {mode === 'create' ? '创建标签' : '保存标签'}
            </Button>
          </Space>
        </div>

        <Tabs
          defaultActiveKey="basic"
          items={[
            {
              key: 'basic',
              label: '基本信息',
              children: (
                <Card>
                  <Alert
                    message="标签：数据分类标签"
                    description={selectedTagType?.description || '用于对数据进行分类和标记的标识符'}
                    type="info"
                    showIcon
                    style={{ marginBottom: '24px' }}
                  />
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="标签名称"
                        rules={[{ required: true, message: '请输入标签名称' }]}
                      >
                        <Input placeholder="请输入标签名称" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="tagType"
                        label="标签类型"
                        rules={[{ required: true, message: '请选择标签类型' }]}
                      >
                        <Select 
                          placeholder="请选择标签类型"
                          onChange={setTagType}
                          optionLabelProp="label"
                          listHeight={300}
                        >
                          {TAG_TYPES.map(type => (
                            <Option key={type.value} value={type.value} label={type.label}>
                              <div style={{ 
                                padding: '8px 4px',
                                borderBottom: '1px solid #f0f0f0',
                                marginBottom: '0'
                              }}>
                                <div style={{ 
                                  fontWeight: '600', 
                                  marginBottom: '4px',
                                  fontSize: '14px',
                                  color: '#262626'
                                }}>
                                  {type.label}
                                </div>
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#8c8c8c',
                                  lineHeight: '1.5',
                                  marginTop: '2px'
                                }}>
                                  {type.description}
                                </div>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="tagLevel"
                        label="标签层级"
                        rules={[{ required: true, message: '请选择标签层级' }]}
                      >
                        <Select placeholder="请选择标签层级">
                          {TAG_LEVELS.map(level => (
                            <Option key={level.value} value={level.value}>
                              {level.label}
                            </Option>
                          ))}
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
                    <Col span={12}>
                      <Form.Item
                        name="department"
                        label="所属部门"
                        rules={[{ required: true, message: '请选择所属部门' }]}
                      >
                        <Select placeholder="请选择所属部门">
                          <Option value="数据中心">数据中心</Option>
                          <Option value="业务部门">业务部门</Option>
                          <Option value="技术部门">技术部门</Option>
                          <Option value="运营部">运营部</Option>
                          <Option value="财务部">财务部</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="applyObjects"
                        label="应用对象"
                        rules={[{ required: true, message: '请选择应用对象' }]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="请选择标签适用的对象类型"
                          onChange={setApplyObjects}
                        >
                          {APPLY_OBJECTS.map(obj => (
                            <Option key={obj.key} value={obj.key}>
                              {obj.title}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="catalogPath"
                        label="资产目录"
                        rules={[{ required: true, message: '请选择资产目录' }]}
                        extra="选择标签在目录树中的位置，支持一级、二级、三级目录"
                      >
                        <Cascader
                          options={catalogTreeData}
                          value={catalogPath}
                          onChange={(value) => {
                            setCatalogPath(value as string[]);
                            form.setFieldsValue({ catalogPath: value });
                          }}
                          placeholder="请选择标签所属目录，例如：客户类 > 集团客户"
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
                        label="标签描述"
                        rules={[{ required: true, message: '请输入标签描述' }]}
                      >
                        <TextArea 
                          rows={4} 
                          placeholder="详细描述标签的业务含义、使用场景、分类规则等"
                          showCount
                          maxLength={500}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ),
            },
            {
              key: 'rules',
              label: '分类规则',
              children: (
                <Card>
                  <Alert
                    message="分类规则配置"
                    description={selectedValueType?.description || '定义标签的取值规则和计算逻辑'}
                    type="info"
                    showIcon
                    style={{ marginBottom: '24px' }}
                  />
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="valueType"
                        label="标签值类型"
                        rules={[{ required: true, message: '请选择标签值类型' }]}
                      >
                        <Select 
                          placeholder="请选择标签值类型"
                          onChange={handleValueTypeChange}
                          optionLabelProp="label"
                          listHeight={300}
                        >
                          {VALUE_TYPES.map(type => (
                            <Option key={type.value} value={type.value} label={type.label}>
                              <div style={{ 
                                padding: '8px 4px',
                                borderBottom: '1px solid #f0f0f0',
                                marginBottom: '0'
                              }}>
                                <div style={{ 
                                  fontWeight: '600', 
                                  marginBottom: '4px',
                                  fontSize: '14px',
                                  color: '#262626'
                                }}>
                                  {type.label}
                                </div>
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#8c8c8c',
                                  lineHeight: '1.5',
                                  marginTop: '2px'
                                }}>
                                  {type.description}
                                </div>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="dataSources"
                        label="数据来源"
                        rules={[{ required: true, message: '请选择数据来源' }]}
                      >
                        <Select 
                          mode="multiple"
                          placeholder="请选择标签计算的数据来源"
                          optionLabelProp="label"
                        >
                          {DATA_SOURCES.map(source => (
                            <Option key={source.value} value={source.value} label={source.label}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <TableOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                {source.label}
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="calculationPeriod"
                        label="计算周期"
                        rules={[{ required: true, message: '请选择计算周期' }]}
                      >
                        <Select placeholder="请选择标签计算周期">
                          <Option value="realtime">实时计算</Option>
                          <Option value="hourly">每小时</Option>
                          <Option value="daily">每日</Option>
                          <Option value="weekly">每周</Option>
                          <Option value="monthly">每月</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="priority"
                        label="优先级"
                      >
                        <Select placeholder="请选择标签优先级">
                          <Option value="high">高优先级</Option>
                          <Option value="medium">中优先级</Option>
                          <Option value="low">低优先级</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    {/* 枚举值设置 */}
                    {valueType === 'enum' && (
                      <Col span={24}>
                        <Form.Item
                          label="枚举值设置"
                          extra="设置标签的可选值列表，建议添加3-8个枚举值"
                        >
                          <div style={{ marginBottom: '8px' }}>
                            <Space.Compact style={{ width: '100%' }}>
                              <Input
                                placeholder="输入枚举值，例如：高价值客户"
                                value={newEnumValue}
                                onChange={(e) => setNewEnumValue(e.target.value)}
                                onPressEnter={handleAddEnumValue}
                              />
                              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEnumValue}>
                                添加
                              </Button>
                            </Space.Compact>
                          </div>
                          <div style={{ minHeight: '40px', padding: '8px', border: '1px dashed #d9d9d9', borderRadius: '6px' }}>
                            {enumValues.length > 0 ? (
                              enumValues.map((value, index) => (
                                <Tag
                                  key={index}
                                  closable
                                  onClose={() => handleRemoveEnumValue(value)}
                                  style={{ marginBottom: '4px', marginRight: '8px' }}
                                  color="blue"
                                >
                                  {value}
                                </Tag>
                              ))
                            ) : (
                              <div style={{ color: '#999', textAlign: 'center' }}>
                                暂无枚举值，请在上方输入框中添加
                              </div>
                            )}
                          </div>
                        </Form.Item>
                      </Col>
                    )}

                    {/* 数值型设置 */}
                    {valueType === 'numeric' && (
                      <>
                        <Col span={8}>
                          <Form.Item
                            name="minValue"
                            label="最小值"
                          >
                            <InputNumber 
                              style={{ width: '100%' }} 
                              placeholder="最小值"
                              precision={2}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name="maxValue"
                            label="最大值"
                          >
                            <InputNumber 
                              style={{ width: '100%' }} 
                              placeholder="最大值"
                              precision={2}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name="unit"
                            label="数值单位"
                          >
                            <Input placeholder="例如：元、个、%" />
                          </Form.Item>
                        </Col>
                      </>
                    )}

                    {/* 布尔型设置 */}
                    {valueType === 'boolean' && (
                      <Col span={24}>
                        <Alert
                          message="布尔型标签说明"
                          description="布尔型标签只有两个值：是/否、真/假、有/无等，适用于二元分类场景"
                          type="info"
                          showIcon
                          style={{ marginBottom: '16px' }}
                        />
                      </Col>
                    )}

                    {/* 日期型设置 */}
                    {valueType === 'date' && (
                      <>
                        <Col span={12}>
                          <Form.Item
                            name="dateFormat"
                            label="日期格式"
                          >
                            <Select placeholder="请选择日期格式">
                              <Option value="YYYY-MM-DD">年-月-日 (2024-01-15)</Option>
                              <Option value="YYYY-MM-DD HH:mm:ss">年-月-日 时:分:秒</Option>
                              <Option value="YYYY-MM">年-月 (2024-01)</Option>
                              <Option value="timestamp">时间戳</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="dateRange"
                            label="有效期范围"
                          >
                            <Select placeholder="请选择有效期">
                              <Option value="30">近30天</Option>
                              <Option value="90">近3个月</Option>
                              <Option value="365">近1年</Option>
                              <Option value="custom">自定义</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </>
                    )}

                    <Col span={24}>
                      <Divider orientation="left">
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                          <BranchesOutlined style={{ marginRight: '8px' }} />
                          分类规则
                        </span>
                      </Divider>
                    </Col>

                    <Col span={24}>
                      <Form.Item
                        name="classificationRules"
                        label="规则逻辑"
                        rules={[{ required: true, message: '请输入分类规则' }]}
                        extra="描述如何根据数据计算和分配标签值，支持SQL语法和条件表达式"
                      >
                        <TextArea
                          rows={6}
                          placeholder="例如：用户近30天消费金额 > 10000元 则标记为「高价值客户」&#10;或者：IF(SUM(order_amount) > 10000, '高价值客户', '普通客户')"
                          style={{ fontFamily: 'monospace', fontSize: '13px' }}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item
                        name="businessRules"
                        label="业务规则"
                        extra="描述标签的业务逻辑和应用场景"
                      >
                        <TextArea
                          rows={3}
                          placeholder="例如：高价值客户用于精准营销推送，中等价值客户用于促销活动，低价值客户用于挽留策略"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ),
            },
            {
              key: 'settings',
              label: '高级配置',
              children: (
                <Card>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="qualityScore"
                        label="质量评分"
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          step={1}
                          style={{ width: '100%' }}
                          placeholder="0-100分"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="accessLevel"
                        label="访问级别"
                      >
                        <Select placeholder="请选择访问级别">
                          <Option value="public">公开</Option>
                          <Option value="internal">内部</Option>
                          <Option value="restricted">受限</Option>
                          <Option value="confidential">机密</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="isSystemTag"
                        label="系统标签"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="是" unCheckedChildren="否" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="isPublished"
                        label="发布状态"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="已发布" unCheckedChildren="草稿" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="updateFrequency"
                        label="更新频率"
                      >
                        <Select placeholder="请选择更新频率">
                          <Option value="realtime">实时</Option>
                          <Option value="hourly">每小时</Option>
                          <Option value="daily">每日</Option>
                          <Option value="weekly">每周</Option>
                          <Option value="monthly">每月</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="expireTime"
                        label="过期时间（天）"
                      >
                        <InputNumber 
                          min={1} 
                          style={{ width: '100%' }} 
                          placeholder="标签有效期"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="标签管理"
                      >
                        <div style={{ marginBottom: '8px' }}>
                          <Space.Compact style={{ width: '100%' }}>
                            <Input
                              placeholder="输入标签名称"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onPressEnter={handleAddTag}
                            />
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTag}>
                              添加
                            </Button>
                          </Space.Compact>
                        </div>
                        <div>
                          {tags.map((tag, index) => (
                            <Tag
                              key={index}
                              closable
                              onClose={() => handleRemoveTag(tag)}
                              style={{ marginBottom: '4px' }}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ),
            },
          ]}
        />
      </Form>

      {/* 标签预览模态框 */}
      <Modal
        title={
          <span>
            <FilterOutlined style={{ marginRight: '8px' }} />
            标签预览
          </span>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <div>
          <Card size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FAAD14' }}>
                    5,678
                  </div>
                  <div style={{ color: '#666' }}>已标记对象</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {enumValues.length || 3}
                  </div>
                  <div style={{ color: '#666' }}>标签值数量</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52C41A' }}>
                    95.2%
                  </div>
                  <div style={{ color: '#666' }}>覆盖率</div>
                </div>
              </Col>
            </Row>
          </Card>
          
          {enumValues.length > 0 && (
            <Card size="small" style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>标签值分布：</div>
              <div>
                {enumValues.map((value, index) => (
                  <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>
                    {value}
                  </Tag>
                ))}
              </div>
            </Card>
          )}
          
          <Alert
            message="这是标签效果预览"
            description="实际标签将根据配置的分类规则和数据源进行计算和分配"
            type="info"
            showIcon
          />
        </div>
      </Modal>
    </div>
  );
};

export default TagForm;
