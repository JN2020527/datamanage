import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Button,
  Space,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Select,
  Tabs,
  List,
  Tag,
  Tooltip,
  Breadcrumb,
  message,
  Divider,
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DragOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  NumberOutlined,
  TableOutlined,
  SettingOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface DashboardComponent {
  id: string;
  type: 'chart' | 'table' | 'number' | 'text';
  title: string;
  config: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  components: DashboardComponent[];
  layout: {
    cols: number;
    rows: number;
  };
}

const DashboardEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isComponentModalVisible, setIsComponentModalVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟加载看板数据
  useEffect(() => {
    if (id) {
      // 模拟从API加载看板数据
      const mockDashboard: Dashboard = {
        id: id,
        name: '销售业绩看板',
        description: '展示销售团队的关键业绩指标和趋势分析',
        components: [
          {
            id: 'comp-1',
            type: 'number',
            title: '总销售额',
            config: { value: '¥2,345,678', trend: '+12.5%' },
            position: { x: 0, y: 0, width: 6, height: 4 }
          },
          {
            id: 'comp-2',
            type: 'chart',
            title: '月度销售趋势',
            config: { chartType: 'line', dataSource: 'sales_monthly' },
            position: { x: 6, y: 0, width: 12, height: 8 }
          },
          {
            id: 'comp-3',
            type: 'table',
            title: '销售排行榜',
            config: { columns: ['姓名', '销售额', '达成率'], dataSource: 'sales_ranking' },
            position: { x: 0, y: 4, width: 6, height: 8 }
          }
        ],
        layout: { cols: 24, rows: 16 }
      };
      setDashboard(mockDashboard);
    }
  }, [id]);

  // 组件类型配置
  const componentTypes = [
    {
      type: 'number',
      label: '数字指标',
      icon: <NumberOutlined />,
      description: '显示关键数字指标'
    },
    {
      type: 'chart',
      label: '图表组件',
      icon: <BarChartOutlined />,
      description: '柱状图、折线图、饼图等'
    },
    {
      type: 'table',
      label: '数据表格',
      icon: <TableOutlined />,
      description: '展示详细的数据列表'
    },
    {
      type: 'text',
      label: '文本组件',
      icon: <PlusOutlined />,
      description: '标题、说明文字等'
    }
  ];

  const handleSave = async () => {
    try {
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('看板保存成功！');
    } catch (error) {
      message.error('保存失败，请重试');
    }
  };

  const handlePreview = () => {
    // 在新窗口打开预览
    const previewUrl = `/analysis/dashboard/${id}/preview`;
    window.open(previewUrl, '_blank');
  };

  const handleAddComponent = (type: string) => {
    if (!dashboard) return;

    const newComponent: DashboardComponent = {
      id: `comp-${Date.now()}`,
      type: type as any,
      title: `新建${componentTypes.find(t => t.type === type)?.label}`,
      config: {},
      position: { x: 0, y: 0, width: 6, height: 4 }
    };

    setDashboard({
      ...dashboard,
      components: [...dashboard.components, newComponent]
    });
    setIsComponentModalVisible(false);
    message.success('组件添加成功！');
  };

  const handleDeleteComponent = (componentId: string) => {
    if (!dashboard) return;

    Modal.confirm({
      title: '删除组件',
      content: '确定要删除这个组件吗？',
      onOk: () => {
        setDashboard({
          ...dashboard,
          components: dashboard.components.filter(comp => comp.id !== componentId)
        });
        setSelectedComponent(null);
        message.success('组件删除成功！');
      }
    });
  };

  const renderComponent = (component: DashboardComponent) => {
    const isSelected = selectedComponent === component.id;
    
    return (
      <Card
        key={component.id}
        title={
          <Space>
            <DragOutlined />
            {component.title}
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="设置">
              <Button
                type="text"
                size="small"
                icon={<SettingOutlined />}
                onClick={() => {
                  setSelectedComponent(component.id);
                  setIsSettingsVisible(true);
                }}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteComponent(component.id)}
              />
            </Tooltip>
          </Space>
        }
        style={{
          border: isSelected ? '2px solid #1677ff' : '1px solid #d9d9d9',
          cursor: 'move',
          height: '100%'
        }}
        bodyStyle={{ height: 'calc(100% - 57px)' }}
        onClick={() => setSelectedComponent(component.id)}
      >
        {component.type === 'number' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1677ff' }}>
              {component.config.value || '0'}
            </div>
            <div style={{ color: '#52c41a', marginTop: '8px' }}>
              {component.config.trend || '+0%'}
            </div>
          </div>
        )}
        {component.type === 'chart' && (
          <div style={{ 
            height: '100%', 
            background: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <BarChartOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
          </div>
        )}
        {component.type === 'table' && (
          <div style={{ padding: '10px' }}>
            <div style={{ background: '#fafafa', padding: '8px', marginBottom: '4px' }}>
              表头示例
            </div>
            <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
              数据行 1
            </div>
            <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
              数据行 2
            </div>
          </div>
        )}
        {component.type === 'text' && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <Text>{component.config.text || '文本内容'}</Text>
          </div>
        )}
      </Card>
    );
  };

  if (!dashboard) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ padding: '24px', height: '100vh', overflow: 'hidden' }}>
      {/* 顶部操作栏 */}
      <div style={{ marginBottom: '16px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/analysis/dashboard')}
              >
                返回
              </Button>
              <Breadcrumb
                items={[
                  { title: '敏捷分析' },
                  { title: '看板搭建' },
                  { title: dashboard.name }
                ]}
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<EyeOutlined />}
                onClick={handlePreview}
              >
                预览
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
              >
                保存
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={16} style={{ height: 'calc(100vh - 120px)' }}>
        {/* 左侧组件库 */}
        <Col span={4}>
          <Card title="组件库" style={{ height: '100%' }}>
            <List
              dataSource={componentTypes}
              renderItem={(item) => (
                <List.Item
                  style={{ padding: '8px 0', cursor: 'pointer' }}
                  onClick={() => handleAddComponent(item.type)}
                >
                  <List.Item.Meta
                    avatar={item.icon}
                    title={item.label}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 中间画布区域 */}
        <Col span={16}>
          <Card 
            title={
              <Space>
                <Title level={4} style={{ margin: 0 }}>
                  {dashboard.name}
                </Title>
                <Tag color="blue">设计模式</Tag>
              </Space>
            }
            style={{ height: '100%' }}
            bodyStyle={{ 
              height: 'calc(100% - 57px)', 
              overflow: 'auto',
              background: '#fafafa',
              padding: '16px'
            }}
          >
            <Row gutter={[16, 16]}>
              {dashboard.components.map((component) => (
                <Col 
                  key={component.id}
                  span={component.position.width}
                  style={{ height: `${component.position.height * 40}px` }}
                >
                  {renderComponent(component)}
                </Col>
              ))}
              {dashboard.components.length === 0 && (
                <Col span={24}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 0',
                    color: '#999'
                  }}>
                    <PlusOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <div>从左侧组件库拖拽组件到此处开始设计</div>
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        </Col>

        {/* 右侧属性面板 */}
        <Col span={4}>
          <Card title="属性设置" style={{ height: '100%' }}>
            {selectedComponent ? (
              <div>
                <Form layout="vertical">
                  <Form.Item label="组件标题">
                    <Input
                      value={dashboard.components.find(c => c.id === selectedComponent)?.title}
                      onChange={(e) => {
                        const updatedComponents = dashboard.components.map(comp => 
                          comp.id === selectedComponent 
                            ? { ...comp, title: e.target.value }
                            : comp
                        );
                        setDashboard({ ...dashboard, components: updatedComponents });
                      }}
                    />
                  </Form.Item>
                  <Form.Item label="宽度">
                    <Select
                      value={dashboard.components.find(c => c.id === selectedComponent)?.position.width}
                      onChange={(value) => {
                        const updatedComponents = dashboard.components.map(comp => 
                          comp.id === selectedComponent 
                            ? { ...comp, position: { ...comp.position, width: value } }
                            : comp
                        );
                        setDashboard({ ...dashboard, components: updatedComponents });
                      }}
                    >
                      <Select.Option value={6}>1/4 宽度</Select.Option>
                      <Select.Option value={8}>1/3 宽度</Select.Option>
                      <Select.Option value={12}>1/2 宽度</Select.Option>
                      <Select.Option value={18}>3/4 宽度</Select.Option>
                      <Select.Option value={24}>全宽</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="高度">
                    <Select
                      value={dashboard.components.find(c => c.id === selectedComponent)?.position.height}
                      onChange={(value) => {
                        const updatedComponents = dashboard.components.map(comp => 
                          comp.id === selectedComponent 
                            ? { ...comp, position: { ...comp.position, height: value } }
                            : comp
                        );
                        setDashboard({ ...dashboard, components: updatedComponents });
                      }}
                    >
                      <Select.Option value={4}>低</Select.Option>
                      <Select.Option value={6}>中</Select.Option>
                      <Select.Option value={8}>高</Select.Option>
                      <Select.Option value={12}>超高</Select.Option>
                    </Select>
                  </Form.Item>
                </Form>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                <SettingOutlined style={{ fontSize: '32px', marginBottom: '16px' }} />
                <div>选择组件查看属性设置</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardEditor; 