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
  DatePicker,
  Space,
  Divider,
  message,
  Tabs,
  Modal,
  Alert,
  Cascader,
  Radio,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  FolderOutlined,
  DashboardOutlined,
  CalculatorOutlined,
  BarChartOutlined,
  TableOutlined,
  InfoCircleOutlined,
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

// 指标类型选项
const METRIC_TYPES = [
  { label: '计数指标', value: 'count', description: '统计记录数量' },
  { label: '求和指标', value: 'sum', description: '数值字段求和' },
  { label: '平均值指标', value: 'avg', description: '数值字段平均值' },
  { label: '比率指标', value: 'ratio', description: '比例计算指标' },
  { label: '复合指标', value: 'composite', description: '多指标组合计算' },
];

// 计算周期选项
const CALCULATION_PERIODS = [
  { label: '实时', value: 'realtime' },
  { label: '每小时', value: 'hourly' },
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '每季度', value: 'quarterly' },
  { label: '每年', value: 'yearly' },
];

// 数据源选项
const DATA_SOURCES = [
  { label: '用户行为分析表', value: 'user_behavior' },
  { label: '订单数据表', value: 'order_data' },
  { label: '销售业绩表', value: 'sales_performance' },
  { label: '客户信息表', value: 'customer_info' },
  { label: '财务收入表', value: 'financial_income' },
];

interface MetricFormProps {
  initialData?: Partial<Asset>;
  onSave: (data: Partial<Asset>) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const MetricForm: React.FC<MetricFormProps> = ({ initialData, onSave, onCancel, mode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [catalogPath, setCatalogPath] = useState<string[]>([]);
  const [metricType, setMetricType] = useState<string>('count');
  const [calculationFormula, setCalculationFormula] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
      setTags(initialData.tags || []);
      if (initialData.catalogPath) {
        setCatalogPath(initialData.catalogPath);
      }
      setMetricType(initialData.metricType || 'count');
      setCalculationFormula(initialData.calculationFormula || '');
    }
  }, [initialData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const metricData = {
        ...values,
        type: 'metric',
        tags,
        catalogPath,
        metricType,
        calculationFormula,
        createdAt: mode === 'create' ? new Date().toISOString() : initialData?.createdAt,
        updatedAt: new Date().toISOString(),
      };

      await onSave(metricData);
      showSuccess(mode === 'create' ? '指标创建成功' : '指标更新成功');
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

  const handleMetricTypeChange = (type: string) => {
    setMetricType(type);
    // 根据指标类型设置默认计算公式
    const defaultFormulas = {
      count: 'COUNT(*)',
      sum: 'SUM(column_name)',
      avg: 'AVG(column_name)',
      ratio: '(numerator / denominator) * 100',
      composite: '(metric_a + metric_b) / metric_c',
    };
    setCalculationFormula(defaultFormulas[type as keyof typeof defaultFormulas] || '');
    form.setFieldsValue({ calculationFormula: defaultFormulas[type as keyof typeof defaultFormulas] || '' });
  };

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const selectedMetricType = METRIC_TYPES.find(type => type.value === metricType);

  return (
    <div className="page-container">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'metric',
          department: '数据中心',
          qualityScore: 85,
          accessLevel: 'internal',
          calculationPeriod: 'daily',
          metricType: 'count',
          catalogPath: [],
        }}
      >
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
            <DashboardOutlined style={{ marginRight: '8px', color: '#52C41A' }} />
            {mode === 'create' ? '创建指标' : '编辑指标'}
          </h2>
          <Space>
            <Button onClick={onCancel}>
              取消
            </Button>
            <Button type="primary" onClick={handlePreview}>
              预览指标
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {mode === 'create' ? '创建指标' : '保存指标'}
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
                    message="指标：业务度量指标"
                    description={selectedMetricType?.description || '用于衡量和分析业务表现的数量化指标'}
                    type="info"
                    showIcon
                    style={{ marginBottom: '24px' }}
                  />
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="指标名称"
                        rules={[{ required: true, message: '请输入指标名称' }]}
                      >
                        <Input placeholder="请输入指标名称" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="metricType"
                        label="指标类型"
                        rules={[{ required: true, message: '请选择指标类型' }]}
                      >
                        <Select 
                          placeholder="请选择指标类型"
                          onChange={handleMetricTypeChange}
                        >
                          {METRIC_TYPES.map(type => (
                            <Option key={type.value} value={type.value}>
                              {type.label}
                            </Option>
                          ))}
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
                          <Option value="业务部门">业务部门</Option>
                          <Option value="技术部门">技术部门</Option>
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
                        extra="选择指标在目录树中的位置，支持一级、二级、三级目录"
                      >
                        <Cascader
                          options={catalogTreeData}
                          value={catalogPath}
                          onChange={(value) => {
                            setCatalogPath(value as string[]);
                            form.setFieldsValue({ catalogPath: value });
                          }}
                          placeholder="请选择指标所属目录，例如：收入类 > 财务收入"
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
                        label="指标描述"
                        rules={[{ required: true, message: '请输入指标描述' }]}
                      >
                        <Input.TextArea 
                          rows={4} 
                          placeholder="详细描述指标的业务含义、计算方式、应用场景等"
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
              key: 'calculation',
              label: '计算配置',
              children: (
                <Card>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="dataSources"
                        label="数据来源"
                        rules={[{ required: true, message: '请选择数据来源' }]}
                      >
                        <Select 
                          mode="multiple"
                          placeholder="请选择数据来源表"
                          optionLabelProp="label"
                        >
                          {DATA_SOURCES.map(source => (
                            <Option key={source.value} value={source.value} label={source.label}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <TableOutlined style={{ marginRight: '8px' }} />
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
                        <Select placeholder="请选择计算周期">
                          {CALCULATION_PERIODS.map(period => (
                            <Option key={period.value} value={period.value}>
                              {period.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="calculationFormula"
                        label="计算公式"
                        rules={[{ required: true, message: '请输入计算公式' }]}
                        extra="支持SQL语法，可使用聚合函数如COUNT、SUM、AVG等"
                      >
                        <Input.TextArea
                          rows={6}
                          value={calculationFormula}
                          onChange={(e) => {
                            setCalculationFormula(e.target.value);
                            form.setFieldsValue({ calculationFormula: e.target.value });
                          }}
                          placeholder="例如：SUM(revenue) / COUNT(DISTINCT customer_id)"
                          style={{ fontFamily: 'monospace' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="unit"
                        label="指标单位"
                      >
                        <Input placeholder="例如：元、个、%、次" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="precision"
                        label="数值精度"
                      >
                        <InputNumber 
                          min={0} 
                          max={10} 
                          placeholder="小数点后位数"
                          style={{ width: '100%' }}
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
                        name="isRealtime"
                        label="实时指标"
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

      {/* 指标预览模态框 */}
      <Modal
        title={
          <span>
            <BarChartOutlined style={{ marginRight: '8px' }} />
            指标预览
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
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52C41A' }}>
                    1,234
                  </div>
                  <div style={{ color: '#666' }}>当前值</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    +12.5%
                  </div>
                  <div style={{ color: '#666' }}>环比增长</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                    98.7%
                  </div>
                  <div style={{ color: '#666' }}>数据质量</div>
                </div>
              </Col>
            </Row>
          </Card>
          <Alert
            message="这是指标效果预览"
            description="实际指标将根据配置的计算公式和数据源进行实时计算"
            type="info"
            showIcon
          />
        </div>
      </Modal>
    </div>
  );
};

export default MetricForm;
