import React, { useState, useCallback, useRef } from 'react';
import {
  Layout,
  Card,
  Button,
  Space,
  Typography,
  Tabs,
  List,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  ColorPicker,
  Slider,
  Switch,
  Divider,
  Row,
  Col,
  message,
  Flex,
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  UndoOutlined,
  RedoOutlined,
  SettingOutlined,
  DeleteOutlined,
  CopyOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  TableOutlined,
  NumberOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  DragOutlined,
  ArrowLeftOutlined,
  LayoutOutlined,
  FundOutlined,
  DatabaseOutlined,
  DashboardOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

// 设计令牌 - 遵循 Ant Design 规范
const DESIGN_TOKENS = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  colors: {
    border: '#f0f0f0',
    background: {
      primary: '#ffffff',
      secondary: '#fafafa',
      tertiary: '#f5f5f5',
    },
  },
};

// 组件类型定义
interface ComponentConfig {
  id: string;
  type: string;
  name: string;
  icon: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
}

// 预定义的组件库
const componentLibrary = [
  {
    type: 'chart-bar',
    name: '柱状图',
    icon: <BarChartOutlined />,
    category: 'chart',
    defaultConfig: {
      title: '柱状图',
      dataSource: 'demo',
      xAxis: 'category',
      yAxis: 'value',
      color: '#1890ff',
    },
  },
  {
    type: 'chart-line',
    name: '折线图',
    icon: <LineChartOutlined />,
    category: 'chart',
    defaultConfig: {
      title: '折线图',
      dataSource: 'demo',
      xAxis: 'date',
      yAxis: 'value',
      color: '#52c41a',
    },
  },
  {
    type: 'chart-pie',
    name: '饼图',
    icon: <PieChartOutlined />,
    category: 'chart',
    defaultConfig: {
      title: '饼图',
      dataSource: 'demo',
      nameField: 'name',
      valueField: 'value',
      colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d'],
    },
  },
  {
    type: 'chart-area',
    name: '面积图',
    icon: <AreaChartOutlined />,
    category: 'chart',
    defaultConfig: {
      title: '面积图',
      dataSource: 'demo',
      xAxis: 'date',
      yAxis: 'value',
      color: '#722ed1',
    },
  },
  {
    type: 'table',
    name: '数据表格',
    icon: <TableOutlined />,
    category: 'data',
    defaultConfig: {
      title: '数据表格',
      dataSource: 'demo',
      columns: ['name', 'value', 'date'],
      pageSize: 10,
    },
  },
  {
    type: 'kpi',
    name: 'KPI指标',
    icon: <NumberOutlined />,
    category: 'indicator',
    defaultConfig: {
      title: 'KPI指标',
      value: '1,234',
      unit: '万元',
      trend: 'up',
      trendValue: '12.5%',
      color: '#1890ff',
    },
  },
  {
    type: 'calendar',
    name: '日历组件',
    icon: <CalendarOutlined />,
    category: 'control',
    defaultConfig: {
      title: '日期选择',
      dateFormat: 'YYYY-MM-DD',
      defaultValue: new Date().toISOString().split('T')[0],
    },
  },
  {
    type: 'filter',
    name: '筛选器',
    icon: <AppstoreOutlined />,
    category: 'control',
    defaultConfig: {
      title: '筛选器',
      type: 'dropdown',
      options: ['选项1', '选项2', '选项3'],
      multiple: false,
    },
  },
];

const DashboardEditor: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const [components, setComponents] = useState<ComponentConfig[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentConfig | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // 拖拽处理
  const handleDragStart = useCallback((e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData('componentType', componentType);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType');
    const library = componentLibrary.find(item => item.type === componentType);
    
    if (!library || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newComponent: ComponentConfig = {
      id: `${componentType}-${Date.now()}`,
      type: componentType,
      name: library.name,
      icon: library.icon,
      position: { x: Math.max(0, x - 100), y: Math.max(0, y - 50) },
      size: { width: 300, height: 200 },
      config: { ...library.defaultConfig },
    };

    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent);
    message.success(`已添加${library.name}组件`);
  }, []);

  // 组件操作
  const handleComponentClick = (component: ComponentConfig) => {
    setSelectedComponent(component);
  };

  const handleComponentDelete = (componentId: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== componentId));
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
  };

  const handleComponentCopy = (component: ComponentConfig) => {
    const newComponent: ComponentConfig = {
      ...component,
      id: `${component.type}-${Date.now()}`,
      position: {
        x: component.position.x + 20,
        y: component.position.y + 20,
      },
    };
    setComponents(prev => [...prev, newComponent]);
    message.success('组件已复制');
  };

  // 组件配置更新
  const handleConfigChange = (key: string, value: any) => {
    if (!selectedComponent) return;
    
    const updatedComponent = {
      ...selectedComponent,
      config: {
        ...selectedComponent.config,
        [key]: value,
      },
    };
    
    setSelectedComponent(updatedComponent);
    setComponents(prev => 
      prev.map(comp => 
        comp.id === selectedComponent.id ? updatedComponent : comp
      )
    );
  };

  // 保存看板
  const handleSave = () => {
    Modal.success({
      title: '保存成功',
      content: '看板已保存，您可以继续编辑或预览效果。',
    });
  };

  // 预览看板
  const handlePreview = () => {
    Modal.info({
      title: '预览模式',
      content: '预览功能正在完善中，即将支持全屏预览模式。',
      width: 600,
    });
  };

  // 渲染组件配置面板
  const renderConfigPanel = () => {
    if (!selectedComponent) {
      return (
        <Flex 
          vertical 
          align="center" 
          justify="center" 
          style={{ 
            height: '60vh', 
            color: 'rgba(0, 0, 0, 0.45)',
            padding: DESIGN_TOKENS.spacing.lg,
          }}
        >
          <AppstoreOutlined style={{ fontSize: 48, marginBottom: DESIGN_TOKENS.spacing.md }} />
          <Text type="secondary">请选择一个组件进行配置</Text>
        </Flex>
      );
    }

    const { config } = selectedComponent;

    return (
      <div style={{ padding: DESIGN_TOKENS.spacing.md }}>
        <Space direction="vertical" size={DESIGN_TOKENS.spacing.md} style={{ width: '100%' }}>
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: DESIGN_TOKENS.spacing.sm }}>
              组件配置
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {selectedComponent.name} 配置选项
            </Text>
          </div>

          <Form layout="vertical" size="small">
            <Form.Item label="组件标题" style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
              <Input
                value={config.title}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                placeholder="请输入标题"
              />
            </Form.Item>

            {selectedComponent.type.includes('chart') && (
              <>
                <Form.Item label="数据源" style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
                  <Select
                    value={config.dataSource}
                    onChange={(value) => handleConfigChange('dataSource', value)}
                    style={{ width: '100%' }}
                  >
                    <Select.Option value="demo">演示数据</Select.Option>
                    <Select.Option value="sales">销售数据</Select.Option>
                    <Select.Option value="operation">运营数据</Select.Option>
                  </Select>
                </Form.Item>
                
                <Form.Item label="主色调" style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
                  <ColorPicker
                    value={config.color}
                    onChange={(color) => handleConfigChange('color', color.toHexString())}
                    showText
                    size="small"
                  />
                </Form.Item>
              </>
            )}

            {selectedComponent.type === 'kpi' && (
              <>
                <Form.Item label="数值" style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
                  <Input
                    value={config.value}
                    onChange={(e) => handleConfigChange('value', e.target.value)}
                    placeholder="请输入数值"
                  />
                </Form.Item>
                <Form.Item label="单位" style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
                  <Input
                    value={config.unit}
                    onChange={(e) => handleConfigChange('unit', e.target.value)}
                    placeholder="请输入单位"
                  />
                </Form.Item>
              </>
            )}

            <Form.Item label="组件尺寸" style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
              <Row gutter={DESIGN_TOKENS.spacing.sm}>
                <Col span={12}>
                  <Input
                    addonBefore="宽"
                    value={selectedComponent.size.width}
                    onChange={(e) => {
                      const width = parseInt(e.target.value) || 300;
                      setSelectedComponent(prev => prev ? {
                        ...prev,
                        size: { ...prev.size, width }
                      } : null);
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Input
                    addonBefore="高"
                    value={selectedComponent.size.height}
                    onChange={(e) => {
                      const height = parseInt(e.target.value) || 200;
                      setSelectedComponent(prev => prev ? {
                        ...prev,
                        size: { ...prev.size, height }
                      } : null);
                    }}
                  />
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Space>
      </div>
    );
  };

  // 渲染画布上的组件
  const renderCanvasComponent = (component: ComponentConfig) => {
    const isSelected = selectedComponent?.id === component.id;
    
    return (
      <div
        key={component.id}
        style={{
          position: 'absolute',
          left: component.position.x,
          top: component.position.y,
          width: component.size.width,
          height: component.size.height,
          border: isSelected ? '2px solid #1890ff' : `1px solid ${DESIGN_TOKENS.colors.border}`,
          borderRadius: DESIGN_TOKENS.borderRadius.sm,
          background: DESIGN_TOKENS.colors.background.primary,
          cursor: 'pointer',
          boxShadow: isSelected ? '0 0 0 4px rgba(24, 144, 255, 0.2)' : DESIGN_TOKENS.shadows.sm,
          transition: 'all 0.2s ease-in-out',
        }}
        onClick={() => handleComponentClick(component)}
      >
        {/* 组件头部 */}
        <div
          style={{
            padding: `${DESIGN_TOKENS.spacing.sm}px ${DESIGN_TOKENS.spacing.md}px`,
            borderBottom: `1px solid ${DESIGN_TOKENS.colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: DESIGN_TOKENS.colors.background.secondary,
            borderTopLeftRadius: DESIGN_TOKENS.borderRadius.sm,
            borderTopRightRadius: DESIGN_TOKENS.borderRadius.sm,
            minHeight: 40,
          }}
        >
          <Flex align="center" gap={DESIGN_TOKENS.spacing.sm}>
            <span style={{ color: '#1890ff' }}>{component.icon}</span>
            <Text 
              strong 
              style={{ 
                fontSize: 12, 
                maxWidth: component.size.width - 100,
              }}
              ellipsis
            >
              {component.config.title || component.name}
            </Text>
          </Flex>
          
          {isSelected && (
            <Space size={DESIGN_TOKENS.spacing.xs}>
              <Tooltip title="复制" placement="top">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComponentCopy(component);
                  }}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </Tooltip>
              <Tooltip title="删除" placement="top">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComponentDelete(component.id);
                  }}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </Tooltip>
            </Space>
          )}
        </div>

        {/* 组件内容区 */}
        <Flex
          justify="center"
          align="center"
          style={{
            padding: DESIGN_TOKENS.spacing.md,
            height: `calc(100% - 41px)`,
            color: 'rgba(0, 0, 0, 0.45)',
            fontSize: 12,
          }}
        >
          {component.type === 'kpi' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: 24, 
                color: '#1890ff', 
                fontWeight: 'bold',
                marginBottom: DESIGN_TOKENS.spacing.xs,
              }}>
                {component.config.value}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {component.config.unit}
              </Text>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: 24, 
                marginBottom: DESIGN_TOKENS.spacing.sm,
                color: 'rgba(0, 0, 0, 0.25)',
              }}>
                {component.icon}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {component.name}
              </Text>
            </div>
          )}
        </Flex>

        {/* 拖拽手柄 */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: -6,
              left: -6,
              width: 20,
              height: 20,
              background: '#1890ff',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'move',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: DESIGN_TOKENS.shadows.md,
            }}
          >
            <DragOutlined style={{ fontSize: 10, color: '#fff' }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout style={{ height: '100vh' }}>
        {/* 顶部工具栏 */}
      <div
        style={{
          height: 56,
          background: DESIGN_TOKENS.colors.background.primary,
          borderBottom: `1px solid ${DESIGN_TOKENS.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${DESIGN_TOKENS.spacing.lg}px`,
          zIndex: 10,
        }}
      >
        <Flex align="center" gap={DESIGN_TOKENS.spacing.md}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/analysis/dashboard')}
          >
            返回
          </Button>
          
          <Divider type="vertical" style={{ margin: 0 }} />
          
          <Flex align="center" gap={DESIGN_TOKENS.spacing.sm}>
            <LayoutOutlined style={{ color: '#1890ff' }} />
            <Title level={5} style={{ margin: 0 }}>
              看板编辑器
            </Title>
            <Text type="secondary">- {dashboardId}</Text>
          </Flex>
        </Flex>

        <Flex align="center" gap={DESIGN_TOKENS.spacing.sm}>
          <Button icon={<UndoOutlined />} disabled size="small">
            撤销
          </Button>
          <Button icon={<RedoOutlined />} disabled size="small">
            重做
          </Button>
          
          <Divider type="vertical" style={{ margin: 0 }} />
          
          <Flex align="center" gap={DESIGN_TOKENS.spacing.sm}>
            <Text style={{ fontSize: 12 }}>缩放:</Text>
                          <Slider
                style={{ width: 80 }}
                min={50}
                max={200}
                value={zoom}
                onChange={setZoom}
                tooltip={{ formatter: (value) => `${value}%` }}
              />
            <Text style={{ fontSize: 12, minWidth: 32 }}>{zoom}%</Text>
          </Flex>
          
          <Divider type="vertical" style={{ margin: 0 }} />
          
          <Space size={DESIGN_TOKENS.spacing.sm}>
            <Button icon={<EyeOutlined />} onClick={handlePreview} size="small">
              预览
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} size="small">
              保存
            </Button>
          </Space>
        </Flex>
      </div>

      <Layout style={{ flex: 1 }}>
        {/* 左侧组件库 */}
        <Sider 
          width={280} 
          style={{ 
            background: DESIGN_TOKENS.colors.background.primary, 
            borderRight: `1px solid ${DESIGN_TOKENS.colors.border}`,
          }}
        >
          <Tabs 
            defaultActiveKey="components" 
            style={{ 
              height: '100%',
            }}
            tabBarStyle={{
              paddingLeft: DESIGN_TOKENS.spacing.md,
              margin: 0,
            }}
            items={[
              {
                key: 'components',
                label: '组件库',
                children: (
                  <div style={{ padding: DESIGN_TOKENS.spacing.md }}>
                    <Space direction="vertical" size={DESIGN_TOKENS.spacing.lg} style={{ width: '100%' }}>
                      {['chart', 'data', 'indicator', 'control'].map(category => (
                        <div key={category}>
                                                     <div style={{
                             display: 'flex',
                             alignItems: 'center',
                             gap: DESIGN_TOKENS.spacing.sm,
                             marginBottom: DESIGN_TOKENS.spacing.sm,
                           }}>
                             <span style={{ color: '#1890ff', fontSize: 16 }}>
                               {category === 'chart' && <FundOutlined />}
                               {category === 'data' && <DatabaseOutlined />}
                               {category === 'indicator' && <DashboardOutlined />}
                               {category === 'control' && <ControlOutlined />}
                             </span>
                             <Text strong style={{ fontSize: 13 }}>
                               {category === 'chart' && '图表组件'}
                               {category === 'data' && '数据组件'}
                               {category === 'indicator' && '指标组件'}
                               {category === 'control' && '控制组件'}
                             </Text>
                           </div>
                          
                          <Row gutter={[DESIGN_TOKENS.spacing.sm, DESIGN_TOKENS.spacing.sm]}>
                            {componentLibrary
                              .filter(item => item.category === category)
                              .map(component => (
                                <Col span={12} key={component.type}>
                                  <Card
                                    size="small"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, component.type)}
                                    style={{
                                      cursor: 'grab',
                                      textAlign: 'center',
                                      height: 72,
                                      borderRadius: DESIGN_TOKENS.borderRadius.sm,
                                      transition: 'all 0.2s ease-in-out',
                                    }}
                                    bodyStyle={{ 
                                      padding: DESIGN_TOKENS.spacing.sm,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      height: '100%',
                                    }}
                                    hoverable
                                  >
                                    <div style={{ 
                                      fontSize: 18, 
                                      marginBottom: DESIGN_TOKENS.spacing.xs,
                                      color: '#1890ff',
                                    }}>
                                      {component.icon}
                                    </div>
                                    <Text style={{ fontSize: 11, lineHeight: 1.2 }}>
                                      {component.name}
                                    </Text>
                                  </Card>
                                </Col>
                              ))}
                          </Row>
                        </div>
                      ))}
                    </Space>
                  </div>
                ),
              },
            ]}
          />
        </Sider>

        {/* 中间画布区域 */}
        <Content style={{ 
          background: DESIGN_TOKENS.colors.background.tertiary, 
          position: 'relative', 
          overflow: 'auto',
          padding: DESIGN_TOKENS.spacing.lg,
        }}>
          <div
            ref={canvasRef}
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              background: DESIGN_TOKENS.colors.background.primary,
              margin: '0 auto',
              position: 'relative',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              border: `1px solid ${DESIGN_TOKENS.colors.border}`,
              borderRadius: DESIGN_TOKENS.borderRadius.md,
              boxShadow: DESIGN_TOKENS.shadows.md,
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {components.length === 0 ? (
              <Flex 
                justify="center" 
                align="center" 
                style={{
                  height: '100%',
                  color: 'rgba(0, 0, 0, 0.25)',
                  flexDirection: 'column',
                }}
              >
                <AppstoreOutlined style={{ fontSize: 64, marginBottom: DESIGN_TOKENS.spacing.lg }} />
                <Text type="secondary" style={{ fontSize: 16 }}>
                  从左侧拖拽组件到此处开始设计
                </Text>
                <Text type="secondary" style={{ fontSize: 12, marginTop: DESIGN_TOKENS.spacing.sm }}>
                  支持多种图表和交互组件
                </Text>
              </Flex>
            ) : (
              components.map(renderCanvasComponent)
            )}
          </div>
        </Content>

        {/* 右侧属性面板 */}
        <Sider 
          width={320} 
          style={{ 
            background: DESIGN_TOKENS.colors.background.primary, 
            borderLeft: `1px solid ${DESIGN_TOKENS.colors.border}`,
          }}
        >
          <Tabs 
            defaultActiveKey="properties" 
            style={{ height: '100%' }}
            tabBarStyle={{
              paddingLeft: DESIGN_TOKENS.spacing.md,
              margin: 0,
            }}
            items={[
              {
                key: 'properties',
                label: '属性配置',
                children: renderConfigPanel(),
              },
              {
                key: 'data',
                label: '数据配置',
                children: (
                  <Flex 
                    vertical 
                    align="center" 
                    justify="center" 
                    style={{ 
                      height: '60vh',
                      padding: DESIGN_TOKENS.spacing.lg,
                    }}
                  >
                    <SettingOutlined style={{ 
                      fontSize: 48, 
                      marginBottom: DESIGN_TOKENS.spacing.md,
                      color: 'rgba(0, 0, 0, 0.25)',
                    }} />
                    <Text type="secondary">数据配置功能开发中...</Text>
                  </Flex>
                ),
              },
            ]}
          />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default DashboardEditor; 