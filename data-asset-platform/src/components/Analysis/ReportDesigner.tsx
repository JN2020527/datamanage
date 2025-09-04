import React, { useState, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Tabs,
  List,
  Avatar,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  message,
  Drawer,
  Tree,
  Divider,
} from 'antd';
import {
  DragOutlined,
  EyeOutlined,
  SaveOutlined,
  SettingOutlined,
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  BarChartOutlined,
  TableOutlined,
  FileTextOutlined,
  PieChartOutlined,
  LineChartOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNotification } from '@hooks/useNotification';

const { Title, Text } = Typography;

interface Component {
  id: string;
  type: string;
  name: string;
  icon: React.ReactNode;
  config: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface ReportDesignerProps {
  onSave?: (report: any) => void;
}

const componentTypes = [
  {
    type: 'chart-bar',
    name: '柱状图',
    icon: <BarChartOutlined />,
    category: '图表',
    defaultConfig: {
      title: '柱状图',
      dataSource: '',
      xAxis: '',
      yAxis: '',
    },
  },
  {
    type: 'chart-line',
    name: '折线图',
    icon: <LineChartOutlined />,
    category: '图表',
    defaultConfig: {
      title: '折线图',
      dataSource: '',
      xAxis: '',
      yAxis: '',
    },
  },
  {
    type: 'chart-pie',
    name: '饼图',
    icon: <PieChartOutlined />,
    category: '图表',
    defaultConfig: {
      title: '饼图',
      dataSource: '',
      nameField: '',
      valueField: '',
    },
  },
  {
    type: 'table',
    name: '数据表格',
    icon: <TableOutlined />,
    category: '数据',
    defaultConfig: {
      title: '数据表格',
      dataSource: '',
      columns: [],
      pageSize: 10,
    },
  },
  {
    type: 'text',
    name: '文本',
    icon: <FileTextOutlined />,
    category: '基础',
    defaultConfig: {
      content: '文本内容',
      fontSize: 14,
      color: '#000000',
      align: 'left',
    },
  },
  {
    type: 'number',
    name: '数字指标',
    icon: <NumberOutlined />,
    category: '基础',
    defaultConfig: {
      title: '指标名称',
      value: 0,
      unit: '',
      format: 'number',
    },
  },
];

const DraggableComponent: React.FC<{
  type: string;
  name: string;
  icon: React.ReactNode;
  onDrop: (type: string) => void;
}> = ({ type, name, icon, onDrop }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onDrop(item.type);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        padding: '8px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        marginBottom: '8px',
        backgroundColor: '#fff',
      }}
    >
      <Space>
        <DragOutlined />
        {icon}
        <Text>{name}</Text>
      </Space>
    </div>
  );
};

const DropCanvas: React.FC<{
  components: Component[];
  onComponentAdd: (type: string, position: { x: number; y: number }) => void;
  onComponentSelect: (component: Component) => void;
  selectedComponent?: Component;
}> = ({ components, onComponentAdd, onComponentSelect, selectedComponent }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: { type: string }, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = (monitor.getDropResult() as any)?.getBoundingClientRect();
      if (offset && canvasRect) {
        const position = {
          x: offset.x - canvasRect.left,
          y: offset.y - canvasRect.top,
        };
        onComponentAdd(item.type, position);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        width: '100%',
        height: '600px',
        border: '2px dashed #d9d9d9',
        borderColor: isOver ? '#1890ff' : '#d9d9d9',
        backgroundColor: isOver ? '#f0f8ff' : '#fafafa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {components.map((component) => (
        <div
          key={component.id}
          onClick={() => onComponentSelect(component)}
          style={{
            position: 'absolute',
            left: component.position.x,
            top: component.position.y,
            width: component.size.width,
            height: component.size.height,
            border: selectedComponent?.id === component.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
            backgroundColor: '#fff',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            {componentTypes.find(t => t.type === component.type)?.icon}
            <Text style={{ marginLeft: '4px', fontSize: '12px' }}>
              {component.config.title || component.name}
            </Text>
          </div>
          <div style={{ fontSize: '10px', color: '#999' }}>
            {component.type}
          </div>
        </div>
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
          <Text>拖拽组件到此处开始设计报表</Text>
        </div>
      )}
    </div>
  );
};

const ReportDesigner: React.FC<ReportDesignerProps> = ({ onSave }) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component>();
  const [propertiesVisible, setPropertiesVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [reportName, setReportName] = useState('新建报表');
  const { showSuccess, showError } = useNotification();

  const handleComponentAdd = useCallback((type: string, position: { x: number; y: number }) => {
    const componentType = componentTypes.find(t => t.type === type);
    if (!componentType) return;

    const newComponent: Component = {
      id: `${type}_${Date.now()}`,
      type,
      name: componentType.name,
      icon: componentType.icon,
      config: { ...componentType.defaultConfig },
      position,
      size: { width: 300, height: 200 },
    };

    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent);
    setPropertiesVisible(true);
  }, []);

  const handleComponentSelect = useCallback((component: Component) => {
    setSelectedComponent(component);
    setPropertiesVisible(true);
  }, []);

  const handleComponentUpdate = (updatedComponent: Component) => {
    setComponents(prev =>
      prev.map(comp => comp.id === updatedComponent.id ? updatedComponent : comp)
    );
    setSelectedComponent(updatedComponent);
  };

  const handleComponentDelete = (componentId: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== componentId));
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(undefined);
      setPropertiesVisible(false);
    }
  };

  const handleSaveReport = () => {
    const report = {
      name: reportName,
      components,
      createdAt: new Date().toISOString(),
    };
    
    onSave?.(report);
    showSuccess('报表保存成功');
  };

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const componentsByCategory = componentTypes.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, typeof componentTypes>);

  const PropertiesPanel = () => (
    <Drawer
      title="属性配置"
      placement="right"
      width={300}
      open={propertiesVisible}
      onClose={() => setPropertiesVisible(false)}
      extra={
        selectedComponent && (
          <Space>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => {
                const newComponent = {
                  ...selectedComponent,
                  id: `${selectedComponent.type}_${Date.now()}`,
                  position: {
                    x: selectedComponent.position.x + 20,
                    y: selectedComponent.position.y + 20,
                  },
                };
                setComponents(prev => [...prev, newComponent]);
              }}
            >
              复制
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleComponentDelete(selectedComponent.id)}
            >
              删除
            </Button>
          </Space>
        )
      }
    >
      {selectedComponent && (
        <Form
          layout="vertical"
          initialValues={selectedComponent.config}
          onValuesChange={(changedValues, allValues) => {
            const updatedComponent = {
              ...selectedComponent,
              config: { ...selectedComponent.config, ...changedValues },
            };
            handleComponentUpdate(updatedComponent);
          }}
        >
          <Form.Item label="组件类型">
            <Input value={selectedComponent.type} disabled />
          </Form.Item>

          {selectedComponent.type.startsWith('chart') && (
            <>
              <Form.Item name="title" label="标题">
                <Input placeholder="输入图表标题" />
              </Form.Item>
              <Form.Item name="dataSource" label="数据源">
                <Select placeholder="选择数据源">
                  <Select.Option value="users">用户数据</Select.Option>
                  <Select.Option value="orders">订单数据</Select.Option>
                  <Select.Option value="products">商品数据</Select.Option>
                </Select>
              </Form.Item>
            </>
          )}

          {selectedComponent.type === 'text' && (
            <>
              <Form.Item name="content" label="文本内容">
                <Input.TextArea rows={4} placeholder="输入文本内容" />
              </Form.Item>
              <Form.Item name="fontSize" label="字体大小">
                <Select>
                  <Select.Option value={12}>12px</Select.Option>
                  <Select.Option value={14}>14px</Select.Option>
                  <Select.Option value={16}>16px</Select.Option>
                  <Select.Option value={18}>18px</Select.Option>
                  <Select.Option value={20}>20px</Select.Option>
                </Select>
              </Form.Item>
            </>
          )}

          {selectedComponent.type === 'number' && (
            <>
              <Form.Item name="title" label="指标名称">
                <Input placeholder="输入指标名称" />
              </Form.Item>
              <Form.Item name="value" label="数值">
                <Input type="number" placeholder="输入数值" />
              </Form.Item>
              <Form.Item name="unit" label="单位">
                <Input placeholder="输入单位，如：万元、%" />
              </Form.Item>
            </>
          )}

          <Divider />
          
          <Form.Item label="位置和大小">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>X: {selectedComponent.position.x}px</Text>
                <br />
                <Text>Y: {selectedComponent.position.y}px</Text>
              </div>
              <div>
                <Text>宽度: {selectedComponent.size.width}px</Text>
                <br />
                <Text>高度: {selectedComponent.size.height}px</Text>
              </div>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <Card
        title={
          <Space>
            <SettingOutlined />
            报表设计器
            <Input
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              style={{ width: 200 }}
              placeholder="报表名称"
            />
          </Space>
        }
        extra={
          <Space>
            <Button icon={<EyeOutlined />} onClick={handlePreview}>
              预览
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveReport}>
              保存
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card title="组件库" size="small">
              <Tabs size="small">
                {Object.entries(componentsByCategory).map(([category, comps]) => (
                  <Tabs.TabPane tab={category} key={category}>
                    {comps.map((comp) => (
                      <DraggableComponent
                        key={comp.type}
                        type={comp.type}
                        name={comp.name}
                        icon={comp.icon}
                        onDrop={handleComponentAdd}
                      />
                    ))}
                  </Tabs.TabPane>
                ))}
              </Tabs>
            </Card>
          </Col>

          <Col span={18}>
            <Card title="设计画布" size="small">
              <DropCanvas
                components={components}
                onComponentAdd={handleComponentAdd}
                onComponentSelect={handleComponentSelect}
                selectedComponent={selectedComponent}
              />
            </Card>
          </Col>
        </Row>

        <PropertiesPanel />

        <Modal
          title="报表预览"
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          width="90%"
          footer={null}
        >
          <div style={{ height: '600px', border: '1px solid #f0f0f0' }}>
            {/* 这里会渲染实际的报表预览 */}
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              <Title level={4}>报表预览</Title>
              <Text>这里将显示根据设计器配置生成的实际报表</Text>
            </div>
          </div>
        </Modal>
      </Card>
    </DndProvider>
  );
};

export default ReportDesigner;
