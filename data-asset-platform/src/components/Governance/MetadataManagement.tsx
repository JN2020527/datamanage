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
  Typography,
  Row,
  Col,
  Tabs,
  Tree,
  Drawer,
  Badge,
  Progress,
  Statistic,
  Timeline,
  List,
  Avatar,
  Empty,
} from 'antd';
import {
  DatabaseOutlined,
  TableOutlined,
  FieldNumberOutlined,
  EditOutlined,
  EyeOutlined,
  TagsOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  SyncOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNotification } from '@hooks/useNotification';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TextArea } = Input;

interface MetadataEntity {
  id: string;
  name: string;
  type: 'database' | 'table' | 'column' | 'view';
  description?: string;
  tags: string[];
  owner?: string;
  classification?: string;
  businessTerms: string[];
  technicalSpecs: {
    dataType?: string;
    length?: number;
    nullable?: boolean;
    primaryKey?: boolean;
    foreignKey?: boolean;
  };
  lineage: {
    upstream: string[];
    downstream: string[];
  };
  quality: {
    completeness: number;
    accuracy: number;
    consistency: number;
  };
  usage: {
    accessCount: number;
    lastAccessed?: string;
    popularQueries: string[];
  };
  lastUpdated: string;
  createdAt: string;
  path: string;
  children?: MetadataEntity[];
}

const MetadataManagement: React.FC = () => {
  const [entities, setEntities] = useState<MetadataEntity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<MetadataEntity | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [form] = Form.useForm();
  const { showSuccess, showError } = useNotification();

  // 模拟数据
  const mockEntities: MetadataEntity[] = [
    {
      id: 'db_ecommerce',
      name: 'ecommerce',
      type: 'database',
      description: '电商系统核心数据库，包含用户、订单、商品等核心业务数据',
      tags: ['核心业务', '生产', 'MySQL'],
      owner: '数据架构师',
      classification: '内部',
      businessTerms: ['电商', '业务系统'],
      technicalSpecs: {},
      lineage: { upstream: [], downstream: ['analytics_db'] },
      quality: { completeness: 98, accuracy: 96, consistency: 97 },
      usage: { accessCount: 15420, lastAccessed: '2024-09-04 10:30:00', popularQueries: [] },
      lastUpdated: '2024-09-01',
      createdAt: '2023-01-15',
      path: 'ecommerce',
      children: [
        {
          id: 'table_users',
          name: 'users',
          type: 'table',
          description: '用户基础信息表，存储用户的注册信息和基本资料',
          tags: ['用户', '个人信息', 'PII'],
          owner: '业务开发组',
          classification: '机密',
          businessTerms: ['用户管理', '客户信息'],
          technicalSpecs: {},
          lineage: { upstream: [], downstream: ['user_analytics', 'orders'] },
          quality: { completeness: 99, accuracy: 97, consistency: 98 },
          usage: { accessCount: 8920, lastAccessed: '2024-09-04 09:15:00', popularQueries: ['SELECT * FROM users WHERE status = "active"'] },
          lastUpdated: '2024-08-28',
          createdAt: '2023-01-15',
          path: 'ecommerce.users',
          children: [
            {
              id: 'col_user_id',
              name: 'user_id',
              type: 'column',
              description: '用户唯一标识符，UUID格式',
              tags: ['主键', 'UUID', '标识'],
              owner: '数据架构师',
              classification: '内部',
              businessTerms: ['用户ID'],
              technicalSpecs: {
                dataType: 'VARCHAR',
                length: 36,
                nullable: false,
                primaryKey: true,
                foreignKey: false,
              },
              lineage: { upstream: [], downstream: ['orders.user_id', 'user_profiles.user_id'] },
              quality: { completeness: 100, accuracy: 100, consistency: 100 },
              usage: { accessCount: 15420, lastAccessed: '2024-09-04 10:30:00', popularQueries: [] },
              lastUpdated: '2024-07-15',
              createdAt: '2023-01-15',
              path: 'ecommerce.users.user_id',
            },
            {
              id: 'col_email',
              name: 'email',
              type: 'column',
              description: '用户邮箱地址，用于登录和通知',
              tags: ['邮箱', 'PII', '联系方式'],
              owner: '业务开发组',
              classification: '机密',
              businessTerms: ['电子邮箱'],
              technicalSpecs: {
                dataType: 'VARCHAR',
                length: 255,
                nullable: false,
                primaryKey: false,
                foreignKey: false,
              },
              lineage: { upstream: [], downstream: ['email_logs'] },
              quality: { completeness: 96, accuracy: 94, consistency: 95 },
              usage: { accessCount: 5680, lastAccessed: '2024-09-04 08:45:00', popularQueries: [] },
              lastUpdated: '2024-08-20',
              createdAt: '2023-01-15',
              path: 'ecommerce.users.email',
            },
          ],
        },
        {
          id: 'table_orders',
          name: 'orders',
          type: 'table',
          description: '订单信息表，记录所有订单的详细信息',
          tags: ['订单', '交易', '核心业务'],
          owner: '订单系统组',
          classification: '内部',
          businessTerms: ['订单管理', '交易记录'],
          technicalSpecs: {},
          lineage: { upstream: ['users'], downstream: ['order_analytics', 'financial_reports'] },
          quality: { completeness: 97, accuracy: 95, consistency: 96 },
          usage: { accessCount: 12350, lastAccessed: '2024-09-04 10:00:00', popularQueries: ['SELECT * FROM orders WHERE status = "completed"'] },
          lastUpdated: '2024-09-02',
          createdAt: '2023-01-15',
          path: 'ecommerce.orders',
          children: [
            {
              id: 'col_order_id',
              name: 'order_id',
              type: 'column',
              description: '订单唯一标识符',
              tags: ['主键', '订单ID'],
              owner: '订单系统组',
              classification: '内部',
              businessTerms: ['订单编号'],
              technicalSpecs: {
                dataType: 'VARCHAR',
                length: 32,
                nullable: false,
                primaryKey: true,
                foreignKey: false,
              },
              lineage: { upstream: [], downstream: ['order_items.order_id'] },
              quality: { completeness: 100, accuracy: 100, consistency: 100 },
              usage: { accessCount: 12350, lastAccessed: '2024-09-04 10:00:00', popularQueries: [] },
              lastUpdated: '2024-08-15',
              createdAt: '2023-01-15',
              path: 'ecommerce.orders.order_id',
            },
          ],
        },
      ],
    },
  ];

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setEntities(mockEntities);
      setExpandedKeys(['db_ecommerce']);
    } catch (error) {
      showError('加载元数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEntitySelect = (entity: MetadataEntity) => {
    setSelectedEntity(entity);
    setDetailVisible(true);
  };

  const handleEdit = (entity: MetadataEntity) => {
    setSelectedEntity(entity);
    form.setFieldsValue({
      description: entity.description,
      tags: entity.tags,
      owner: entity.owner,
      classification: entity.classification,
      businessTerms: entity.businessTerms,
    });
    setEditVisible(true);
  };

  const handleUpdate = async (values: any) => {
    try {
      // 模拟更新元数据
      showSuccess('元数据更新成功');
      setEditVisible(false);
      form.resetFields();
    } catch (error) {
      showError('更新失败');
    }
  };

  const renderTreeNode = (entity: MetadataEntity): any => {
    const getIcon = (type: string) => {
      switch (type) {
        case 'database': return <DatabaseOutlined />;
        case 'table': return <TableOutlined />;
        case 'column': return <FieldNumberOutlined />;
        case 'view': return <EyeOutlined />;
        default: return <FileTextOutlined />;
      }
    };

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'database': return 'blue';
        case 'table': return 'green';
        case 'column': return 'orange';
        case 'view': return 'purple';
        default: return 'default';
      }
    };

    return {
      title: (
        <Space>
          {getIcon(entity.type)}
          <Text strong={entity.type === 'database'}>{entity.name}</Text>
          <Tag color={getTypeColor(entity.type)} size="small">
            {entity.type}
          </Tag>
          {entity.classification && (
            <Tag color="red" size="small">
              {entity.classification}
            </Tag>
          )}
        </Space>
      ),
      key: entity.id,
      children: entity.children?.map(renderTreeNode),
      entity,
    };
  };

  const treeData = entities.map(renderTreeNode);

  const filteredEntities = entities.filter(entity => {
    if (filterType !== 'all' && entity.type !== filterType) return false;
    if (searchText && !entity.name.toLowerCase().includes(searchText.toLowerCase()) &&
        !entity.description?.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const flattenEntities = (entities: MetadataEntity[]): MetadataEntity[] => {
    const result: MetadataEntity[] = [];
    const traverse = (items: MetadataEntity[]) => {
      items.forEach(item => {
        result.push(item);
        if (item.children) {
          traverse(item.children);
        }
      });
    };
    traverse(entities);
    return result;
  };

  const allEntities = flattenEntities(entities);

  const renderEntityDetail = () => {
    if (!selectedEntity) return null;

    return (
      <Tabs
        items={[
          {
            key: 'overview',
            label: '概览',
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Card title="基本信息" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text strong>名称：</Text>
                      <Text>{selectedEntity.name}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>类型：</Text>
                      <Tag color="blue">{selectedEntity.type}</Tag>
                    </Col>
                    <Col span={12}>
                      <Text strong>负责人：</Text>
                      <Text>{selectedEntity.owner || '未指定'}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>分类：</Text>
                      <Tag color="red">{selectedEntity.classification || '未分类'}</Tag>
                    </Col>
                    <Col span={24}>
                      <Text strong>描述：</Text>
                      <Paragraph>{selectedEntity.description || '暂无描述'}</Paragraph>
                    </Col>
                  </Row>
                </Card>

                <Card title="标签和业务术语" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>标签：</Text>
                      <div style={{ marginTop: '8px' }}>
                        {selectedEntity.tags.map(tag => (
                          <Tag key={tag} color="blue">{tag}</Tag>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Text strong>业务术语：</Text>
                      <div style={{ marginTop: '8px' }}>
                        {selectedEntity.businessTerms.map(term => (
                          <Tag key={term} color="green">{term}</Tag>
                        ))}
                      </div>
                    </div>
                  </Space>
                </Card>

                {selectedEntity.technicalSpecs.dataType && (
                  <Card title="技术规格" size="small">
                    <Row gutter={[16, 8]}>
                      <Col span={8}>
                        <Text strong>数据类型：</Text>
                        <Text>{selectedEntity.technicalSpecs.dataType}</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>长度：</Text>
                        <Text>{selectedEntity.technicalSpecs.length || 'N/A'}</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>可空：</Text>
                        <Text>{selectedEntity.technicalSpecs.nullable ? '是' : '否'}</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>主键：</Text>
                        <Text>{selectedEntity.technicalSpecs.primaryKey ? '是' : '否'}</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>外键：</Text>
                        <Text>{selectedEntity.technicalSpecs.foreignKey ? '是' : '否'}</Text>
                      </Col>
                    </Row>
                  </Card>
                )}
              </Space>
            ),
          },
          {
            key: 'quality',
            label: '质量指标',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="完整性"
                      value={selectedEntity.quality.completeness}
                      suffix="%"
                      valueStyle={{ color: selectedEntity.quality.completeness > 95 ? '#3f8600' : '#cf1322' }}
                    />
                    <Progress percent={selectedEntity.quality.completeness} showInfo={false} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="准确性"
                      value={selectedEntity.quality.accuracy}
                      suffix="%"
                      valueStyle={{ color: selectedEntity.quality.accuracy > 95 ? '#3f8600' : '#cf1322' }}
                    />
                    <Progress percent={selectedEntity.quality.accuracy} showInfo={false} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="一致性"
                      value={selectedEntity.quality.consistency}
                      suffix="%"
                      valueStyle={{ color: selectedEntity.quality.consistency > 95 ? '#3f8600' : '#cf1322' }}
                    />
                    <Progress percent={selectedEntity.quality.consistency} showInfo={false} />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'lineage',
            label: '血缘关系',
            children: (
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="上游依赖" size="small">
                    {selectedEntity.lineage.upstream.length > 0 ? (
                      <List
                        size="small"
                        dataSource={selectedEntity.lineage.upstream}
                        renderItem={item => (
                          <List.Item>
                            <Space>
                              <DatabaseOutlined />
                              <Text>{item}</Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="无上游依赖" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="下游消费者" size="small">
                    {selectedEntity.lineage.downstream.length > 0 ? (
                      <List
                        size="small"
                        dataSource={selectedEntity.lineage.downstream}
                        renderItem={item => (
                          <List.Item>
                            <Space>
                              <DatabaseOutlined />
                              <Text>{item}</Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="无下游消费者" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'usage',
            label: '使用统计',
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="访问次数"
                        value={selectedEntity.usage.accessCount}
                        prefix={<EyeOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="最后访问"
                        value={selectedEntity.usage.lastAccessed || '未知'}
                        prefix={<ClockCircleOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>
                {selectedEntity.usage.popularQueries.length > 0 && (
                  <Card title="热门查询" size="small">
                    <List
                      size="small"
                      dataSource={selectedEntity.usage.popularQueries}
                      renderItem={query => (
                        <List.Item>
                          <Text code style={{ fontSize: '12px' }}>{query}</Text>
                        </List.Item>
                      )}
                    />
                  </Card>
                )}
              </Space>
            ),
          },
        ]}
      />
    );
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <DatabaseOutlined /> 元数据管理
          </Title>
          <Text type="secondary">
            统一管理数据资产的元数据信息，包括技术和业务属性
          </Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<SyncOutlined />}>同步元数据</Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="元数据树" size="small">
            <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
              <Search
                placeholder="搜索元数据..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
              <Select
                placeholder="筛选类型"
                value={filterType}
                onChange={setFilterType}
                style={{ width: '100%' }}
              >
                <Select.Option value="all">全部</Select.Option>
                <Select.Option value="database">数据库</Select.Option>
                <Select.Option value="table">表</Select.Option>
                <Select.Option value="column">字段</Select.Option>
                <Select.Option value="view">视图</Select.Option>
              </Select>
            </Space>
            
            <Tree
              treeData={treeData}
              expandedKeys={expandedKeys}
              onExpand={setExpandedKeys}
              onSelect={(selectedKeys, info) => {
                if (info.node.entity) {
                  handleEntitySelect(info.node.entity);
                }
              }}
              style={{ maxHeight: '600px', overflow: 'auto' }}
            />
          </Card>
        </Col>

        <Col span={16}>
          <Card 
            title={
              selectedEntity ? (
                <Space>
                  <DatabaseOutlined />
                  {selectedEntity.name}
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEdit(selectedEntity)}
                  >
                    编辑
                  </Button>
                </Space>
              ) : '元数据详情'
            }
            size="small"
          >
            {selectedEntity ? (
              renderEntityDetail()
            ) : (
              <Empty
                description="请从左侧选择要查看的元数据实体"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Drawer
        title="编辑元数据"
        open={editVisible}
        onClose={() => setEditVisible(false)}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item label="描述" name="description">
            <TextArea rows={4} placeholder="输入详细描述..." />
          </Form.Item>

          <Form.Item label="标签" name="tags">
            <Select
              mode="tags"
              placeholder="添加标签"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="负责人" name="owner">
            <Input placeholder="输入负责人" />
          </Form.Item>

          <Form.Item label="分类" name="classification">
            <Select placeholder="选择分类">
              <Select.Option value="公开">公开</Select.Option>
              <Select.Option value="内部">内部</Select.Option>
              <Select.Option value="机密">机密</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="业务术语" name="businessTerms">
            <Select
              mode="tags"
              placeholder="添加业务术语"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default MetadataManagement;
