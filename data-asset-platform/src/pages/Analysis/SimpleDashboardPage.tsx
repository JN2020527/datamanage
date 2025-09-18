import React, { useState } from 'react';
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
  List,
  Tag,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

interface Dashboard {
  id: string;
  name: string;
  description: string;
  componentCount: number;
  createdAt: string;
  status: 'draft' | 'published';
  views: number;
}

const SimpleDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState<Dashboard[]>([
    {
      id: '1',
      name: '销售业绩看板',
      description: '展示销售团队的关键业绩指标和趋势分析',
      componentCount: 8,
      createdAt: '2024-01-15',
      status: 'published',
      views: 245,
    },
    {
      id: '2',
      name: '运营数据看板',
      description: '监控网站流量、用户行为和转化率等运营指标',
      componentCount: 12,
      createdAt: '2024-01-10',
      status: 'published',
      views: 189,
    },
    {
      id: '3',
      name: '财务分析看板',
      description: '展示收入、成本、利润等财务核心指标',
      componentCount: 6,
      createdAt: '2024-01-12',
      status: 'draft',
      views: 56,
    },
  ]);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreateDashboard = async (values: any) => {
    const newDashboard: Dashboard = {
      id: Date.now().toString(),
      name: values.name,
      description: values.description,
      componentCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      views: 0,
    };

    setDashboards([newDashboard, ...dashboards]);
    setCreateModalVisible(false);
    form.resetFields();
    
    // 显示成功消息
    Modal.success({
      title: '创建成功',
      content: '看板创建成功！即将支持完整的拖拽设计功能。',
    });
  };

  const handleEditDashboard = (dashboardId: string) => {
    // 跳转到看板编辑器页面
    navigate(`/analysis/dashboard/editor/${dashboardId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'orange';
      default: return 'blue';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '已发布';
      case 'draft': return '草稿';
      default: return status;
    }
  };

  return (
    <div className="page-container">
      {/* 页面标题和操作 */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <DashboardOutlined style={{ fontSize: 24, color: '#000000' }} />
              <Title level={2} style={{ margin: 0 }}>
                帆软报表
              </Title>
            </Space>
            <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
              拖拽式设计，快速创建专业的数据可视化看板
            </Paragraph>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<AppstoreOutlined />}
                size="large"
                onClick={() => {
                  Modal.info({
                    title: '模板库',
                    content: '模板库功能正在开发中，敬请期待！',
                  });
                }}
              >
                模板库
              </Button>
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
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        Modal.info({
                          title: '预览功能',
                          content: '预览功能正在开发中，敬请期待！',
                        });
                      }}
                    >
                      预览
                    </Button>,
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditDashboard(dashboard.id)}
                    >
                      编辑
                    </Button>,
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: '删除看板',
                          content: '确定要删除这个看板吗？',
                          onOk: () => {
                            setDashboards(dashboards.filter(d => d.id !== dashboard.id));
                          },
                        });
                      }}
                    >
                      删除
                    </Button>,
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
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: 8, minHeight: 40 }}
                        >
                          {dashboard.description}
                        </Paragraph>
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

      {/* 功能说明 */}
      <Card style={{ marginTop: 24 }} title="功能说明">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card size="small">
              <Space direction="vertical">
                <DashboardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <Text strong>看板管理</Text>
                <Text type="secondary">创建、编辑、删除看板</Text>
                <Tag color="green">✅ 已完成</Tag>
              </Space>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Space direction="vertical">
                <AppstoreOutlined style={{ fontSize: 24, color: '#faad14' }} />
                <Text strong>拖拽设计器</Text>
                <Text type="secondary">拖拽组件快速设计</Text>
                <Tag color="orange">🚧 开发中</Tag>
              </Space>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Space direction="vertical">
                <BarChartOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <Text strong>模板库</Text>
                <Text type="secondary">预设看板模板</Text>
                <Tag color="orange">🚧 开发中</Tag>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SimpleDashboardPage;
