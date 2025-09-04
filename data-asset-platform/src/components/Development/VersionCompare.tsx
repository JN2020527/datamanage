import React, { useState, useEffect } from 'react';
import {
  Card,
  Timeline,
  Button,
  Space,
  Tag,
  Drawer,
  Descriptions,
  Table,
  Typography,
  Row,
  Col,
  Tabs,
  Divider,
  Alert,
} from 'antd';
import {
  HistoryOutlined,
  DiffOutlined,
  EyeOutlined,
  RollbackOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { getRelativeTime } from '@utils/index';

const { Text, Title } = Typography;

interface Version {
  id: string;
  version: string;
  description: string;
  author: string;
  timestamp: string;
  changes: {
    type: 'add' | 'modify' | 'delete';
    field: string;
    oldValue?: any;
    newValue?: any;
    description: string;
  }[];
  status: 'current' | 'published' | 'draft';
}

interface VersionCompareProps {
  assetId: string;
  onRestore?: (versionId: string) => void;
}

const VersionCompare: React.FC<VersionCompareProps> = ({ assetId, onRestore }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [compareVisible, setCompareVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // 模拟版本数据
  const mockVersions: Version[] = [
    {
      id: '1',
      version: 'v3.2.1',
      description: '添加新字段：用户等级和积分',
      author: '张三',
      timestamp: '2024-01-20T10:30:00Z',
      status: 'current',
      changes: [
        {
          type: 'add',
          field: 'user_level',
          newValue: { type: 'string', description: '用户等级' },
          description: '新增用户等级字段',
        },
        {
          type: 'add',
          field: 'points',
          newValue: { type: 'number', description: '用户积分' },
          description: '新增用户积分字段',
        },
      ],
    },
    {
      id: '2',
      version: 'v3.2.0',
      description: '修改用户年龄字段类型，优化性能',
      author: '李四',
      timestamp: '2024-01-18T14:20:00Z',
      status: 'published',
      changes: [
        {
          type: 'modify',
          field: 'age',
          oldValue: { type: 'string', description: '用户年龄' },
          newValue: { type: 'number', description: '用户年龄（数字）' },
          description: '修改年龄字段类型从字符串改为数字',
        },
        {
          type: 'modify',
          field: 'description',
          oldValue: '用户基础信息表',
          newValue: '用户基础信息表（优化版）',
          description: '更新资产描述',
        },
      ],
    },
    {
      id: '3',
      version: 'v3.1.5',
      description: '删除废弃字段，清理数据结构',
      author: '王五',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'published',
      changes: [
        {
          type: 'delete',
          field: 'old_field',
          oldValue: { type: 'string', description: '废弃字段' },
          description: '删除不再使用的废弃字段',
        },
        {
          type: 'modify',
          field: 'email',
          oldValue: { type: 'string', description: '邮箱', nullable: true },
          newValue: { type: 'string', description: '邮箱地址', nullable: false },
          description: '邮箱字段改为必填',
        },
      ],
    },
    {
      id: '4',
      version: 'v3.1.0',
      description: '初始版本创建',
      author: '系统管理员',
      timestamp: '2024-01-10T08:00:00Z',
      status: 'published',
      changes: [
        {
          type: 'add',
          field: '基础结构',
          newValue: '创建用户信息表基础结构',
          description: '创建资产初始版本',
        },
      ],
    },
  ];

  useEffect(() => {
    setVersions(mockVersions);
  }, [assetId]);

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      setCompareVisible(true);
    }
  };

  const handleSelectVersion = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    } else {
      setSelectedVersions([selectedVersions[1], versionId]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'green';
      case 'published': return 'blue';
      case 'draft': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'current': return '当前版本';
      case 'published': return '已发布';
      case 'draft': return '草稿';
      default: return status;
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'add': return 'green';
      case 'modify': return 'blue';
      case 'delete': return 'red';
      default: return 'default';
    }
  };

  const getChangeTypeText = (type: string) => {
    switch (type) {
      case 'add': return '新增';
      case 'modify': return '修改';
      case 'delete': return '删除';
      default: return type;
    }
  };

  const renderCompareContent = () => {
    if (selectedVersions.length !== 2) return null;

    const version1 = versions.find(v => v.id === selectedVersions[0]);
    const version2 = versions.find(v => v.id === selectedVersions[1]);

    if (!version1 || !version2) return null;

    return (
      <div>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card 
              title={`版本 ${version1.version}`}
              extra={<Tag color={getStatusColor(version1.status)}>{getStatusText(version1.status)}</Tag>}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="作者">{version1.author}</Descriptions.Item>
                <Descriptions.Item label="时间">{getRelativeTime(version1.timestamp)}</Descriptions.Item>
                <Descriptions.Item label="描述">{version1.description}</Descriptions.Item>
              </Descriptions>
              
              <Divider orientation="left">变更详情</Divider>
              {version1.changes.map((change, index) => (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <Space>
                    <Tag color={getChangeTypeColor(change.type)}>
                      {getChangeTypeText(change.type)}
                    </Tag>
                    <Text strong>{change.field}</Text>
                  </Space>
                  <div style={{ marginTop: '4px', color: '#666' }}>
                    {change.description}
                  </div>
                </div>
              ))}
            </Card>
          </Col>
          
          <Col span={12}>
            <Card 
              title={`版本 ${version2.version}`}
              extra={<Tag color={getStatusColor(version2.status)}>{getStatusText(version2.status)}</Tag>}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="作者">{version2.author}</Descriptions.Item>
                <Descriptions.Item label="时间">{getRelativeTime(version2.timestamp)}</Descriptions.Item>
                <Descriptions.Item label="描述">{version2.description}</Descriptions.Item>
              </Descriptions>
              
              <Divider orientation="left">变更详情</Divider>
              {version2.changes.map((change, index) => (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <Space>
                    <Tag color={getChangeTypeColor(change.type)}>
                      {getChangeTypeText(change.type)}
                    </Tag>
                    <Text strong>{change.field}</Text>
                  </Space>
                  <div style={{ marginTop: '4px', color: '#666' }}>
                    {change.description}
                  </div>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Card
      title={
        <Space>
          <HistoryOutlined />
          版本历史
        </Space>
      }
      extra={
        <Space>
          {selectedVersions.length === 2 && (
            <Button
              type="primary"
              icon={<DiffOutlined />}
              onClick={handleCompareVersions}
            >
              对比版本
            </Button>
          )}
        </Space>
      }
    >
      {selectedVersions.length > 0 && (
        <Alert
          message={`已选择 ${selectedVersions.length} 个版本${selectedVersions.length === 2 ? '，可以进行对比' : '，请再选择一个版本进行对比'}`}
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Timeline mode="left">
        {versions.map((version) => (
          <Timeline.Item
            key={version.id}
            color={version.status === 'current' ? 'green' : 'blue'}
            label={
              <div style={{ textAlign: 'right', width: '120px' }}>
                <div>{getRelativeTime(version.timestamp)}</div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {version.author}
                </Text>
              </div>
            }
          >
            <Card
              size="small"
              style={{
                border: selectedVersions.includes(version.id) ? '2px solid #1890ff' : undefined,
                cursor: 'pointer',
              }}
              onClick={() => handleSelectVersion(version.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Space>
                  <Text strong>{version.version}</Text>
                  <Tag color={getStatusColor(version.status)}>
                    {getStatusText(version.status)}
                  </Tag>
                </Space>
                <Space>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    size="small"
                  >
                    查看
                  </Button>
                  {version.status !== 'current' && onRestore && (
                    <Button
                      type="text"
                      icon={<RollbackOutlined />}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestore(version.id);
                      }}
                    >
                      恢复
                    </Button>
                  )}
                </Space>
              </div>
              
              <Text>{version.description}</Text>
              
              <div style={{ marginTop: '8px' }}>
                <Space wrap>
                  {version.changes.map((change, index) => (
                    <Tag
                      key={index}
                      color={getChangeTypeColor(change.type)}
                      size="small"
                    >
                      {getChangeTypeText(change.type)} {change.field}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>

      <Drawer
        title="版本对比"
        placement="right"
        width="80%"
        open={compareVisible}
        onClose={() => setCompareVisible(false)}
      >
        {renderCompareContent()}
      </Drawer>
    </Card>
  );
};

export default VersionCompare;
