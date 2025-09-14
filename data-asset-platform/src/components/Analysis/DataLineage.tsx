import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tooltip,
  Tag,
  Divider,
  Typography,
  Input,
  Select,
  Switch,
  Badge,
  Drawer,
  Descriptions,
  Timeline,
  Alert,
  Radio,
  Slider,
  Collapse,
  Empty
} from 'antd';
import {
  PartitionOutlined,
  FullscreenOutlined,
  SearchOutlined,
  FilterOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TableOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ApiOutlined,
  CloudOutlined,
  SettingOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// 字段信息
interface FieldInfo {
  id: string;
  name: string;
  displayName: string;
  type: string;
  description?: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

// 数据血缘节点类型
interface LineageNode {
  id: string;
  name: string;
  displayName: string;
  type: 'source' | 'table' | 'view' | 'transform' | 'model' | 'report' | 'api';
  status: 'healthy' | 'warning' | 'error' | 'processing';
  level: number;
  position: { x: number; y: number };
  metadata: {
    description?: string;
    owner?: string;
    lastUpdated?: string;
    recordCount?: number;
    qualityScore?: number;
    tags?: string[];
  };
  dependencies: string[]; // 依赖的节点ID
  dependents: string[]; // 依赖此节点的节点ID
  fields?: FieldInfo[]; // 节点包含的字段信息
}

// 字段级血缘映射
interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformRule?: string;
}

// 数据血缘边/连接
interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'data_flow' | 'dependency' | 'transformation';
  metadata: {
    transformationType?: string;
    columns?: string[];
    lastSyncTime?: string;
  };
  fieldMappings?: FieldMapping[]; // 字段级映射关系
}

// 血缘图数据
interface LineageData {
  nodes: LineageNode[];
  edges: LineageEdge[];
  centralNode: string; // 当前查看的核心节点
}

// 样式常量
const DESIGN_TOKENS = {
  colors: {
    primary: '#1677FF',
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF4D4F',
    processing: '#1677FF',
    border: '#D9D9D9',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#262626',
    textSecondary: '#8C8C8C'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12
  }
};

// 节点类型配置
const NODE_TYPE_CONFIG = {
  source: {
    icon: DatabaseOutlined,
    color: '#722ED1',
    label: '数据源'
  },
  table: {
    icon: TableOutlined,
    color: '#1677FF',
    label: '数据表'
  },
  view: {
    icon: EyeOutlined,
    color: '#13C2C2',
    label: '视图'
  },
  transform: {
    icon: SettingOutlined,
    color: '#FAAD14',
    label: '转换'
  },
  model: {
    icon: DashboardOutlined,
    color: '#52C41A',
    label: '模型'
  },
  report: {
    icon: FileTextOutlined,
    color: '#FA8C16',
    label: '报表'
  },
  api: {
    icon: ApiOutlined,
    color: '#EB2F96',
    label: 'API'
  }
};

// 状态配置
const STATUS_CONFIG = {
  healthy: {
    color: '#52C41A',
    icon: CheckCircleOutlined,
    label: '健康'
  },
  warning: {
    color: '#FAAD14',
    icon: WarningOutlined,
    label: '警告'
  },
  error: {
    color: '#FF4D4F',
    icon: CloseCircleOutlined,
    label: '错误'
  },
  processing: {
    color: '#1677FF',
    icon: ClockCircleOutlined,
    label: '处理中'
  }
};

// 模拟血缘数据
const mockLineageData: LineageData = {
  centralNode: 'user_behavior_analysis',
  nodes: [
    {
      id: 'web_logs',
      name: 'web_logs',
      displayName: '网站日志',
      type: 'source',
      status: 'healthy',
      level: 0,
      position: { x: 50, y: 200 },
      metadata: {
        description: '网站访问日志数据源',
        owner: '数据团队',
        lastUpdated: '2024-01-15T14:30:00Z',
        recordCount: 1500000,
        qualityScore: 95,
        tags: ['日志', '实时']
      },
      dependencies: [],
      dependents: ['raw_events'],
      fields: [
        { id: 'web_logs_user_id', name: 'user_id', displayName: '用户ID', type: 'VARCHAR(50)', nullable: false, isPrimaryKey: true },
        { id: 'web_logs_event_type', name: 'event_type', displayName: '事件类型', type: 'VARCHAR(100)', nullable: false },
        { id: 'web_logs_timestamp', name: 'timestamp', displayName: '时间戳', type: 'TIMESTAMP', nullable: false },
        { id: 'web_logs_url', name: 'url', displayName: '访问URL', type: 'TEXT', nullable: true },
        { id: 'web_logs_ip_address', name: 'ip_address', displayName: 'IP地址', type: 'VARCHAR(45)', nullable: true }
      ]
    },
    {
      id: 'app_events',
      name: 'app_events',
      displayName: 'APP事件',
      type: 'source',
      status: 'healthy',
      level: 0,
      position: { x: 50, y: 100 },
      metadata: {
        description: '移动应用事件数据源',
        owner: '产品团队',
        lastUpdated: '2024-01-15T14:25:00Z',
        recordCount: 800000,
        qualityScore: 92,
        tags: ['事件', '移动端']
      },
      dependencies: [],
      dependents: ['raw_events'],
      fields: [
        { id: 'app_events_user_id', name: 'user_id', displayName: '用户ID', type: 'VARCHAR(50)', nullable: false, isPrimaryKey: true },
        { id: 'app_events_event_type', name: 'event_type', displayName: '事件类型', type: 'VARCHAR(100)', nullable: false },
        { id: 'app_events_timestamp', name: 'timestamp', displayName: '时间戳', type: 'TIMESTAMP', nullable: false },
        { id: 'app_events_device_id', name: 'device_id', displayName: '设备ID', type: 'VARCHAR(100)', nullable: true },
        { id: 'app_events_app_version', name: 'app_version', displayName: '应用版本', type: 'VARCHAR(20)', nullable: true }
      ]
    },
    {
      id: 'raw_events',
      name: 'raw_events',
      displayName: '原始事件表',
      type: 'table',
      status: 'healthy',
      level: 1,
      position: { x: 250, y: 150 },
      metadata: {
        description: '合并后的原始事件数据',
        owner: '数据团队',
        lastUpdated: '2024-01-15T14:30:00Z',
        recordCount: 2300000,
        qualityScore: 94,
        tags: ['原始数据', '合并']
      },
      dependencies: ['web_logs', 'app_events'],
      dependents: ['cleaned_events']
    },
    {
      id: 'cleaned_events',
      name: 'cleaned_events',
      displayName: '清洗事件表',
      type: 'transform',
      status: 'processing',
      level: 2,
      position: { x: 450, y: 150 },
      metadata: {
        description: '清洗和标准化后的事件数据',
        owner: '数据团队',
        lastUpdated: '2024-01-15T14:20:00Z',
        recordCount: 2280000,
        qualityScore: 97,
        tags: ['清洗', 'ETL']
      },
      dependencies: ['raw_events'],
      dependents: ['user_behavior_analysis']
    },
    {
      id: 'user_behavior_analysis',
      name: 'user_behavior_analysis',
      displayName: '用户行为分析表',
      type: 'table',
      status: 'healthy',
      level: 3,
      position: { x: 650, y: 150 },
      metadata: {
        description: '用户行为分析主表',
        owner: '分析团队',
        lastUpdated: '2024-01-15T14:30:00Z',
        recordCount: 1200000,
        qualityScore: 95,
        tags: ['用户分析', '核心表']
      },
      dependencies: ['cleaned_events'],
      dependents: ['user_dashboard', 'behavior_model'],
      fields: [
        { id: 'uba_user_id', name: 'user_id', displayName: '用户ID', type: 'VARCHAR(50)', nullable: false, isPrimaryKey: true },
        { id: 'uba_session_id', name: 'session_id', displayName: '会话ID', type: 'VARCHAR(100)', nullable: false },
        { id: 'uba_event_source_id', name: 'event_source_id', displayName: '事件来源ID', type: 'VARCHAR(50)', nullable: false, isForeignKey: true },
        { id: 'uba_page_views', name: 'page_views', displayName: '页面浏览量', type: 'INT', nullable: true },
        { id: 'uba_session_duration', name: 'session_duration', displayName: '会话时长', type: 'INT', nullable: true },
        { id: 'uba_bounce_rate', name: 'bounce_rate', displayName: '跳出率', type: 'DECIMAL(5,2)', nullable: true },
        { id: 'uba_conversion_events', name: 'conversion_events', displayName: '转化事件数', type: 'INT', nullable: true },
        { id: 'uba_last_updated', name: 'last_updated', displayName: '最后更新时间', type: 'TIMESTAMP', nullable: false }
      ]
    },
    {
      id: 'user_dashboard',
      name: 'user_dashboard',
      displayName: '用户行为看板',
      type: 'report',
      status: 'healthy',
      level: 4,
      position: { x: 850, y: 100 },
      metadata: {
        description: '用户行为分析看板',
        owner: '分析团队',
        lastUpdated: '2024-01-15T14:35:00Z',
        tags: ['看板', 'BI']
      },
      dependencies: ['user_behavior_analysis'],
      dependents: []
    },
    {
      id: 'behavior_model',
      name: 'behavior_model',
      displayName: '行为预测模型',
      type: 'model',
      status: 'warning',
      level: 4,
      position: { x: 850, y: 200 },
      metadata: {
        description: '用户行为预测ML模型',
        owner: '算法团队',
        lastUpdated: '2024-01-15T12:00:00Z',
        qualityScore: 78,
        tags: ['机器学习', '预测']
      },
      dependencies: ['user_behavior_analysis'],
      dependents: []
    }
  ],
  edges: [
    {
      id: 'web_logs-raw_events',
      source: 'web_logs',
      target: 'raw_events',
      type: 'data_flow',
      metadata: {
        transformationType: '数据合并',
        columns: ['user_id', 'event_type', 'timestamp'],
        lastSyncTime: '2024-01-15T14:30:00Z'
      },
      fieldMappings: [
        { sourceField: 'web_logs_user_id', targetField: 'raw_events_user_id' },
        { sourceField: 'web_logs_event_type', targetField: 'raw_events_event_type' },
        { sourceField: 'web_logs_timestamp', targetField: 'raw_events_timestamp' },
        { sourceField: 'web_logs_url', targetField: 'raw_events_properties', transformRule: 'JSON包装' }
      ]
    },
    {
      id: 'app_events-raw_events',
      source: 'app_events',
      target: 'raw_events',
      type: 'data_flow',
      metadata: {
        transformationType: '数据合并',
        columns: ['user_id', 'event_type', 'timestamp'],
        lastSyncTime: '2024-01-15T14:25:00Z'
      }
    },
    {
      id: 'raw_events-cleaned_events',
      source: 'raw_events',
      target: 'cleaned_events',
      type: 'transformation',
      metadata: {
        transformationType: '数据清洗',
        columns: ['user_id', 'event_type', 'timestamp', 'properties'],
        lastSyncTime: '2024-01-15T14:20:00Z'
      }
    },
    {
      id: 'cleaned_events-user_behavior_analysis',
      source: 'cleaned_events',
      target: 'user_behavior_analysis',
      type: 'transformation',
      metadata: {
        transformationType: '聚合分析',
        columns: ['user_id', 'behavior_metrics', 'session_data'],
        lastSyncTime: '2024-01-15T14:30:00Z'
      }
    },
    {
      id: 'user_behavior_analysis-user_dashboard',
      source: 'user_behavior_analysis',
      target: 'user_dashboard',
      type: 'data_flow',
      metadata: {
        transformationType: '数据展示',
        lastSyncTime: '2024-01-15T14:35:00Z'
      }
    },
    {
      id: 'user_behavior_analysis-behavior_model',
      source: 'user_behavior_analysis',
      target: 'behavior_model',
      type: 'data_flow',
      metadata: {
        transformationType: '模型训练',
        lastSyncTime: '2024-01-15T12:00:00Z'
      }
    }
  ]
};

const DataLineage: React.FC = () => {
  const [lineageData, setLineageData] = useState<LineageData>(mockLineageData);
  const [selectedNode, setSelectedNode] = useState<string | null>('user_behavior_analysis');
  const [viewMode, setViewMode] = useState<'full' | 'upstream' | 'downstream'>('full');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // 拖拽相关状态
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [showFieldLineage, setShowFieldLineage] = useState<boolean>(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  // 获取过滤后的节点
  const filteredNodes = useMemo(() => {
    return lineageData.nodes.filter(node => {
      // 搜索过滤
      if (searchTerm && !node.displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // 状态过滤
      if (statusFilter.length > 0 && !statusFilter.includes(node.status)) {
        return false;
      }
      // 类型过滤
      if (typeFilter.length > 0 && !typeFilter.includes(node.type)) {
        return false;
      }
      // 视图模式过滤
      if (viewMode === 'upstream' && selectedNode) {
        const targetNode = lineageData.nodes.find(n => n.id === selectedNode);
        if (targetNode) {
          return isUpstreamNode(node.id, selectedNode, lineageData);
        }
      }
      if (viewMode === 'downstream' && selectedNode) {
        const targetNode = lineageData.nodes.find(n => n.id === selectedNode);
        if (targetNode) {
          return isDownstreamNode(node.id, selectedNode, lineageData);
        }
      }
      return true;
    });
  }, [lineageData, searchTerm, statusFilter, typeFilter, viewMode, selectedNode]);

  // 判断是否为上游节点
  const isUpstreamNode = (nodeId: string, targetId: string, data: LineageData): boolean => {
    if (nodeId === targetId) return true;
    const visited = new Set<string>();
    const queue = [targetId];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      
      const currentNode = data.nodes.find(n => n.id === currentId);
      if (currentNode) {
        for (const depId of currentNode.dependencies) {
          if (depId === nodeId) return true;
          queue.push(depId);
        }
      }
    }
    return false;
  };

  // 判断是否为下游节点
  const isDownstreamNode = (nodeId: string, targetId: string, data: LineageData): boolean => {
    if (nodeId === targetId) return true;
    const visited = new Set<string>();
    const queue = [targetId];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      
      const currentNode = data.nodes.find(n => n.id === currentId);
      if (currentNode) {
        for (const depId of currentNode.dependents) {
          if (depId === nodeId) return true;
          queue.push(depId);
        }
      }
    }
    return false;
  };

  // 节点拖拽处理
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const node = lineageData.nodes.find(n => n.id === nodeId);
    if (!node) return;

    setIsDragging(true);
    setDraggedNode(nodeId);
    setDragOffset({
      x: e.clientX - (node.position.x * (zoomLevel / 100) + canvasOffset.x),
      y: e.clientY - (node.position.y * (zoomLevel / 100) + canvasOffset.y)
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && draggedNode) {
      const newX = (e.clientX - dragOffset.x - canvasOffset.x) / (zoomLevel / 100);
      const newY = (e.clientY - dragOffset.y - canvasOffset.y) / (zoomLevel / 100);
      
      setLineageData(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => 
          node.id === draggedNode 
            ? { ...node, position: { x: newX, y: newY } }
            : node
        )
      }));
    } else if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      
      setCanvasOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, draggedNode, dragOffset, canvasOffset, zoomLevel, isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedNode(null);
    setIsPanning(false);
  }, []);

  // 画布拖拽处理
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  // 鼠标滚轮缩放
  const handleWheel = useCallback((e: Event) => {
    e.preventDefault();
    const wheelEvent = e as WheelEvent;
    const delta = wheelEvent.deltaY > 0 ? -25 : 25;
    const newZoom = Math.max(50, Math.min(200, zoomLevel + delta));
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  // 添加全局事件监听
  useEffect(() => {
    if (isDragging || isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isPanning, handleMouseMove, handleMouseUp]);

  // 计算画布居中偏移
  const calculateCenterOffset = useCallback(() => {
    const canvasElement = document.querySelector('.lineage-canvas .ant-card-body');
    if (!canvasElement || filteredNodes.length === 0) return { x: 0, y: 0 };

    const canvasRect = canvasElement.getBoundingClientRect();
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;

    // 计算所有节点的边界
    const nodePositions = filteredNodes.map(node => ({
      x: node.position.x * (zoomLevel / 100),
      y: node.position.y * (zoomLevel / 100)
    }));

    const minX = Math.min(...nodePositions.map(p => p.x)) - 90; // 节点宽度一半
    const maxX = Math.max(...nodePositions.map(p => p.x)) + 90;
    const minY = Math.min(...nodePositions.map(p => p.y)) - 40; // 节点高度一半
    const maxY = Math.max(...nodePositions.map(p => p.y)) + 40;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // 计算居中偏移
    const centerX = (canvasWidth - contentWidth) / 2 - minX;
    const centerY = (canvasHeight - contentHeight) / 2 - minY;

    return { x: centerX, y: centerY };
  }, [filteredNodes, zoomLevel]);

  // 自动居中函数
  const centerCanvas = useCallback(() => {
    const centerOffset = calculateCenterOffset();
    setCanvasOffset(centerOffset);
  }, [calculateCenterOffset]);

  // 组件初始化时自动居中
  useEffect(() => {
    // 延迟执行确保DOM已经渲染
    const timer = setTimeout(() => {
      if (filteredNodes.length > 0) {
        centerCanvas();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []); // 只在组件初始化时执行

  // 添加滚轮事件监听  
  useEffect(() => {
    const canvasElement = document.querySelector('.lineage-canvas');
    if (canvasElement) {
      canvasElement.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        canvasElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  // 渲染血缘节点
  const renderLineageNode = (node: LineageNode) => {
    const typeConfig = NODE_TYPE_CONFIG[node.type];
    const statusConfig = STATUS_CONFIG[node.status];
    const IconComponent = typeConfig.icon;
    const StatusIcon = statusConfig.icon;
    const isSelected = selectedNode === node.id;
    const isCentral = lineageData.centralNode === node.id;

    return (
      <div
        key={node.id}
        style={{
          position: 'absolute',
          left: `${node.position.x * (zoomLevel / 100) + canvasOffset.x}px`,
          top: `${node.position.y * (zoomLevel / 100) + canvasOffset.y}px`,
          transform: 'translate(-50%, -50%)',
          cursor: isDragging && draggedNode === node.id ? 'grabbing' : 'grab',
          zIndex: isSelected ? 10 : (isDragging && draggedNode === node.id ? 15 : 1),
          userSelect: 'none'
        }}
        onClick={() => setSelectedNode(node.id)}
        onMouseDown={(e) => handleMouseDown(e, node.id)}
      >
        <Card
          size="small"
          style={{
            width: showFieldLineage && expandedNodes.has(node.id) ? 320 * (zoomLevel / 100) : 180 * (zoomLevel / 100),
            minHeight: showFieldLineage && expandedNodes.has(node.id) ? 200 * (zoomLevel / 100) : 80 * (zoomLevel / 100),
            border: isSelected ? `2px solid ${DESIGN_TOKENS.colors.primary}` : 
                    isCentral ? `2px solid ${typeConfig.color}` : '1px solid #d9d9d9',
            borderRadius: DESIGN_TOKENS.radius.md,
            boxShadow: isSelected || isCentral ? 
              '0 4px 12px rgba(0,0,0,0.15)' : 
              isDragging && draggedNode === node.id ?
              '0 8px 24px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: isCentral ? `${typeConfig.color}08` : '#ffffff',
            transition: isDragging && draggedNode === node.id ? 'none' : 'all 0.2s ease'
          }}
          bodyStyle={{ padding: `${8 * (zoomLevel / 100)}px` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <IconComponent 
              style={{ 
                color: typeConfig.color, 
                fontSize: 16 * (zoomLevel / 100),
                marginRight: 6 
              }} 
            />
            <Tag 
              color={typeConfig.color} 
              style={{ 
                fontSize: 10 * (zoomLevel / 100),
                margin: 0 
              }}
            >
              {typeConfig.label}
            </Tag>
            <div style={{ flex: 1 }} />
            <StatusIcon 
              style={{ 
                color: statusConfig.color,
                fontSize: 12 * (zoomLevel / 100)
              }} 
            />
          </div>
          
          <div 
            style={{ 
              fontSize: 12 * (zoomLevel / 100),
              fontWeight: isCentral ? 600 : 400,
              color: DESIGN_TOKENS.colors.text,
              marginBottom: 4,
              lineHeight: 1.2
            }}
          >
            {node.displayName}
          </div>
          
          {node.metadata.qualityScore && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Text 
                style={{ 
                  fontSize: 10 * (zoomLevel / 100),
                  color: DESIGN_TOKENS.colors.textSecondary 
                }}
              >
                质量分: {node.metadata.qualityScore}
              </Text>
              {node.metadata.recordCount && (
                <Text 
                  style={{ 
                    fontSize: 10 * (zoomLevel / 100),
                    color: DESIGN_TOKENS.colors.textSecondary 
                  }}
                >
                  | {Math.round(node.metadata.recordCount / 1000)}K行
                </Text>
              )}
              {showFieldLineage && node.fields && (
                <Button
                  type="text"
                  size="small"
                  style={{ 
                    fontSize: 10 * (zoomLevel / 100),
                    padding: 0,
                    height: 'auto',
                    minWidth: 'auto'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newExpanded = new Set(expandedNodes);
                    if (expandedNodes.has(node.id)) {
                      newExpanded.delete(node.id);
                    } else {
                      newExpanded.add(node.id);
                    }
                    setExpandedNodes(newExpanded);
                  }}
                >
                  {expandedNodes.has(node.id) ? '▼' : '▶'} 字段
                </Button>
              )}
            </div>
          )}
          
          {/* 字段列表展示 */}
          {showFieldLineage && expandedNodes.has(node.id) && node.fields && (
            <div 
              style={{ 
                marginTop: 6 * (zoomLevel / 100),
                border: `1px solid ${DESIGN_TOKENS.colors.border}`,
                borderRadius: DESIGN_TOKENS.radius.sm,
                backgroundColor: '#fafafa',
                maxHeight: 140 * (zoomLevel / 100),
                overflowY: 'auto'
              }}
            >
              {/* 字段列表头部 */}
              <div
                style={{
                  padding: `${4 * (zoomLevel / 100)}px ${6 * (zoomLevel / 100)}px`,
                  backgroundColor: '#f0f0f0',
                  borderBottom: `1px solid ${DESIGN_TOKENS.colors.border}`,
                  fontSize: 9 * (zoomLevel / 100),
                  fontWeight: 600,
                  color: DESIGN_TOKENS.colors.text,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>字段名称</span>
                <span>数据类型</span>
              </div>
              
              {/* 字段列表内容 */}
              {node.fields.map((field, index) => (
                <div 
                  key={field.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${3 * (zoomLevel / 100)}px ${6 * (zoomLevel / 100)}px`,
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                    borderBottom: index < node.fields!.length - 1 ? '1px solid #f0f0f0' : 'none',
                    fontSize: 9 * (zoomLevel / 100),
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#e6f7ff';
                    setHoveredField(field.id);
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
                    setHoveredField(null);
                  }}
                  title={field.description || field.displayName}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 3 * (zoomLevel / 100),
                    flex: 1,
                    minWidth: 0
                  }}>
                    {field.isPrimaryKey && (
                      <span 
                        style={{ 
                          color: '#faad14', 
                          fontSize: 8 * (zoomLevel / 100),
                          flexShrink: 0
                        }}
                        title="主键"
                      >
                        🔑
                      </span>
                    )}
                    {field.isForeignKey && (
                      <span 
                        style={{ 
                          color: '#52c41a', 
                          fontSize: 8 * (zoomLevel / 100),
                          flexShrink: 0
                        }}
                        title="外键"
                      >
                        🔗
                      </span>
                    )}
                    <span 
                      style={{ 
                        fontWeight: field.isPrimaryKey ? 600 : 400,
                        color: DESIGN_TOKENS.colors.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {field.displayName}
                    </span>
                    {!field.nullable && (
                      <span 
                        style={{ 
                          color: '#ff4d4f',
                          fontSize: 7 * (zoomLevel / 100),
                          flexShrink: 0
                        }}
                        title="不可为空"
                      >
                        *
                      </span>
                    )}
                  </div>
                  
                  <span 
                    style={{ 
                      color: DESIGN_TOKENS.colors.textSecondary,
                      fontSize: 8 * (zoomLevel / 100),
                      fontFamily: 'Monaco, Consolas, monospace',
                      flexShrink: 0,
                      marginLeft: 8 * (zoomLevel / 100)
                    }}
                  >
                    {field.type}
                  </span>
                </div>
              ))}
              
              {/* 字段统计信息 */}
              <div
                style={{
                  padding: `${3 * (zoomLevel / 100)}px ${6 * (zoomLevel / 100)}px`,
                  backgroundColor: '#f0f0f0',
                  borderTop: `1px solid ${DESIGN_TOKENS.colors.border}`,
                  fontSize: 8 * (zoomLevel / 100),
                  color: DESIGN_TOKENS.colors.textSecondary,
                  textAlign: 'center'
                }}
              >
                共 {node.fields.length} 个字段
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // 计算节点边缘连接点
  const getNodeEdgePoint = (sourceNode: LineageNode, targetNode: LineageNode, isSource: boolean) => {
    const currentNode = isSource ? sourceNode : targetNode;
    const isExpanded = showFieldLineage && expandedNodes.has(currentNode.id);
    const nodeWidth = isExpanded ? 320 * (zoomLevel / 100) : 180 * (zoomLevel / 100);
    const nodeHeight = isExpanded ? 200 * (zoomLevel / 100) : 80 * (zoomLevel / 100);
    
    const x1 = sourceNode.position.x * (zoomLevel / 100) + canvasOffset.x;
    const y1 = sourceNode.position.y * (zoomLevel / 100) + canvasOffset.y;
    const x2 = targetNode.position.x * (zoomLevel / 100) + canvasOffset.x;
    const y2 = targetNode.position.y * (zoomLevel / 100) + canvasOffset.y;
    
    // 计算连接线角度
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    
    // 计算节点边缘的交点
    const halfWidth = nodeWidth / 2;
    const halfHeight = nodeHeight / 2;
    
    // 确定线与节点矩形的交点
    const tan = Math.abs(dy / dx);
    const aspectRatio = halfHeight / halfWidth;
    
    let edgeX, edgeY;
    
    if (tan <= aspectRatio) {
      // 线与左右边相交
      edgeX = isSource ? 
        (dx > 0 ? x1 + halfWidth : x1 - halfWidth) :
        (dx > 0 ? x2 - halfWidth : x2 + halfWidth);
      edgeY = isSource ? y1 + (edgeX - x1) * tan * Math.sign(dy) : y2 - (x2 - edgeX) * tan * Math.sign(dy);
    } else {
      // 线与上下边相交
      edgeY = isSource ?
        (dy > 0 ? y1 + halfHeight : y1 - halfHeight) :
        (dy > 0 ? y2 - halfHeight : y2 + halfHeight);
      edgeX = isSource ? x1 + (edgeY - y1) / tan * Math.sign(dx) : x2 - (y2 - edgeY) / tan * Math.sign(dx);
    }
    
    return { x: edgeX, y: edgeY };
  };

  // 渲染连接线
  const renderLineageEdges = () => {
    return lineageData.edges.map(edge => {
      const sourceNode = lineageData.nodes.find(n => n.id === edge.source);
      const targetNode = lineageData.nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return null;
      
      // 检查节点是否在过滤结果中
      const isSourceVisible = filteredNodes.some(n => n.id === edge.source);
      const isTargetVisible = filteredNodes.some(n => n.id === edge.target);
      
      if (!isSourceVisible || !isTargetVisible) return null;

      // 计算连接线的起点和终点（在节点边缘）
      const sourcePoint = getNodeEdgePoint(sourceNode, targetNode, true);
      const targetPoint = getNodeEdgePoint(sourceNode, targetNode, false);

      const color = edge.type === 'transformation' ? DESIGN_TOKENS.colors.warning : 
                   edge.type === 'dependency' ? DESIGN_TOKENS.colors.error :
                   DESIGN_TOKENS.colors.primary;

      // 创建更精美的箭头标记
      const markerId = `arrowhead-${edge.id}-${zoomLevel}`;
      const isHovered = hoveredEdge === edge.id;

      return (
        <svg
          key={edge.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: isHovered ? 5 : 0
          }}
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              markerWidth={6}
              markerHeight={6}
              refX={8}
              refY={5}
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M 0 2 L 0 8 L 8 5 Z"
                fill={color}
                stroke="none"
              />
            </marker>
          </defs>
          {/* 不可见的粗线条用于悬停检测 */}
          <path
            d={`M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`}
            stroke="transparent"
            strokeWidth={12}
            fill="none"
            style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
            onMouseEnter={() => setHoveredEdge(edge.id)}
            onMouseLeave={() => setHoveredEdge(null)}
          />
          {/* 可见的连接线 */}
          <path
            d={`M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`}
            stroke={color}
            strokeWidth={isHovered ? 3 : 2}
            fill="none"
            markerEnd={`url(#${markerId})`}
            opacity={isHovered ? 1 : 0.7}
            strokeLinecap="round"
            strokeDasharray={edge.type === 'dependency' ? '5,5' : 'none'}
            style={{
              filter: isHovered ? 
                `drop-shadow(0 3px 6px rgba(0,0,0,0.15))` : 
                `drop-shadow(0 1px 3px rgba(0,0,0,0.1))`,
              transition: 'all 0.2s ease'
            }}
          />
          {/* 连接线类型标签 */}
          {isHovered && edge.metadata?.transformationType && (
            <foreignObject
              x={(sourcePoint.x + targetPoint.x) / 2 - 30}
              y={(sourcePoint.y + targetPoint.y) / 2 - 10}
              width={60}
              height={20}
              style={{ pointerEvents: 'none' }}
            >
              <div
                style={{
                  background: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}
              >
                {edge.metadata.transformationType}
              </div>
            </foreignObject>
          )}
        </svg>
      );
    });
  };

  // 处理节点选择
  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
    setShowDetails(true);
  };

  // 让指定节点居中显示
  const centerOnNode = useCallback((nodeId: string) => {
    const node = lineageData.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const canvasElement = document.querySelector('.lineage-canvas .ant-card-body');
    if (!canvasElement) return;

    const canvasRect = canvasElement.getBoundingClientRect();
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;

    // 计算节点应该在画布中心的偏移
    const nodeX = node.position.x * (zoomLevel / 100);
    const nodeY = node.position.y * (zoomLevel / 100);
    
    const centerX = canvasWidth / 2 - nodeX;
    const centerY = canvasHeight / 2 - nodeY;

    setCanvasOffset({ x: centerX, y: centerY });
  }, [lineageData.nodes, zoomLevel]);

  // 获取选中节点信息
  const selectedNodeData = selectedNode ? 
    lineageData.nodes.find(n => n.id === selectedNode) : null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <Card 
        size="small" 
        style={{ 
          marginBottom: 12,
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none'
        }}
      >
        <Row gutter={[16, 8]} align="middle">
          <Col flex="auto">
            <Space wrap>
              <Search
                placeholder="搜索数据资产..."
                style={{ width: 200 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
              
              <Select
                mode="multiple"
                placeholder="状态筛选"
                style={{ minWidth: 120 }}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <Option key={key} value={key}>
                    <config.icon style={{ color: config.color, marginRight: 4 }} />
                    {config.label}
                  </Option>
                ))}
              </Select>
              
              <Select
                mode="multiple"
                placeholder="类型筛选"
                style={{ minWidth: 120 }}
                value={typeFilter}
                onChange={setTypeFilter}
                allowClear
              >
                {Object.entries(NODE_TYPE_CONFIG).map(([key, config]) => (
                  <Option key={key} value={key}>
                    <config.icon style={{ color: config.color, marginRight: 4 }} />
                    {config.label}
                  </Option>
                ))}
              </Select>
              
              <Radio.Group 
                value={viewMode} 
                onChange={(e) => {
                  setViewMode(e.target.value);
                  // 切换视图模式后自动居中
                  setTimeout(() => {
                    centerCanvas();
                  }, 100);
                }}
                buttonStyle="solid"
                size="small"
              >
                <Radio.Button value="full">完整视图</Radio.Button>
                <Radio.Button value="upstream">上游依赖</Radio.Button>
                <Radio.Button value="downstream">下游影响</Radio.Button>
              </Radio.Group>
              

            </Space>
          </Col>
          
          <Col>
            <Space>
              <Tooltip title="缩放">
                <Space>
                  <Button 
                    icon={<ZoomOutOutlined />} 
                    size="small"
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                    disabled={zoomLevel <= 50}
                  />
                  <span style={{ minWidth: 40, textAlign: 'center' }}>
                    {zoomLevel}%
                  </span>
                  <Button 
                    icon={<ZoomInOutlined />} 
                    size="small"
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                    disabled={zoomLevel >= 200}
                  />
                </Space>
              </Tooltip>
              
              <Button icon={<ReloadOutlined />} size="small">
                刷新
              </Button>
              
              <Button icon={<DownloadOutlined />} size="small">
                导出
              </Button>
              
              <Button 
                icon={<FullscreenOutlined />} 
                size="small"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                全屏
              </Button>
              
              <Button 
                size="small"
                onClick={() => {
                  setZoomLevel(100);
                  // 延迟执行居中，确保缩放完成后再计算位置
                  setTimeout(() => {
                    centerCanvas();
                  }, 50);
                }}
              >
                重置视图
              </Button>
              
              <Button 
                size="small"
                onClick={centerCanvas}
              >
                居中显示
              </Button>
              
              <Button 
                icon={<InfoCircleOutlined />} 
                size="small"
                type={showDetails ? 'primary' : 'default'}
                onClick={() => setShowDetails(!showDetails)}
              >
                详情
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 血缘图主体 */}
      <div style={{ flex: 1, display: 'flex', gap: DESIGN_TOKENS.spacing.md }}>
        {/* 血缘图画布 */}
        <Card
          className="lineage-canvas"
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 0,
            border: 'none'
          }}
          bodyStyle={{ 
            padding: 0, 
            height: isFullscreen ? '80vh' : '60vh',
            position: 'relative',
            cursor: isPanning ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleCanvasMouseDown}
        >
          {/* 画布背景网格 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${20 * (zoomLevel / 100)}px ${20 * (zoomLevel / 100)}px`,
              opacity: 0.3
            }}
          />
          
          {/* 连接线 */}
          {renderLineageEdges()}
          
          {/* 节点 */}
          {filteredNodes.map(renderLineageNode)}
          
          {/* 图例 */}
          <div
            style={{
              position: 'absolute',
              top: DESIGN_TOKENS.spacing.md,
              right: DESIGN_TOKENS.spacing.md,
              background: 'rgba(255,255,255,0.95)',
              padding: DESIGN_TOKENS.spacing.sm,
              borderRadius: DESIGN_TOKENS.radius.sm,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: '12px'
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>图例</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(NODE_TYPE_CONFIG).map(([key, config]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <config.icon style={{ color: config.color, fontSize: 12 }} />
                  <span>{config.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 操作提示 */}
          <div
            style={{
              position: 'absolute',
              bottom: DESIGN_TOKENS.spacing.md,
              left: DESIGN_TOKENS.spacing.md,
              background: 'rgba(255,255,255,0.95)',
              padding: DESIGN_TOKENS.spacing.sm,
              borderRadius: DESIGN_TOKENS.radius.sm,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: '11px',
              color: DESIGN_TOKENS.colors.textSecondary
            }}
          >
            <div>💡 操作提示：</div>
            <div>• 拖拽节点：重新排列位置</div>
            <div>• 拖拽画布：平移视图</div>
            <div>• 滚轮：缩放画布</div>
            <div>• 点击节点：查看详情</div>
            <div>• 重置视图：自动居中并恢复100%缩放</div>
          </div>
        </Card>

        {/* 详情面板 */}
        {showDetails && selectedNodeData && (
          <Card
            title={
              <Space>
                {React.createElement(NODE_TYPE_CONFIG[selectedNodeData.type].icon, {
                  style: { color: NODE_TYPE_CONFIG[selectedNodeData.type].color }
                })}
                {selectedNodeData.displayName}
                <Tag color={NODE_TYPE_CONFIG[selectedNodeData.type].color}>
                  {NODE_TYPE_CONFIG[selectedNodeData.type].label}
                </Tag>
                {React.createElement(STATUS_CONFIG[selectedNodeData.status].icon, {
                  style: { color: STATUS_CONFIG[selectedNodeData.status].color }
                })}
              </Space>
            }
            style={{
              width: 350,
              borderRadius: DESIGN_TOKENS.radius.md
            }}
            extra={
              <Space>
                <Button 
                  type="text" 
                  size="small"
                  onClick={() => centerOnNode(selectedNodeData.id)}
                  title="在画布中居中显示此节点"
                >
                  🎯
                </Button>
                <Button 
                  type="text" 
                  size="small"
                  onClick={() => setShowDetails(false)}
                >
                  ×
                </Button>
              </Space>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="系统名称">
                {selectedNodeData.name}
              </Descriptions.Item>
              <Descriptions.Item label="负责人">
                {selectedNodeData.metadata.owner}
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {selectedNodeData.metadata.description}
              </Descriptions.Item>
              <Descriptions.Item label="最后更新">
                {selectedNodeData.metadata.lastUpdated ? 
                  new Date(selectedNodeData.metadata.lastUpdated).toLocaleString() : '-'
                }
              </Descriptions.Item>
              {selectedNodeData.metadata.recordCount && (
                <Descriptions.Item label="记录数">
                  {selectedNodeData.metadata.recordCount.toLocaleString()}
                </Descriptions.Item>
              )}
              {selectedNodeData.metadata.qualityScore && (
                <Descriptions.Item label="质量分数">
                  <Badge 
                    count={selectedNodeData.metadata.qualityScore} 
                    style={{ 
                      backgroundColor: selectedNodeData.metadata.qualityScore >= 90 ? 
                        DESIGN_TOKENS.colors.success : 
                        selectedNodeData.metadata.qualityScore >= 70 ? 
                        DESIGN_TOKENS.colors.warning : 
                        DESIGN_TOKENS.colors.error
                    }} 
                  />
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {selectedNodeData.metadata.tags && selectedNodeData.metadata.tags.length > 0 && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: 4 }}>
                    标签
                  </Text>
                  <Space wrap>
                    {selectedNodeData.metadata.tags.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </Space>
                </div>
              </>
            )}
            
            <Divider style={{ margin: '12px 0' }} />
            
            {/* 依赖关系 */}
            <Collapse size="small">
              <Panel 
                header={`上游依赖 (${selectedNodeData.dependencies.length})`} 
                key="upstream"
              >
                {selectedNodeData.dependencies.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selectedNodeData.dependencies.map(depId => {
                      const depNode = lineageData.nodes.find(n => n.id === depId);
                      return depNode ? (
                        <div 
                          key={depId}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 4,
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: 4,
                            backgroundColor: '#f5f5f5'
                          }}
                          onClick={() => handleNodeSelect(depId)}
                        >
                          {React.createElement(NODE_TYPE_CONFIG[depNode.type].icon, {
                            style: { 
                              color: NODE_TYPE_CONFIG[depNode.type].color,
                              fontSize: 12
                            }
                          })}
                          <span style={{ fontSize: 12 }}>{depNode.displayName}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>无上游依赖</Text>
                )}
              </Panel>
              
              <Panel 
                header={`下游影响 (${selectedNodeData.dependents.length})`} 
                key="downstream"
              >
                {selectedNodeData.dependents.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selectedNodeData.dependents.map(depId => {
                      const depNode = lineageData.nodes.find(n => n.id === depId);
                      return depNode ? (
                        <div 
                          key={depId}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 4,
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: 4,
                            backgroundColor: '#f5f5f5'
                          }}
                          onClick={() => handleNodeSelect(depId)}
                        >
                          {React.createElement(NODE_TYPE_CONFIG[depNode.type].icon, {
                            style: { 
                              color: NODE_TYPE_CONFIG[depNode.type].color,
                              fontSize: 12
                            }
                          })}
                          <span style={{ fontSize: 12 }}>{depNode.displayName}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>无下游影响</Text>
                )}
              </Panel>
            </Collapse>
          </Card>
        )}
      </div>
    </div>
  );
};

// 字段级血缘组件
const FieldLineage: React.FC = () => {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // 获取当前表的所有字段
  const currentTableFields = useMemo(() => {
    const currentTable = mockLineageData.nodes.find(node => node.id === 'user_behavior_analysis');
    return currentTable?.fields || [];
  }, []);

  // 搜索过滤字段
  const filteredFields = useMemo(() => {
    return currentTableFields.filter(field => 
      field.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentTableFields, searchTerm]);

  // 字段选项
  const fieldOptions = filteredFields.map(field => ({
    value: field.id,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {field.isPrimaryKey && <span style={{ color: '#faad14' }}>🔑</span>}
        {field.isForeignKey && <span style={{ color: '#52c41a' }}>🔗</span>}
        <span>{field.displayName}</span>
        <span style={{ color: '#999', fontSize: '12px' }}>({field.type})</span>
      </div>
    )
  }));

  // 默认选择第一个字段
  useEffect(() => {
    if (!selectedField && currentTableFields.length > 0) {
      setSelectedField(currentTableFields[0].id);
    }
  }, [selectedField, currentTableFields]);

  // 获取选中字段的血缘数据
  const selectedFieldData = useMemo(() => {
    if (!selectedField) return null;
    return currentTableFields.find(field => field.id === selectedField);
  }, [selectedField, currentTableFields]);

  // 生成字段级血缘图
  const fieldLineageNodes = useMemo(() => {
    if (!selectedFieldData) return [];

    // 这里可以根据实际的字段映射关系生成血缘节点
    // 现在先生成一个示例
    const nodes = [
      // 上游字段
      {
        id: 'source_web_logs_user_id',
        name: 'user_id',
        displayName: '用户ID',
        type: 'VARCHAR(50)',
        tableName: 'web_logs',
        position: { x: 100, y: 200 },
        level: 'source'
      },
      {
        id: 'source_app_events_user_id', 
        name: 'user_id',
        displayName: '用户ID',
        type: 'VARCHAR(50)',
        tableName: 'app_events',
        position: { x: 100, y: 320 },
        level: 'source'
      },
      // 当前字段
      {
        id: selectedField,
        name: selectedFieldData.name,
        displayName: selectedFieldData.displayName,
        type: selectedFieldData.type,
        tableName: 'user_behavior_analysis',
        position: { x: 400, y: 260 },
        level: 'current'
      },
      // 下游字段（如果有的话）
      {
        id: 'target_user_profile_user_id',
        name: 'user_id', 
        displayName: '用户ID',
        type: 'VARCHAR(50)',
        tableName: 'user_profile',
        position: { x: 700, y: 200 },
        level: 'target'
      },
      {
        id: 'target_user_segments_user_id',
        name: 'user_id',
        displayName: '用户ID', 
        type: 'VARCHAR(50)',
        tableName: 'user_segments',
        position: { x: 700, y: 320 },
        level: 'target'
      }
    ];

    return nodes;
  }, [selectedField, selectedFieldData]);

  // 字段连接线
  const fieldLineageEdges = useMemo(() => {
    if (!selectedField) return [];
    
    return [
      {
        source: 'source_web_logs_user_id',
        target: selectedField,
        transform: 'DIRECT'
      },
      {
        source: 'source_app_events_user_id',
        target: selectedField,
        transform: 'UNION'
      },
      {
        source: selectedField,
        target: 'target_user_profile_user_id',
        transform: 'DIRECT'
      },
      {
        source: selectedField,
        target: 'target_user_segments_user_id',
        transform: 'JOIN'
      }
    ];
  }, [selectedField]);

  // 计算连接点
  const getFieldEdgePoint = (sourcePos: any, targetPos: any) => {
    const nodeWidth = 200 * (zoomLevel / 100);
    const nodeHeight = 80 * (zoomLevel / 100);
    
    const sourceX = sourcePos.x * (zoomLevel / 100) + canvasOffset.x;
    const sourceY = sourcePos.y * (zoomLevel / 100) + canvasOffset.y;
    const targetX = targetPos.x * (zoomLevel / 100) + canvasOffset.x;
    const targetY = targetPos.y * (zoomLevel / 100) + canvasOffset.y;

    // 右侧连接点
    const sourcePoint = { 
      x: sourceX + nodeWidth, 
      y: sourceY + nodeHeight / 2 
    };
    
    // 左侧连接点
    const targetPoint = { 
      x: targetX, 
      y: targetY + nodeHeight / 2 
    };

    return { sourcePoint, targetPoint };
  };

  // 居中显示
  const centerCanvas = useCallback(() => {
    if (fieldLineageNodes.length === 0) return;
    
    setTimeout(() => {
      const canvas = document.querySelector('.field-lineage-canvas');
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;
      
      // 计算所有节点的边界
      const minX = Math.min(...fieldLineageNodes.map(n => n.position.x));
      const maxX = Math.max(...fieldLineageNodes.map(n => n.position.x));
      const minY = Math.min(...fieldLineageNodes.map(n => n.position.y));
      const maxY = Math.max(...fieldLineageNodes.map(n => n.position.y));
      
      const graphWidth = (maxX - minX + 200) * (zoomLevel / 100);
      const graphHeight = (maxY - minY + 80) * (zoomLevel / 100);
      
      const offsetX = (canvasWidth - graphWidth) / 2 - minX * (zoomLevel / 100);
      const offsetY = (canvasHeight - graphHeight) / 2 - minY * (zoomLevel / 100);
      
      setCanvasOffset({ x: offsetX, y: offsetY });
    }, 100);
  }, [fieldLineageNodes, zoomLevel]);

  // 当选择字段变化时居中
  useEffect(() => {
    centerCanvas();
  }, [selectedField, centerCanvas]);

  return (
    <Card
      className="field-lineage-canvas"
      style={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        border: 'none',
        borderRadius: 0
      }}
      bodyStyle={{ padding: 0, height: '100%' }}
    >
      {/* 工具栏 */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 8,
          padding: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f0f0f0'
        }}
      >
        <Row gutter={16} align="middle">
          <Col>
            <Space align="center">
              <Typography.Text strong style={{ fontSize: 14 }}>
                字段级血缘
              </Typography.Text>
            </Space>
          </Col>
          
          <Col flex={1}>
            <Space align="center" style={{ width: '100%' }}>
              <Typography.Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                选择字段：
              </Typography.Text>
              <Select
                value={selectedField}
                onChange={setSelectedField}
                style={{ width: 300 }}
                placeholder="请选择字段"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const field = currentTableFields.find(f => f.id === option?.value);
                  return field ? 
                    field.displayName.toLowerCase().includes(input.toLowerCase()) ||
                    field.name.toLowerCase().includes(input.toLowerCase()) : false;
                }}
              >
                {currentTableFields.map(field => (
                  <Select.Option key={field.id} value={field.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {field.isPrimaryKey && <span style={{ color: '#faad14' }}>🔑</span>}
                      {field.isForeignKey && <span style={{ color: '#52c41a' }}>🔗</span>}
                      <span>{field.displayName}</span>
                      <span style={{ color: '#999', fontSize: '12px' }}>({field.type})</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Col>
          
          <Col>
            <Space>
              <Button
                size="small"
                onClick={centerCanvas}
                title="居中显示"
              >
                🎯 居中
              </Button>
              
              <Button
                size="small"
                onClick={() => {
                  setZoomLevel(100);
                  centerCanvas();
                }}
                title="重置视图"
              >
                🔄 重置
              </Button>
              
              <Space.Compact>
                <Button
                  size="small"
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  disabled={zoomLevel <= 50}
                >
                  -
                </Button>
                <span style={{ 
                  padding: '0 8px', 
                  fontSize: 12, 
                  lineHeight: '24px',
                  minWidth: 45,
                  textAlign: 'center' 
                }}>
                  {zoomLevel}%
                </span>
                <Button
                  size="small"
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                  disabled={zoomLevel >= 200}
                >
                  +
                </Button>
              </Space.Compact>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 画布内容 */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        backgroundColor: '#fafafa'
      }}>
        {!selectedField ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <Empty 
              description="请选择一个字段查看其血缘关系"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <>
            {/* SVG 连接线 */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1
              }}
            >
              <defs>
                <marker
                  id="field-arrow"
                  viewBox="0 0 10 10"
                  markerWidth={6}
                  markerHeight={6}
                  refX={8}
                  refY={5}
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path
                    d="M 0 2 L 0 8 L 8 5 Z"
                    fill="#1890ff"
                    stroke="none"
                  />
                </marker>
              </defs>
              
              {fieldLineageEdges.map((edge, index) => {
                const sourceNode = fieldLineageNodes.find(n => n.id === edge.source);
                const targetNode = fieldLineageNodes.find(n => n.id === edge.target);
                
                if (!sourceNode || !targetNode) return null;
                
                const { sourcePoint, targetPoint } = getFieldEdgePoint(sourceNode.position, targetNode.position);
                
                return (
                  <g key={index}>
                    {/* 连接线 */}
                    <path
                      d={`M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`}
                      stroke="#1890ff"
                      strokeWidth={2}
                      fill="none"
                      markerEnd="url(#field-arrow)"
                      opacity={0.8}
                    />
                    
                    {/* 转换标签 */}
                    <foreignObject
                      x={(sourcePoint.x + targetPoint.x) / 2 - 25}
                      y={(sourcePoint.y + targetPoint.y) / 2 - 10}
                      width={50}
                      height={20}
                    >
                      <div style={{
                        backgroundColor: '#fff',
                        border: '1px solid #d9d9d9',
                        borderRadius: 4,
                        padding: '2px 6px',
                        fontSize: 10,
                        textAlign: 'center',
                        color: '#666'
                      }}>
                        {edge.transform}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>

            {/* 字段节点 */}
            {fieldLineageNodes.map((node) => (
              <Card
                key={node.id}
                size="small"
                style={{
                  position: 'absolute',
                  left: node.position.x * (zoomLevel / 100) + canvasOffset.x,
                  top: node.position.y * (zoomLevel / 100) + canvasOffset.y,
                  width: 200 * (zoomLevel / 100),
                  minHeight: 80 * (zoomLevel / 100),
                  border: node.level === 'current' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  boxShadow: node.level === 'current' ? '0 4px 12px rgba(24, 144, 255, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  borderRadius: 8,
                  zIndex: 10,
                  cursor: 'pointer',
                  backgroundColor: hoveredNode === node.id ? '#f0f8ff' : '#fff',
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left'
                }}
                bodyStyle={{ 
                  padding: 8 * (zoomLevel / 100),
                  fontSize: 11 * (zoomLevel / 100)
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* 表名 */}
                <div style={{
                  fontSize: 10 * (zoomLevel / 100),
                  color: '#666',
                  marginBottom: 4 * (zoomLevel / 100),
                  fontWeight: 500
                }}>
                  📊 {node.tableName}
                </div>
                
                {/* 字段信息 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4 * (zoomLevel / 100),
                  marginBottom: 4 * (zoomLevel / 100)
                }}>
                  {node.level === 'current' && <span style={{ color: '#faad14' }}>🔑</span>}
                  <span style={{
                    fontWeight: node.level === 'current' ? 600 : 500,
                    color: node.level === 'current' ? '#1890ff' : '#333'
                  }}>
                    {node.displayName}
                  </span>
                </div>
                
                {/* 数据类型 */}
                <div style={{
                  fontSize: 9 * (zoomLevel / 100),
                  color: '#999',
                  fontFamily: 'Monaco, Consolas, monospace'
                }}>
                  {node.type}
                </div>
                
                                 {/* 层级标识 */}
                 <Tag
                   color={
                     node.level === 'source' ? 'blue' :
                     node.level === 'current' ? 'green' : 'orange'
                   }
                   style={{
                     marginTop: 4 * (zoomLevel / 100),
                     fontSize: 8 * (zoomLevel / 100)
                   }}
                 >
                   {node.level === 'source' ? '上游' : 
                    node.level === 'current' ? '当前' : '下游'}
                 </Tag>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* 操作提示 */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          borderRadius: 6,
          fontSize: 12,
          color: '#666',
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        💡 提示：选择不同字段查看其血缘关系，支持搜索字段名称
      </div>
    </Card>
  );
};

export default DataLineage;
export { FieldLineage }; 