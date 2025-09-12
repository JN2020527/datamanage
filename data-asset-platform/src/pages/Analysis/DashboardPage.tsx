import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Button,
  Space,
  Breadcrumb,
  Row,
  Col,
  message,
  Modal,
  Form,
  Input,
  Select,
  List,
  Avatar,
  Tag,
  Popconfirm,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DashboardDesigner from '@components/Analysis/DashboardDesigner';
import { useNotification } from '@hooks/useNotification';
import { api } from '@mock/api';

const { Title, Text, Paragraph } = Typography;

interface Dashboard {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  componentCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  config: any;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [activeView, setActiveView] = useState<'list' | 'designer'>('list');
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    setLoading(true);
    try {
      // 模拟加载看板数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockDashboards: Dashboard[] = [
        {
          id: '1',
          name: '销售业绩看板',
          description: '展示销售团队的关键业绩指标和趋势分析',
          thumbnail: '',
          componentCount: 8,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          createdBy: '张三',
          status: 'published',
          views: 245,
          config: {},
        },
        {
          id: '2',
          name: '运营数据看板',
          description: '监控网站流量、用户行为和转化率等运营指标',
          thumbnail: '',
          componentCount: 12,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
          createdBy: '李四',
          status: 'published',
          views: 189,
          config: {},
        },
        {
          id: '3',
          name: '财务分析看板',
          description: '展示收入、成本、利润等财务核心指标',
          thumbnail: '',
          componentCount: 6,
          createdAt: '2024-01-12',
          updatedAt: '2024-01-16',
          createdBy: '王五',
          status: 'draft',
          views: 56,
          config: {},
        },
      ];

      setDashboards(mockDashboards);
    } catch (error) {
      showError('加载看板列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDashboard = async (values: any) => {
    try {
      const newDashboard: Dashboard = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        thumbnail: '',
        componentCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: '当前用户',
        status: 'draft',
        views: 0,
        config: {
          id: Date.now().toString(),
          name: values.name,
          description: values.description,
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
        },
      };

      setDashboards([newDashboard, ...dashboards]);
      setSelectedDashboard(newDashboard);
      setCreateModalVisible(false);
      setActiveView('designer');
      form.resetFields();
      showSuccess('看板创建成功');
    } catch (error) {
      showError('创建看板失败');
    }
  };

  const handleEditDashboard = (dashboard: Dashboard) => {
    setSelectedDashboard(dashboard);
    setActiveView('designer');
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    try {
      setDashboards(dashboards.filter(d => d.id !== dashboardId));
      showSuccess('看板删除成功');
    } catch (error) {
      showError('删除看板失败');
    }
  };

  const handleCopyDashboard = async (dashboard: Dashboard) => {
    try {
      const newDashboard: Dashboard = {
        ...dashboard,
        id: Date.now().toString(),
        name: `${dashboard.name} - 副本`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        status: 'draft',
        views: 0,
      };

      setDashboards([newDashboard, ...dashboards]);
      showSuccess('看板复制成功');
    } catch (error) {
      showError('复制看板失败');
    }
  };

  const handleSaveDashboard = (config: any) => {
    if (selectedDashboard) {
      const updatedDashboard = {
        ...selectedDashboard,
        config,
        componentCount: config.components.length,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      setDashboards(dashboards.map(d => 
        d.id === selectedDashboard.id ? updatedDashboard : d
      ));
      setSelectedDashboard(updatedDashboard);
      showSuccess('看板保存成功');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'orange';
      case 'archived': return 'gray';
      default: return 'blue';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '已发布';
      case 'draft': return '草稿';
      case 'archived': return '已归档';
      default: return status;
    }
  };

  if (activeView === 'designer') {
    return (
      <div style={{ height: '100vh', overflow: 'hidden' }}>
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button onClick={() => setActiveView('list')}>
                  ← 返回看板列表
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedDashboard ? `编辑: ${selectedDashboard.name}` : '新建看板'}
                </Title>
              </Space>
            </Col>
          </Row>
        </Card>
        
        <DashboardDesigner
          initialData={selectedDashboard?.config}
          onSave={handleSaveDashboard}
          onPreview={(config) => {
            console.log('预览看板:', config);
          }}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* 面包屑导航 */}
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/')}>首页</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>敏捷分析</Breadcrumb.Item>
        <Breadcrumb.Item>看板设计器</Breadcrumb.Item>
      </Breadcrumb>

      {/* 页面标题和操作 */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <DashboardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <Title level={2} style={{ margin: 0 }}>
                看板设计器
              </Title>
            </Space>
            <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
              拖拽式设计，快速创建专业的数据可视化看板
            </Paragraph>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setCreateModalVisible(true)}
              >
                创建看板
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 看板列表 */}
      <Card>
        {dashboards.length === 0 ? (
          <Empty
            image={<AppstoreOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description={
              <div>
                <Title level={4} type="secondary">还没有看板</Title>
                <Paragraph type="secondary">
                  创建您的第一个数据看板，让数据可视化变得简单
                </Paragraph>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  创建看板
                </Button>
              </div>
            }
          />
        ) : (
          <List
            loading={loading}
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={dashboards}
            renderItem={(dashboard) => (
              <List.Item>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  cover={
                    <div
                      style={{
                        height: 160,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 48,
                      }}
                    >
                      <BarChartOutlined />
                    </div>
                  }
                  actions={[
                    <Tooltip title="预览">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          // 预览功能
                          showSuccess('预览功能开发中');
                        }}
                      />
                    </Tooltip>,
                    <Tooltip title="编辑">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditDashboard(dashboard)}
                      />
                    </Tooltip>,
                    <Tooltip title="复制">
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => handleCopyDashboard(dashboard)}
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="确定删除此看板？"
                      onConfirm={() => handleDeleteDashboard(dashboard.id)}
                    >
                      <Tooltip title="删除">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Tooltip>
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong ellipsis style={{ flex: 1 }}>
                          {dashboard.name}
                        </Text>
                        <Tag color={getStatusColor(dashboard.status)}>
                          {getStatusText(dashboard.status)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: 8, minHeight: 40 }}
                        >
                          {dashboard.description}
                        </Paragraph>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          <div>组件: {dashboard.componentCount} 个</div>
                          <div>浏览: {dashboard.views} 次</div>
                          <div>更新: {dashboard.updatedAt}</div>
                          <div>创建者: {dashboard.createdBy}</div>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 创建看板模态框 */}
      <Modal
        title="创建新看板"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateDashboard}
        >
          <Form.Item
            name="name"
            label="看板名称"
            rules={[{ required: true, message: '请输入看板名称' }]}
          >
            <Input placeholder="输入看板名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="看板描述"
            rules={[{ required: true, message: '请输入看板描述' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="简要描述看板的用途和内容"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
