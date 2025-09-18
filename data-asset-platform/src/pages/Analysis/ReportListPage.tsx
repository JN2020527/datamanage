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
  Dropdown,
  message
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  TableOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'table' | 'chart' | 'dashboard';
  status: 'draft' | 'published';
  creator: string;
  createTime: string;
  updateTime: string;
  dataSource: string;
  recordCount?: number;
}

const ReportListPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 模拟报表数据
  const mockReports: Report[] = [
    {
      id: '1',
      name: '销售数据统计表',
      description: '包含产品销售数据的详细统计，支持按地区、时间筛选',
      type: 'table',
      status: 'published',
      creator: '张三',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-20 14:20:00',
      dataSource: '销售数据库',
      recordCount: 1250
    },
    {
      id: '2',
      name: '用户信息汇总',
      description: '用户基本信息和行为数据汇总表',
      type: 'table',
      status: 'draft',
      creator: '李四',
      createTime: '2024-01-18 09:15:00',
      updateTime: '2024-01-18 16:45:00',
      dataSource: '用户数据库',
      recordCount: 580
    },
    {
      id: '3',
      name: '财务月报表',
      description: '月度财务数据汇总，包含收入、支出、利润等关键指标',
      type: 'table',
      status: 'published',
      creator: '王五',
      createTime: '2024-01-10 11:00:00',
      updateTime: '2024-01-19 10:30:00',
      dataSource: '财务系统',
      recordCount: 95
    }
  ];

  const [reports, setReports] = useState<Report[]>(mockReports);

  // 获取状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'published':
        return <Tag color="green">已发布</Tag>;
      case 'draft':
        return <Tag color="orange">草稿</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'table':
        return <TableOutlined style={{ color: '#1890ff' }} />;
      case 'chart':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      case 'dashboard':
        return <FileTextOutlined style={{ color: '#722ed1' }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  // 创建新报表
  const handleCreateReport = () => {
    navigate('/analysis/report/designer/new');
  };

  // 编辑报表
  const handleEditReport = (reportId: string) => {
    navigate(`/analysis/report/designer/${reportId}`);
  };

  // 预览报表
  const handlePreviewReport = (reportId: string) => {
    message.info('预览功能开发中...');
  };

  // 删除报表
  const handleDeleteReport = (reportId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这个报表吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setReports(prev => prev.filter(report => report.id !== reportId));
        message.success('报表删除成功');
      }
    });
  };

  // 更多操作菜单
  const getMoreMenu = (report: Report) => ({
    items: [
      {
        key: 'copy',
        label: '复制报表',
        onClick: () => message.info('复制功能开发中...')
      },
      {
        key: 'export',
        label: '导出报表',
        onClick: () => message.info('导出功能开发中...')
      },
      {
        key: 'share',
        label: '分享报表',
        onClick: () => message.info('分享功能开发中...')
      }
    ]
  });

  return (
    <div className="page-container">
      {/* 页面标题和操作 */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <TableOutlined style={{ fontSize: 24, color: '#000000' }} />
              <Title level={2} style={{ margin: 0 }}>
                报表专区
              </Title>
            </Space>
            <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
              创建和管理二维表格报表，快速生成专业的数据报告
            </Paragraph>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={handleCreateReport}
              >
                新建报表
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 报表列表 */}
      {reports.length === 0 ? (
        <Card>
          <Empty
            description="暂无报表"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateReport}>
              创建第一个报表
            </Button>
          </Empty>
        </Card>
      ) : (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 3,
            xxl: 3,
          }}
          dataSource={reports}
          renderItem={(report) => (
            <List.Item>
              <Card
                hoverable
                actions={[
                  <Button
                    key="preview"
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreviewReport(report.id)}
                  >
                    预览
                  </Button>,
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditReport(report.id)}
                  >
                    编辑
                  </Button>,
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    删除
                  </Button>,
                  <Dropdown key="more" menu={getMoreMenu(report)} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                ]}
              >
                <Card.Meta
                  avatar={getTypeIcon(report.type)}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{report.name}</span>
                      {getStatusTag(report.status)}
                    </div>
                  }
                  description={
                    <div>
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 12, minHeight: 44 }}
                      >
                        {report.description}
                      </Paragraph>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>
                            <UserOutlined style={{ marginRight: 4 }} />
                            {report.creator}
                          </span>
                          <span>
                            {report.recordCount ? `${report.recordCount} 条记录` : '-'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>数据源: {report.dataSource}</span>
                          <span>
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            {report.updateTime.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}

      {/* 功能说明 */}
      <Card style={{ marginTop: 24 }} title="功能特性">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              <TableOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 12 }} />
              <Title level={4}>快速制作</Title>
              <Text type="secondary">
                5步快速制作专业报表：选择数据源、配置字段、设置筛选、美化样式、预览导出
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              <FileTextOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 12 }} />
              <Title level={4}>多种数据源</Title>
              <Text type="secondary">
                支持Excel、CSV文件上传，数据库连接，API接口，以及手工录入等多种数据来源
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              <EyeOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 12 }} />
              <Title level={4}>实时预览</Title>
              <Text type="secondary">
                所见即所得的编辑体验，配置即时生效，支持多种主题和自定义样式
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ReportListPage; 