import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
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
  InputNumber,
  Switch,
  Slider,
  ColorPicker,
  Drawer,
  message,
  Badge,
  Tag,
  Popconfirm,
  Dropdown,
  Menu,
  Divider,
} from 'antd';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  useDndMonitor,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  restrictToWindowEdges,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import {
  DragOutlined,
  EyeOutlined,
  SaveOutlined,
  SettingOutlined,
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  TableOutlined,
  FileTextOutlined,
  NumberOutlined,
  BgColorsOutlined,
  BorderOutlined,
  CompressOutlined,
  ExpandOutlined,
  UndoOutlined,
  RedoOutlined,
  LayoutOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
  FormatPainterOutlined,
  AppstoreOutlined,
  MenuOutlined,
  FullscreenOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useNotification } from '@hooks/useNotification';

const { Title, Text, Paragraph } = Typography;

// 组件类型定义
interface DashboardComponent {
  id: UniqueIdentifier;
  type: string;
  name: string;
  icon: React.ReactNode;
  config: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  locked?: boolean;
  visible?: boolean;
}

// 看板配置
interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  theme: string;
  layout: {
    background: string;
    padding: number;
    grid: { enabled: boolean; size: number; color: string };
  };
  components: DashboardComponent[];
  settings: {
    responsive: boolean;
    autoSave: boolean;
    snapToGrid: boolean;
    showGrid: boolean;
  };
}

// 组件模板定义
const componentTemplates = [
  {
    category: '图表组件',
    items: [
      {
        type: 'chart-bar',
        name: '柱状图',
        icon: <BarChartOutlined />,
        description: '展示分类数据对比',
        defaultConfig: {
          title: '柱状图',
          dataSource: '',
          xAxis: 'category',
          yAxis: 'value',
          colors: ['#5470c6', '#91cc75', '#fac858'],
          showLegend: true,
          showTooltip: true,
          animation: true,
        },
        defaultSize: { width: 400, height: 300 },
      },
      {
        type: 'chart-line',
        name: '折线图',
        icon: <LineChartOutlined />,
        description: '展示趋势变化',
        defaultConfig: {
          title: '折线图',
          dataSource: '',
          xAxis: 'date',
          yAxis: 'value',
          smooth: true,
          showArea: false,
          colors: ['#5470c6', '#91cc75'],
        },
        defaultSize: { width: 400, height: 300 },
      },
      {
        type: 'chart-pie',
        name: '饼图',
        icon: <PieChartOutlined />,
        description: '展示占比关系',
        defaultConfig: {
          title: '饼图',
          dataSource: '',
          nameField: 'name',
          valueField: 'value',
          roseType: false,
          showPercentage: true,
        },
        defaultSize: { width: 350, height: 350 },
      },
      {
        type: 'chart-area',
        name: '面积图',
        icon: <AreaChartOutlined />,
        description: '展示累积效果',
        defaultConfig: {
          title: '面积图',
          dataSource: '',
          xAxis: 'date',
          yAxis: 'value',
          stacked: false,
          opacity: 0.6,
        },
        defaultSize: { width: 400, height: 300 },
      },
    ],
  },
  {
    category: '数据组件',
    items: [
      {
        type: 'data-table',
        name: '数据表格',
        icon: <TableOutlined />,
        description: '展示详细数据',
        defaultConfig: {
          title: '数据表格',
          dataSource: '',
          columns: [],
          pageSize: 10,
          bordered: true,
          showHeader: true,
          size: 'middle',
        },
        defaultSize: { width: 600, height: 400 },
      },
      {
        type: 'metric-card',
        name: '指标卡片',
        icon: <NumberOutlined />,
        description: '展示关键指标',
        defaultConfig: {
          title: '指标名称',
          value: 12345,
          unit: '',
          prefix: '',
          suffix: '',
          precision: 0,
          trend: { value: 12.5, direction: 'up' },
          color: '#52c41a',
        },
        defaultSize: { width: 200, height: 120 },
      },
    ],
  },
  {
    category: '基础组件',
    items: [
      {
        type: 'text-block',
        name: '文本块',
        icon: <FileTextOutlined />,
        description: '显示文本内容',
        defaultConfig: {
          content: '文本内容',
          fontSize: 14,
          fontWeight: 'normal',
          color: '#000000',
          align: 'left',
          backgroundColor: 'transparent',
          padding: 16,
        },
        defaultSize: { width: 300, height: 100 },
      },
      {
        type: 'image-block',
        name: '图片',
        icon: <BgColorsOutlined />,
        description: '显示图片',
        defaultConfig: {
          src: '',
          alt: '图片',
          fit: 'cover',
          borderRadius: 0,
        },
        defaultSize: { width: 200, height: 200 },
      },
    ],
  },
  {
    category: '布局组件',
    items: [
      {
        type: 'container',
        name: '容器',
        icon: <BorderOutlined />,
        description: '组织其他组件',
        defaultConfig: {
          backgroundColor: '#ffffff',
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          padding: 16,
          shadow: false,
        },
        defaultSize: { width: 400, height: 300 },
      },
    ],
  },
];

// 预设主题
const dashboardThemes = [
  {
    name: '默认主题',
    key: 'default',
    colors: {
      primary: '#1890ff',
      background: '#f0f2f5',
      card: '#ffffff',
      text: '#000000',
      border: '#d9d9d9',
    },
  },
  {
    name: '暗色主题',
    key: 'dark',
    colors: {
      primary: '#177ddc',
      background: '#141414',
      card: '#1f1f1f',
      text: '#ffffff',
      border: '#434343',
    },
  },
  {
    name: '商务主题',
    key: 'business',
    colors: {
      primary: '#722ed1',
      background: '#f6f6f6',
      card: '#ffffff',
      text: '#262626',
      border: '#e8e8e8',
    },
  },
];

// 拖拽组件项
const DraggableComponentItem: React.FC<{
  template: any;
  onAdd: (template: any) => void;
}> = ({ template, onAdd }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `template-${template.type}`,
    data: { template },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="component-template-item"
    >
      <Card
        size="small"
        hoverable
        style={{
          marginBottom: 8,
          cursor: isDragging ? 'grabbing' : 'grab',
          border: '1px solid #d9d9d9',
        }}
        bodyStyle={{ padding: '12px' }}
        onClick={() => onAdd(template)}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {template.icon}
            <Text strong style={{ fontSize: 12 }}>
              {template.name}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {template.description}
          </Text>
        </Space>
      </Card>
    </div>
  );
};

// 画布组件
const CanvasComponent: React.FC<{
  component: DashboardComponent;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (component: DashboardComponent) => void;
  onDelete: () => void;
  gridSize: number;
  showGrid: boolean;
}> = ({ component, isSelected, onSelect, onUpdate, onDelete, gridSize, showGrid }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: component.id,
    data: { component },
    disabled: component.locked,
  });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: component.position.x,
    top: component.position.y,
    width: component.size.width,
    height: component.size.height,
    zIndex: component.zIndex + (isDragging ? 1000 : 0),
    opacity: component.visible === false ? 0.5 : 1,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    cursor: component.locked ? 'default' : 'move',
  };

  const renderComponentContent = () => {
    switch (component.type) {
      case 'chart-bar':
      case 'chart-line':
      case 'chart-pie':
      case 'chart-area':
        return (
          <div style={{ width: '100%', height: '100%', padding: 8 }}>
            <div style={{ 
              background: '#f9f9f9', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px dashed #d9d9d9',
              borderRadius: 4,
            }}>
              {component.icon}
              <Text style={{ marginLeft: 8 }}>{component.config.title}</Text>
            </div>
          </div>
        );
      case 'metric-card':
        return (
          <div style={{ 
            padding: 16, 
            background: '#fff', 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {component.config.title}
            </Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: component.config.color }}>
              {component.config.prefix}{component.config.value}{component.config.suffix}
            </Text>
            {component.config.trend && (
              <Text style={{ fontSize: 12, color: component.config.trend.direction === 'up' ? '#52c41a' : '#ff4d4f' }}>
                {component.config.trend.direction === 'up' ? '↑' : '↓'} {component.config.trend.value}%
              </Text>
            )}
          </div>
        );
      case 'text-block':
        return (
          <div style={{ 
            padding: component.config.padding,
            backgroundColor: component.config.backgroundColor,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: component.config.fontSize,
              fontWeight: component.config.fontWeight,
              color: component.config.color,
              textAlign: component.config.align,
              width: '100%',
            }}>
              {component.config.content}
            </Text>
          </div>
        );
      default:
        return (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#fafafa',
            border: '1px dashed #d9d9d9',
          }}>
            {component.icon}
            <Text style={{ marginLeft: 8 }}>{component.name}</Text>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
          borderRadius: 4,
          backgroundColor: '#fff',
          boxShadow: isSelected ? '0 0 10px rgba(24, 144, 255, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {renderComponentContent()}
        
        {/* 选中状态的操作按钮 */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: 0,
              display: 'flex',
              gap: 4,
            }}
          >
            <Tooltip title="锁定/解锁">
              <Button
                size="small"
                type={component.locked ? 'primary' : 'default'}
                icon={component.locked ? <CompressOutlined /> : <ExpandOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ ...component, locked: !component.locked });
                }}
              />
            </Tooltip>
            <Tooltip title="复制">
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  // 复制逻辑
                }}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Popconfirm
                title="确定删除此组件？"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  onDelete();
                }}
                onCancel={(e) => e?.stopPropagation()}
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            </Tooltip>
          </div>
        )}

        {/* 组件标签 */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            fontSize: 10,
            color: '#999',
            pointerEvents: 'none',
          }}
        >
          {component.name}
        </div>
      </div>
    </div>
  );
};

// 设计画布
const DesignCanvas: React.FC<{
  components: DashboardComponent[];
  selectedComponentId?: UniqueIdentifier;
  onComponentSelect: (id: UniqueIdentifier) => void;
  onComponentUpdate: (component: DashboardComponent) => void;
  onComponentDelete: (id: UniqueIdentifier) => void;
  onComponentAdd: (template: any, position: { x: number; y: number }) => void;
  dashboardConfig: DashboardConfig;
}> = ({
  components,
  selectedComponentId,
  onComponentSelect,
  onComponentUpdate,
  onComponentDelete,
  onComponentAdd,
  dashboardConfig,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const { setNodeRef } = useDroppable({
    id: 'design-canvas',
  });

  const handleCanvasClick = () => {
    onComponentSelect('');
  };

  const gridStyle: React.CSSProperties = dashboardConfig.settings.showGrid
    ? {
        backgroundImage: `
          linear-gradient(to right, ${dashboardConfig.layout.grid.color} 1px, transparent 1px),
          linear-gradient(to bottom, ${dashboardConfig.layout.grid.color} 1px, transparent 1px)
        `,
        backgroundSize: `${dashboardConfig.layout.grid.size}px ${dashboardConfig.layout.grid.size}px`,
      }
    : {};

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        canvasRef.current = node;
      }}
      onClick={handleCanvasClick}
      style={{
        width: '100%',
        height: '600px',
        backgroundColor: dashboardConfig.layout.background,
        position: 'relative',
        overflow: 'hidden',
        border: '2px dashed #d9d9d9',
        borderRadius: 8,
        padding: dashboardConfig.layout.padding,
        ...gridStyle,
      }}
    >
      {components.map((component) => (
        <CanvasComponent
          key={component.id}
          component={component}
          isSelected={selectedComponentId === component.id}
          onSelect={() => onComponentSelect(component.id)}
          onUpdate={onComponentUpdate}
          onDelete={() => onComponentDelete(component.id)}
          gridSize={dashboardConfig.layout.grid.size}
          showGrid={dashboardConfig.settings.showGrid}
        />
      ))}

      {components.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#999',
          }}
        >
          <AppstoreOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <Title level={4} type="secondary">
            开始设计您的看板
          </Title>
          <Paragraph type="secondary">
            从左侧组件库拖拽组件到画布，或点击组件快速添加
          </Paragraph>
        </div>
      )}
    </div>
  );
};

// 主组件
interface DashboardDesignerProps {
  onSave?: (dashboard: DashboardConfig) => void;
  onPreview?: (dashboard: DashboardConfig) => void;
  initialData?: Partial<DashboardConfig>;
}

const DashboardDesigner: React.FC<DashboardDesignerProps> = ({
  onSave,
  onPreview,
  initialData,
}) => {
  const { showSuccess, showError } = useNotification();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [propertiesVisible, setPropertiesVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [history, setHistory] = useState<DashboardConfig[]>([]);

  // 看板配置状态
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    id: Date.now().toString(),
    name: '新建看板',
    description: '',
    theme: 'default',
    layout: {
      background: '#f0f2f5',
      padding: 20,
      grid: { enabled: true, size: 20, color: 'rgba(0,0,0,0.1)' },
    },
    components: [],
    settings: {
      responsive: true,
      autoSave: false,
      snapToGrid: true,
      showGrid: true,
    },
    ...initialData,
  });

  const [selectedComponentId, setSelectedComponentId] = useState<UniqueIdentifier>('');

  // 传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 添加历史记录
  const addToHistory = useCallback((config: DashboardConfig) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ ...config });
      setHistoryIndex(newHistory.length - 1);
      return newHistory.slice(-50); // 最多保存50个历史记录
    });
  }, [historyIndex]);

  // 撤销
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDashboardConfig(history[historyIndex - 1]);
    }
  };

  // 重做
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setDashboardConfig(history[historyIndex + 1]);
    }
  };

  // 监听拖拽事件
  useDndMonitor({
    onDragStart(event: DragStartEvent) {
      setActiveId(event.active.id);
    },
    onDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      setActiveId(null);

      if (over?.id === 'design-canvas') {
        const template = active.data.current?.template;
        if (template) {
          // 从组件库添加新组件
          const canvasRect = over.rect;
          const position = {
            x: Math.max(0, event.activatorEvent.clientX - canvasRect.left - template.defaultSize.width / 2),
            y: Math.max(0, event.activatorEvent.clientY - canvasRect.top - template.defaultSize.height / 2),
          };

          if (dashboardConfig.settings.snapToGrid) {
            const gridSize = dashboardConfig.layout.grid.size;
            position.x = Math.round(position.x / gridSize) * gridSize;
            position.y = Math.round(position.y / gridSize) * gridSize;
          }

          handleComponentAdd(template, position);
        }
      } else {
        // 移动现有组件
        const component = active.data.current?.component;
        if (component && event.delta) {
          let newPosition = {
            x: component.position.x + event.delta.x,
            y: component.position.y + event.delta.y,
          };

          if (dashboardConfig.settings.snapToGrid) {
            const gridSize = dashboardConfig.layout.grid.size;
            newPosition.x = Math.round(newPosition.x / gridSize) * gridSize;
            newPosition.y = Math.round(newPosition.y / gridSize) * gridSize;
          }

          // 确保组件不会移出画布
          newPosition.x = Math.max(0, newPosition.x);
          newPosition.y = Math.max(0, newPosition.y);

          handleComponentUpdate({
            ...component,
            position: newPosition,
          });
        }
      }
    },
  });

  // 添加组件
  const handleComponentAdd = (template: any, position: { x: number; y: number }) => {
    const newComponent: DashboardComponent = {
      id: `${template.type}_${Date.now()}`,
      type: template.type,
      name: template.name,
      icon: template.icon,
      config: { ...template.defaultConfig },
      position,
      size: { ...template.defaultSize },
      zIndex: dashboardConfig.components.length,
      locked: false,
      visible: true,
    };

    const newConfig = {
      ...dashboardConfig,
      components: [...dashboardConfig.components, newComponent],
    };

    setDashboardConfig(newConfig);
    addToHistory(newConfig);
    setSelectedComponentId(newComponent.id);
    setPropertiesVisible(true);
    showSuccess('组件添加成功');
  };

  // 更新组件
  const handleComponentUpdate = (updatedComponent: DashboardComponent) => {
    const newConfig = {
      ...dashboardConfig,
      components: dashboardConfig.components.map((comp) =>
        comp.id === updatedComponent.id ? updatedComponent : comp
      ),
    };
    setDashboardConfig(newConfig);
    addToHistory(newConfig);
  };

  // 删除组件
  const handleComponentDelete = (componentId: UniqueIdentifier) => {
    const newConfig = {
      ...dashboardConfig,
      components: dashboardConfig.components.filter((comp) => comp.id !== componentId),
    };
    setDashboardConfig(newConfig);
    addToHistory(newConfig);
    setSelectedComponentId('');
    setPropertiesVisible(false);
    showSuccess('组件删除成功');
  };

  // 保存看板
  const handleSave = () => {
    onSave?.(dashboardConfig);
    showSuccess('看板保存成功');
  };

  // 预览看板
  const handlePreview = () => {
    setPreviewVisible(true);
    onPreview?.(dashboardConfig);
  };

  // 获取选中的组件
  const selectedComponent = dashboardConfig.components.find(
    (comp) => comp.id === selectedComponentId
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToWindowEdges]}
    >
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* 顶部工具栏 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Title level={4} style={{ margin: 0 }}>
                  看板设计器
                </Title>
                <Input
                  value={dashboardConfig.name}
                  onChange={(e) =>
                    setDashboardConfig({ ...dashboardConfig, name: e.target.value })
                  }
                  style={{ width: 200 }}
                  placeholder="看板名称"
                />
                <Badge count={dashboardConfig.components.length} showZero>
                  <Tag color="blue">组件</Tag>
                </Badge>
              </Space>
            </Col>
            <Col>
              <Space>
                <Tooltip title="撤销">
                  <Button
                    icon={<UndoOutlined />}
                    disabled={historyIndex <= 0}
                    onClick={handleUndo}
                  />
                </Tooltip>
                <Tooltip title="重做">
                  <Button
                    icon={<RedoOutlined />}
                    disabled={historyIndex >= history.length - 1}
                    onClick={handleRedo}
                  />
                </Tooltip>
                <Divider type="vertical" />
                <Tooltip title="预览">
                  <Button icon={<EyeOutlined />} onClick={handlePreview} />
                </Tooltip>
                <Tooltip title="保存">
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                    保存
                  </Button>
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 主要内容区域 */}
        <Row gutter={[16, 16]} style={{ flex: 1 }}>
          {/* 左侧组件库 */}
          <Col span={6}>
            <Card title="组件库" size="small" style={{ height: '100%' }}>
              <Tabs size="small" tabPosition="top">
                {componentTemplates.map((category) => (
                  <Tabs.TabPane tab={category.category} key={category.category}>
                    <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                      {category.items.map((template) => (
                        <DraggableComponentItem
                          key={template.type}
                          template={template}
                          onAdd={(template) => {
                            // 在画布中心添加组件
                            handleComponentAdd(template, { x: 200, y: 150 });
                          }}
                        />
                      ))}
                    </div>
                  </Tabs.TabPane>
                ))}
              </Tabs>
            </Card>
          </Col>

          {/* 中间设计画布 */}
          <Col span={12}>
            <Card title="设计画布" size="small" style={{ height: '100%' }}>
              <DesignCanvas
                components={dashboardConfig.components}
                selectedComponentId={selectedComponentId}
                onComponentSelect={setSelectedComponentId}
                onComponentUpdate={handleComponentUpdate}
                onComponentDelete={handleComponentDelete}
                onComponentAdd={handleComponentAdd}
                dashboardConfig={dashboardConfig}
              />
            </Card>
          </Col>

          {/* 右侧属性面板 */}
          <Col span={6}>
            <Card title="属性配置" size="small" style={{ height: '100%' }}>
              {selectedComponent ? (
                <div>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>组件信息</Text>
                      <div style={{ marginTop: 8 }}>
                        <Text>类型: {selectedComponent.type}</Text>
                        <br />
                        <Text>位置: ({selectedComponent.position.x}, {selectedComponent.position.y})</Text>
                        <br />
                        <Text>尺寸: {selectedComponent.size.width} × {selectedComponent.size.height}</Text>
                      </div>
                    </div>
                    <Divider />
                    {/* 这里会根据组件类型渲染不同的配置表单 */}
                    <Button type="primary" block onClick={() => setPropertiesVisible(true)}>
                      详细配置
                    </Button>
                  </Space>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <SettingOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  <Paragraph type="secondary">选择组件查看属性</Paragraph>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* 拖拽覆盖层 */}
        <DragOverlay>
          {activeId ? (
            <div
              style={{
                width: 200,
                height: 100,
                backgroundColor: '#fff',
                border: '2px solid #1890ff',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.8,
              }}
            >
              拖拽中...
            </div>
          ) : null}
        </DragOverlay>

        {/* 属性配置抽屉 */}
        <Drawer
          title="组件属性配置"
          placement="right"
          width={400}
          open={propertiesVisible}
          onClose={() => setPropertiesVisible(false)}
        >
          {selectedComponent && (
            <Form
              layout="vertical"
              initialValues={selectedComponent.config}
              onValuesChange={(changedValues) => {
                const updatedComponent = {
                  ...selectedComponent,
                  config: { ...selectedComponent.config, ...changedValues },
                };
                handleComponentUpdate(updatedComponent);
              }}
            >
              {/* 根据组件类型渲染不同的配置项 */}
              <Form.Item name="title" label="标题">
                <Input placeholder="输入标题" />
              </Form.Item>
              {/* 更多配置项... */}
            </Form>
          )}
        </Drawer>

        {/* 预览模态框 */}
        <Modal
          title="看板预览"
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          width="90%"
          footer={null}
          style={{ top: 20 }}
        >
          <div style={{ height: '70vh', backgroundColor: dashboardConfig.layout.background }}>
            {/* 预览渲染 */}
            <div style={{ padding: 20, textAlign: 'center' }}>
              <Title level={3}>{dashboardConfig.name}</Title>
              <Text type="secondary">预览模式下的看板效果</Text>
            </div>
          </div>
        </Modal>
      </div>
    </DndContext>
  );
};

export default DashboardDesigner;
