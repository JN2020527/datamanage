import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Typography,
  Card,
  Tabs,
  Tag,
  Button,
  Space,
  Avatar,
  Rate,
  Statistic,
  Descriptions,
  Timeline,
  List,
  Input,
  Form,
  message,
  Spin,
  Divider,
} from 'antd';
import {
  StarOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  PartitionOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import FieldTable from '@components/Assets/FieldTable';
import CommentItem from '@components/Common/CommentItem';
import { api } from '@mock/api';
import { useNotification } from '@hooks/useNotification';
import { getAssetTypeInfo, getQualityInfo, getRelativeTime, formatNumber } from '@utils/index';
import type { Asset, Field } from '@types/index';
import styles from '@styles/AssetDetailPage.module.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm] = Form.useForm();

  useEffect(() => {
    if (id) {
      loadAssetDetail(id);
    }
  }, [id]);

  const loadAssetDetail = async (assetId: string) => {
    try {
      const { data } = await api.getAssetDetail(assetId);
      setAsset(data);
      setFields(data.fields || []);
    } catch (error) {
      console.error('加载资产详情失败:', error);
      showError('加载资产详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (asset) {
      navigate(`/development?edit=${asset.id}`);
    }
  };

  const handleCommentSubmit = (values: { comment: string }) => {
    console.log('提交评论:', values);
    commentForm.resetFields();
    showSuccess('评论发布成功');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!asset) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Title level={3}>资产不存在</Title>
        <Button type="primary" onClick={() => navigate('/discovery')}>
          返回资产发现
        </Button>
      </div>
    );
  }

  const typeInfo = getAssetTypeInfo(asset.type);
  const qualityInfo = getQualityInfo(asset.qualityScore);

  // 模拟评论数据
  const comments = [
    {
      id: '1',
      author: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
      content: '这个数据表的质量很高，字段定义清晰，非常有用！',
      datetime: '2024-01-15T14:30:00Z',
    },
    {
      id: '2',
      author: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
      content: '建议增加更多的约束条件，提高数据质量。',
      datetime: '2024-01-14T10:20:00Z',
    },
  ];

  return (
    <div className={`page-container ${styles.assetDetailPage}`}>
      {/* 上部区域：表名称、描述、标签和操作按钮 */}
      <Card className={styles.headerCard}>
        <Row gutter={[24, 24]} align="middle">
          <Col flex="auto">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div
                className={styles.assetIcon}
                style={{ color: typeInfo.color }}
              >
                <typeInfo.icon />
              </div>
              <div>
                <Title level={2} className={styles.assetTitle}>
                  {asset.name}
                </Title>
                <Space>
                  <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
                  <Tag color={qualityInfo.color}>
                    {qualityInfo.text} {asset.qualityScore}分
                  </Tag>
                </Space>
                <div className={styles.assetId}>
                  ID: {asset.id}
                </div>
              </div>
            </div>

            <Paragraph className={styles.assetDescription}>
              {asset.description}
            </Paragraph>

            <Space wrap>
              {asset.tags.map((tag, index) => (
                <Tag key={index} style={{ marginBottom: '4px' }}>
                  {tag}
                </Tag>
              ))}
            </Space>
          </Col>

          <Col flex="200px">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="large"
              block
              onClick={handleEdit}
            >
              编辑资产
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 内容区域：左右布局 */}
      <Row gutter={[24, 24]} className={styles.contentRow}>
        {/* 左侧：表概述、字段信息、血缘信息、数据预览 Tab */}
        <Col xs={24} lg={18} xl={19} className={styles.leftPanel}>
          <Card className={styles.leftCard}>
            <Tabs 
              defaultActiveKey="overview" 
              size="large"
              items={[
                {
                  key: 'overview',
                  label: (
                    <span>
                      <FileTextOutlined style={{ marginRight: '8px' }} />
                      表概述
                    </span>
                  ),
                  children: (
                    <div>
                      <Card title="基本信息" size="small" style={{ marginBottom: '16px' }}>
                        <Descriptions column={2} size="small">
                          <Descriptions.Item label="资产名称">{asset.name}</Descriptions.Item>
                          <Descriptions.Item label="资产类型">{typeInfo.text}</Descriptions.Item>
                          <Descriptions.Item label="负责人">{asset.owner}</Descriptions.Item>
                          <Descriptions.Item label="所属部门">{asset.department}</Descriptions.Item>
                          <Descriptions.Item label="创建时间">
                            {new Date(asset.createdAt).toLocaleString()}
                          </Descriptions.Item>
                          <Descriptions.Item label="更新时间">
                            {new Date(asset.updatedAt).toLocaleString()}
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                      
                      <Card title="质量评估" size="small" className={styles.qualityCard}>
                        <div className={styles.qualityScore} style={{ color: qualityInfo.color }}>
                          {asset.qualityScore}
                        </div>
                        <div className={styles.qualityLabel}>质量评分</div>
                        <Rate
                          disabled
                          allowHalf
                          value={asset.qualityScore / 20}
                          className={styles.qualityRate}
                        />
                        <div>
                          <Tag color={qualityInfo.color} className={styles.qualityTag}>
                            {qualityInfo.text}
                          </Tag>
                        </div>
                      </Card>
                    </div>
                  ),
                },
                {
                  key: 'fields',
                  label: (
                    <span>
                      <UnorderedListOutlined style={{ marginRight: '8px' }} />
                      字段信息
                    </span>
                  ),
                  children: <FieldTable fields={fields} />,
                },
                {
                  key: 'lineage',
                  label: (
                    <span>
                      <PartitionOutlined style={{ marginRight: '8px' }} />
                      血缘信息
                    </span>
                  ),
                  children: (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                      <Title level={4}>血缘关系图谱</Title>
                      <Text type="secondary">血缘关系可视化功能开发中...</Text>
                    </div>
                  ),
                },
                {
                  key: 'preview',
                  label: (
                    <span>
                      <DatabaseOutlined style={{ marginRight: '8px' }} />
                      数据预览
                    </span>
                  ),
                  children: (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                      <Title level={4}>数据预览</Title>
                      <Text type="secondary">数据预览功能开发中...</Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 右侧：资产信息 */}
        <Col xs={24} lg={6} xl={5} className={styles.rightPanel}>
          <Card title="资产信息" className={styles.rightCard}>
            {/* 基础信息 */}
            <div className={styles.infoSection}>
              <Title level={5} style={{ color: '#1890ff', marginBottom: '16px' }}>基础信息</Title>
              <Descriptions column={1} size="small" colon={false}>
                <Descriptions.Item label="环境">开发环境</Descriptions.Item>
                <Descriptions.Item label="表类型">物理表</Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(asset.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="创建人">{asset.owner}</Descriptions.Item>
                <Descriptions.Item label="负责人">
                  <Space>
                    {asset.owner}
                    <Button type="link" size="small" style={{ padding: 0, fontSize: '12px' }}>
                      转交
                    </Button>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="产出任务">
                  <Button type="link" size="small" style={{ padding: 0, fontSize: '12px' }}>
                    dim_sku_properties(LD_dummy_...)
                  </Button>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider style={{ margin: '20px 0' }} />

            {/* 变更信息 */}
            <div className={styles.infoSection}>
              <Title level={5} style={{ color: '#1890ff', marginBottom: '16px' }}>变更信息</Title>
              <Descriptions column={1} size="small" colon={false}>
                <Descriptions.Item 
                  label={
                    <Space>
                      数据变更
                      <Button type="text" size="small" style={{ padding: 0, fontSize: '12px', color: '#8c8c8c' }}>
                        ⓘ
                      </Button>
                    </Space>
                  }
                >
                  {new Date(asset.updatedAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={
                    <Space>
                      最近访问
                      <Button type="text" size="small" style={{ padding: 0, fontSize: '12px', color: '#8c8c8c' }}>
                        ⓘ
                      </Button>
                    </Space>
                  }
                >
                  {getRelativeTime(asset.updatedAt)}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={
                    <Space>
                      DDL变更
                      <Button type="text" size="small" style={{ padding: 0, fontSize: '12px', color: '#8c8c8c' }}>
                        ⓘ
                      </Button>
                    </Space>
                  }
                >
                  {new Date(asset.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider style={{ margin: '20px 0' }} />

            {/* 使用信息 */}
            <div className={styles.infoSection}>
              <Title level={5} style={{ color: '#1890ff', marginBottom: '16px' }}>使用信息</Title>
              <Descriptions column={1} size="small" colon={false}>
                <Descriptions.Item label="收藏数">0</Descriptions.Item>
                <Descriptions.Item 
                  label={
                    <Space>
                      浏览量
                      <Button type="text" size="small" style={{ padding: 0, fontSize: '12px', color: '#8c8c8c' }}>
                        ⓘ
                      </Button>
                    </Space>
                  }
                >
                  {formatNumber(asset.accessCount)}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={
                    <Space>
                      访问次数
                      <Button type="text" size="small" style={{ padding: 0, fontSize: '12px', color: '#8c8c8c' }}>
                        ⓘ
                      </Button>
                    </Space>
                  }
                >
                  0
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AssetDetailPage;
