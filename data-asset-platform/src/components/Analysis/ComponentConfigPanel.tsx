import React from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Slider,
  ColorPicker,
  Space,
  Divider,
  Typography,
  Card,
  Row,
  Col,
  Button,
  Tabs,
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  SettingOutlined,
  BgColorsOutlined,
  BorderOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface ComponentConfigPanelProps {
  component: any;
  onUpdate: (config: any) => void;
}

const ComponentConfigPanel: React.FC<ComponentConfigPanelProps> = ({
  component,
  onUpdate,
}) => {
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: any, allValues: any) => {
    onUpdate({
      ...component,
      config: { ...component.config, ...changedValues },
    });
  };

  const renderChartConfig = () => (
    <Tabs size="small">
      <Tabs.TabPane tab="数据" key="data">
        <Form.Item name="dataSource" label="数据源">
          <Select placeholder="选择数据源">
            <Option value="users">用户数据</Option>
            <Option value="orders">订单数据</Option>
            <Option value="products">商品数据</Option>
            <Option value="sales">销售数据</Option>
          </Select>
        </Form.Item>

        <Form.Item name="xAxis" label="X轴字段">
          <Select placeholder="选择X轴字段">
            <Option value="date">日期</Option>
            <Option value="category">分类</Option>
            <Option value="region">地区</Option>
          </Select>
        </Form.Item>

        <Form.Item name="yAxis" label="Y轴字段">
          <Select mode="multiple" placeholder="选择Y轴字段">
            <Option value="sales">销售额</Option>
            <Option value="orders">订单数</Option>
            <Option value="users">用户数</Option>
            <Option value="conversion">转化率</Option>
          </Select>
        </Form.Item>
      </Tabs.TabPane>

      <Tabs.TabPane tab="样式" key="style">
        <Form.Item name="colors" label="颜色方案">
          <Select>
            <Option value={['#5470c6', '#91cc75', '#fac858']}>默认</Option>
            <Option value={['#ee6666', '#73c0de', '#3ba272']}>清新</Option>
            <Option value={['#fc8452', '#9a60b4', '#ea7ccc']}>活力</Option>
          </Select>
        </Form.Item>

        <Form.Item name="showLegend" label="显示图例" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="showTooltip" label="显示提示框" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="animation" label="动画效果" valuePropName="checked">
          <Switch />
        </Form.Item>

        {component.type === 'chart-line' && (
          <Form.Item name="smooth" label="平滑曲线" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}

        {component.type === 'chart-pie' && (
          <>
            <Form.Item name="roseType" label="玫瑰图" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="showPercentage" label="显示百分比" valuePropName="checked">
              <Switch />
            </Form.Item>
          </>
        )}
      </Tabs.TabPane>

      <Tabs.TabPane tab="布局" key="layout">
        <Form.Item label="图表尺寸">
          <Row gutter={8}>
            <Col span={12}>
              <InputNumber
                placeholder="宽度"
                value={component.size.width}
                onChange={(width) => onUpdate({
                  ...component,
                  size: { ...component.size, width: width || 300 }
                })}
              />
            </Col>
            <Col span={12}>
              <InputNumber
                placeholder="高度"
                value={component.size.height}
                onChange={(height) => onUpdate({
                  ...component,
                  size: { ...component.size, height: height || 200 }
                })}
              />
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label="位置">
          <Row gutter={8}>
            <Col span={12}>
              <InputNumber
                placeholder="X坐标"
                value={component.position.x}
                onChange={(x) => onUpdate({
                  ...component,
                  position: { ...component.position, x: x || 0 }
                })}
              />
            </Col>
            <Col span={12}>
              <InputNumber
                placeholder="Y坐标"
                value={component.position.y}
                onChange={(y) => onUpdate({
                  ...component,
                  position: { ...component.position, y: y || 0 }
                })}
              />
            </Col>
          </Row>
        </Form.Item>
      </Tabs.TabPane>
    </Tabs>
  );

  const renderMetricConfig = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item name="value" label="数值">
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="unit" label="单位">
        <Input placeholder="如：万元、%" />
      </Form.Item>

      <Form.Item name="prefix" label="前缀">
        <Input placeholder="如：￥、$" />
      </Form.Item>

      <Form.Item name="suffix" label="后缀">
        <Input placeholder="如：万、K" />
      </Form.Item>

      <Form.Item name="precision" label="小数位数">
        <Slider min={0} max={4} marks={{ 0: '0', 2: '2', 4: '4' }} />
      </Form.Item>

      <Form.Item name="color" label="颜色">
        <ColorPicker />
      </Form.Item>

      <Divider />

      <Form.Item label="趋势设置">
        <Row gutter={8}>
          <Col span={12}>
            <InputNumber
              placeholder="趋势值"
              value={component.config.trend?.value}
              onChange={(value) => onUpdate({
                ...component,
                config: {
                  ...component.config,
                  trend: { ...component.config.trend, value: value || 0 }
                }
              })}
            />
          </Col>
          <Col span={12}>
            <Select
              placeholder="方向"
              value={component.config.trend?.direction}
              onChange={(direction) => onUpdate({
                ...component,
                config: {
                  ...component.config,
                  trend: { ...component.config.trend, direction }
                }
              })}
            >
              <Option value="up">上升</Option>
              <Option value="down">下降</Option>
            </Select>
          </Col>
        </Row>
      </Form.Item>
    </Space>
  );

  const renderTextConfig = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item name="content" label="文本内容">
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item name="fontSize" label="字体大小">
        <Slider min={12} max={48} marks={{ 12: '12px', 24: '24px', 48: '48px' }} />
      </Form.Item>

      <Form.Item name="fontWeight" label="字体粗细">
        <Select>
          <Option value="normal">正常</Option>
          <Option value="bold">加粗</Option>
          <Option value="lighter">细体</Option>
        </Select>
      </Form.Item>

      <Form.Item name="color" label="文字颜色">
        <ColorPicker />
      </Form.Item>

      <Form.Item name="align" label="对齐方式">
        <Select>
          <Option value="left">左对齐</Option>
          <Option value="center">居中</Option>
          <Option value="right">右对齐</Option>
        </Select>
      </Form.Item>

      <Form.Item name="backgroundColor" label="背景颜色">
        <ColorPicker />
      </Form.Item>

      <Form.Item name="padding" label="内边距">
        <Slider min={0} max={50} marks={{ 0: '0', 16: '16px', 32: '32px' }} />
      </Form.Item>
    </Space>
  );

  const renderContainerConfig = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item name="backgroundColor" label="背景颜色">
        <ColorPicker />
      </Form.Item>

      <Form.Item name="border" label="边框">
        <Input placeholder="如：1px solid #d9d9d9" />
      </Form.Item>

      <Form.Item name="borderRadius" label="圆角">
        <Slider min={0} max={20} marks={{ 0: '0', 6: '6px', 20: '20px' }} />
      </Form.Item>

      <Form.Item name="padding" label="内边距">
        <Slider min={0} max={50} marks={{ 0: '0', 16: '16px', 32: '32px' }} />
      </Form.Item>

      <Form.Item name="shadow" label="阴影" valuePropName="checked">
        <Switch />
      </Form.Item>
    </Space>
  );

  const renderConfigContent = () => {
    switch (component.type) {
      case 'chart-bar':
      case 'chart-line':
      case 'chart-pie':
      case 'chart-area':
        return renderChartConfig();
      case 'metric-card':
        return renderMetricConfig();
      case 'text-block':
        return renderTextConfig();
      case 'container':
        return renderContainerConfig();
      default:
        return (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <SettingOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <Text>选择组件查看配置选项</Text>
          </div>
        );
    }
  };

  return (
    <Card size="small" style={{ height: '100%' }}>
      <Form
        form={form}
        layout="vertical"
        size="small"
        initialValues={component.config}
        onValuesChange={handleValuesChange}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Space>
              {component.icon}
              <Text strong>{component.name}</Text>
            </Space>
          </div>

          <Divider />

          <Form.Item name="title" label="标题">
            <Input placeholder="输入组件标题" />
          </Form.Item>

          {renderConfigContent()}

          <Divider />

          <Form.Item label="组件设置">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>锁定位置</Text>
                <Switch
                  checked={component.locked}
                  onChange={(locked) => onUpdate({ ...component, locked })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>显示组件</Text>
                <Switch
                  checked={component.visible !== false}
                  onChange={(visible) => onUpdate({ ...component, visible })}
                />
              </div>
            </Space>
          </Form.Item>

          <Form.Item label="层级">
            <InputNumber
              min={0}
              max={100}
              value={component.zIndex}
              onChange={(zIndex) => onUpdate({ ...component, zIndex: zIndex || 0 })}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Space>
      </Form>
    </Card>
  );
};

export default ComponentConfigPanel;
