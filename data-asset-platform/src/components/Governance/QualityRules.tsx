import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Tooltip,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Tabs,
  Switch,
  InputNumber,
  Progress,
  Statistic,
  Alert,
  Timeline,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  BugOutlined,
  SettingOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface QualityRule {
  id: string;
  name: string;
  type: 'completeness' | 'accuracy' | 'consistency' | 'validity' | 'uniqueness';
  description: string;
  sql: string;
  threshold: {
    warning: number;
    error: number;
  };
  schedule: string;
  status: 'active' | 'inactive' | 'draft';
  lastRun?: string;
  lastResult?: {
    score: number;
    status: 'passed' | 'warning' | 'failed';
    details: string;
  };
  targetTables: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

const QualityRules: React.FC = () => {
  const [rules, setRules] = useState<QualityRule[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<QualityRule | null>(null);
  const [loading, setLoading] = useState(false);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [form] = Form.useForm();
  const { showSuccess, showError } = useNotification();

  // 模拟数据
  const mockRules: QualityRule[] = [
    {
      id: '1',
      name: '用户表完整性检查',
      type: 'completeness',
      description: '检查用户表中必填字段的完整性，确保关键信息不为空',
      sql: 'SELECT COUNT(*) as total, COUNT(CASE WHEN name IS NULL OR email IS NULL THEN 1 END) as null_count FROM users',
      threshold: {
        warning: 95,
        error: 90,
      },
      schedule: '0 2 * * *',
      status: 'active',
      lastRun: '2024-09-04 02:00:00',
      lastResult: {
        score: 98.5,
        status: 'passed',
        details: '用户表完整性良好，仅有1.5%的记录存在空值',
      },
      targetTables: ['users', 'user_profiles'],
      owner: '数据质量团队',
      createdAt: '2024-01-15',
      updatedAt: '2024-08-20',
    },
    {
      id: '2',
      name: '订单金额准确性验证',
      type: 'accuracy',
      description: '验证订单金额的准确性，检查订单明细与总金额的一致性',
      sql: 'SELECT o.id, o.total_amount, SUM(oi.price * oi.quantity) as calculated_total FROM orders o JOIN order_items oi ON o.id = oi.order_id GROUP BY o.id, o.total_amount HAVING ABS(o.total_amount - calculated_total) > 0.01',
      threshold: {
        warning: 99,
        error: 95,
      },
      schedule: '0 */6 * * *',
      status: 'active',
      lastRun: '2024-09-04 06:00:00',
      lastResult: {
        score: 97.2,
        status: 'warning',
        details: '发现2.8%的订单存在金额不一致问题',
      },
      targetTables: ['orders', 'order_items'],
      owner: '财务数据组',
      createdAt: '2024-02-10',
      updatedAt: '2024-09-01',
    },
    {
      id: '3',
      name: '手机号格式一致性',
      type: 'consistency',
      description: '检查手机号格式的一致性，确保符合中国大陆手机号标准',
      sql: 'SELECT COUNT(*) as total, COUNT(CASE WHEN mobile NOT REGEXP \'^1[3-9][0-9]{9}$\' THEN 1 END) as invalid_count FROM users WHERE mobile IS NOT NULL',
      threshold: {
        warning: 98,
        error: 95,
      },
      schedule: '0 1 * * *',
      status: 'active',
      lastRun: '2024-09-04 01:00:00',
      lastResult: {
        score: 99.1,
        status: 'passed',
        details: '手机号格式基本规范，仅0.9%存在格式问题',
      },
      targetTables: ['users', 'contacts'],
      owner: '业务数据组',
      createdAt: '2024-03-05',
      updatedAt: '2024-07-15',
    },
    {
      id: '4',
      name: '邮箱有效性检查',
      type: 'validity',
      description: '验证邮箱地址的有效性，检查邮箱格式是否符合RFC标准',
      sql: 'SELECT COUNT(*) as total, COUNT(CASE WHEN email NOT REGEXP \'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$\' THEN 1 END) as invalid_count FROM users WHERE email IS NOT NULL',
      threshold: {
        warning: 97,
        error: 93,
      },
      schedule: '0 3 * * *',
      status: 'active',
      lastRun: '2024-09-04 03:00:00',
      lastResult: {
        score: 96.8,
        status: 'passed',
        details: '邮箱格式符合标准，3.2%存在格式问题',
      },
      targetTables: ['users'],
      owner: '数据质量团队',
      createdAt: '2024-01-20',
      updatedAt: '2024-06-10',
    },
    {
      id: '5',
      name: '用户ID唯一性检查',
      type: 'uniqueness',
      description: '检查用户ID的唯一性，确保没有重复的用户标识',
      sql: 'SELECT user_id, COUNT(*) as count FROM users GROUP BY user_id HAVING COUNT(*) > 1',
      threshold: {
        warning: 100,
        error: 99,
      },
      schedule: '0 0 * * *',
      status: 'active',
      lastRun: '2024-09-04 00:00:00',
      lastResult: {
        score: 100,
        status: 'passed',
        details: '用户ID唯一性完好，未发现重复',
      },
      targetTables: ['users'],
      owner: '架构数据组',
      createdAt: '2024-02-01',
      updatedAt: '2024-08-15',
    },
  ];

  const ruleTypes = [
    { value: 'completeness', label: '完整性', color: 'blue' },
    { value: 'accuracy', label: '准确性', color: 'green' },
    { value: 'consistency', label: '一致性', color: 'orange' },
    { value: 'validity', label: '有效性', color: 'purple' },
    { value: 'uniqueness', label: '唯一性', color: 'cyan' },
  ];

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRules(mockRules);
    } catch (error) {
      showError('加载质量规则失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRule(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (rule: QualityRule) => {
    setEditingRule(rule);
    form.setFieldsValue(rule);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const ruleData = {
        ...values,
        id: editingRule?.id || Date.now().toString(),
        createdAt: editingRule?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        lastRun: editingRule?.lastRun,
        lastResult: editingRule?.lastResult,
      };

      if (editingRule) {
        setRules(prev =>
          prev.map(item => (item.id === editingRule.id ? ruleData : item))
        );
        showSuccess('质量规则更新成功');
      } else {
        setRules(prev => [...prev, ruleData]);
        showSuccess('质量规则创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      showError('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setRules(prev => prev.filter(item => item.id !== id));
      showSuccess('质量规则删除成功');
    } catch (error) {
      showError('删除失败');
    }
  };

  const handleRunTest = async (rule: QualityRule) => {
    setRunningTests(prev => new Set(prev).add(rule.id));
    try {
      // 模拟运行测试
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        score: 90 + Math.random() * 10,
        status: Math.random() > 0.3 ? 'passed' : 'warning',
        details: `测试于 ${new Date().toLocaleString()} 执行完成`,
      };

      setRules(prev =>
        prev.map(item =>
          item.id === rule.id
            ? {
                ...item,
                lastRun: new Date().toISOString(),
                lastResult: mockResult as any,
              }
            : item
        )
      );
      showSuccess('质量检查执行完成');
    } catch (error) {
      showError('质量检查执行失败');
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(rule.id);
        return newSet;
      });
    }
  };

  const getTypeConfig = (type: string) => {
    return ruleTypes.find(t => t.value === type) || ruleTypes[0];
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'green';
      case 'warning': return 'orange';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const getResultStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircleOutlined />;
      case 'warning': return <ExclamationCircleOutlined />;
      case 'failed': return <ExclamationCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: QualityRule) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description.slice(0, 50)}...
          </Text>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const config = getTypeConfig(type);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '目标表',
      dataIndex: 'targetTables',
      key: 'targetTables',
      width: 150,
      render: (tables: string[]) => (
        <Space wrap>
          {tables.slice(0, 2).map(table => (
            <Tag key={table} size="small">
              {table}
            </Tag>
          ))}
          {tables.length > 2 && (
            <Tooltip title={tables.slice(2).join(', ')}>
              <Tag size="small">+{tables.length - 2}</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '最近结果',
      key: 'lastResult',
      width: 150,
      render: (_: any, record: QualityRule) => {
        if (!record.lastResult) {
          return <Text type="secondary">未运行</Text>;
        }
        return (
          <Space direction="vertical" size="small">
            <Space>
              <Badge
                status={getResultStatusColor(record.lastResult.status) as any}
                text={
                  <Text style={{ fontSize: '12px' }}>
                    {record.lastResult.score.toFixed(1)}%
                  </Text>
                }
              />
            </Space>
            <Progress
              percent={record.lastResult.score}
              size="small"
              status={
                record.lastResult.status === 'passed'
                  ? 'success'
                  : record.lastResult.status === 'warning'
                  ? 'active'
                  : 'exception'
              }
              showInfo={false}
            />
          </Space>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange'}>
          {status === 'active' ? '启用' : status === 'inactive' ? '禁用' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 100,
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_: any, record: QualityRule) => (
        <Space>
          <Tooltip title="运行测试">
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              size="small"
              loading={runningTests.has(record.id)}
              onClick={() => handleRunTest(record)}
              disabled={record.status !== 'active'}
            />
          </Tooltip>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<BarChartOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个质量规则吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="删除">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <BugOutlined /> 质量检查规则
          </Title>
          <Text type="secondary">
            定义和管理数据质量检查规则，自动监控数据质量状况
          </Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建规则
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        {ruleTypes.map((type, index) => {
          const count = rules.filter(rule => rule.type === type.value).length;
          const passedCount = rules.filter(
            rule => rule.type === type.value && rule.lastResult?.status === 'passed'
          ).length;
          return (
            <Col span={4.8} key={index}>
              <Card size="small">
                <Statistic
                  title={type.label}
                  value={count}
                  suffix={`/ ${passedCount} 通过`}
                  valueStyle={{ color: type.color }}
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          loading={loading}
          pagination={{
            total: rules.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingRule ? '编辑质量规则' : '新建质量规则'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'draft',
            owner: '当前用户',
            threshold: {
              warning: 95,
              error: 90,
            },
            schedule: '0 2 * * *',
          }}
        >
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="规则名称"
                          name="name"
                          rules={[{ required: true, message: '请输入规则名称' }]}
                        >
                          <Input placeholder="输入质量规则名称" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="规则类型"
                          name="type"
                          rules={[{ required: true, message: '请选择规则类型' }]}
                        >
                          <Select placeholder="选择规则类型">
                            {ruleTypes.map(type => (
                              <Select.Option key={type.value} value={type.value}>
                                <Tag color={type.color} size="small">
                                  {type.label}
                                </Tag>
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label="规则描述"
                      name="description"
                      rules={[{ required: true, message: '请输入规则描述' }]}
                    >
                      <TextArea rows={3} placeholder="详细描述这个质量检查规则的用途和逻辑" />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="负责人"
                          name="owner"
                          rules={[{ required: true, message: '请输入负责人' }]}
                        >
                          <Input placeholder="输入负责人姓名" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="状态"
                          name="status"
                          rules={[{ required: true, message: '请选择状态' }]}
                        >
                          <Select>
                            <Select.Option value="draft">草稿</Select.Option>
                            <Select.Option value="active">启用</Select.Option>
                            <Select.Option value="inactive">禁用</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label="目标表"
                      name="targetTables"
                      rules={[{ required: true, message: '请选择目标表' }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="选择要检查的数据表"
                        style={{ width: '100%' }}
                      >
                        <Select.Option value="users">users</Select.Option>
                        <Select.Option value="orders">orders</Select.Option>
                        <Select.Option value="products">products</Select.Option>
                        <Select.Option value="user_profiles">user_profiles</Select.Option>
                        <Select.Option value="order_items">order_items</Select.Option>
                      </Select>
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'config',
                label: '规则配置',
                children: (
                  <>
                    <Form.Item
                      label="检查SQL"
                      name="sql"
                      rules={[{ required: true, message: '请输入检查SQL' }]}
                    >
                      <TextArea
                        rows={8}
                        placeholder="请输入用于数据质量检查的SQL语句..."
                        style={{ fontFamily: 'monospace' }}
                      />
                    </Form.Item>

                    <Card title="阈值设置" size="small">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="警告阈值 (%)"
                            name={['threshold', 'warning']}
                            rules={[{ required: true, message: '请设置警告阈值' }]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              style={{ width: '100%' }}
                              placeholder="95"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="错误阈值 (%)"
                            name={['threshold', 'error']}
                            rules={[{ required: true, message: '请设置错误阈值' }]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              style={{ width: '100%' }}
                              placeholder="90"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>

                    <Form.Item
                      label="执行计划 (Cron)"
                      name="schedule"
                      rules={[{ required: true, message: '请设置执行计划' }]}
                    >
                      <Input placeholder="0 2 * * * (每天凌晨2点执行)" />
                    </Form.Item>

                    <Alert
                      message="SQL编写提示"
                      description="SQL查询应该返回用于计算质量分数的数据。通常包含total（总数）和问题记录数的统计。"
                      type="info"
                      showIcon
                      style={{ marginTop: '16px' }}
                    />
                  </>
                ),
              },
            ]}
          />

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingRule ? '更新' : '创建'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default QualityRules;
