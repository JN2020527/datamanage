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
import type { Asset, Field } from '@/types/index';
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
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ marginRight: '20px' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: typeInfo.gradient || `linear-gradient(135deg, ${typeInfo.color}20, ${typeInfo.color}60)`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${typeInfo.shadowColor || typeInfo.color + '30'}`,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 20px ${typeInfo.shadowColor?.replace('0.2', '0.3') || typeInfo.color + '40'}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${typeInfo.shadowColor || typeInfo.color + '20'}`;
                  }}
                >
                  <div
                    style={{
                      color: '#ffffff',
                      fontSize: '28px',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {React.createElement(typeInfo.icon)}
                  </div>
                  <div
                    style={{
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '500',
                      textAlign: 'center',
                      opacity: 0.9
                    }}
                  >
                    {typeInfo.text}
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <Title level={2} className={styles.assetTitle} style={{ marginBottom: '8px' }}>
                  {asset.englishName || asset.name}
                </Title>
                {asset.englishName && (
                  <div style={{ color: '#666', fontSize: '16px', marginBottom: '8px' }}>
                    {asset.name}
                  </div>
                )}
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

      {/* 内容区域：全宽布局 */}
      <Row gutter={[24, 24]} className={styles.contentRow}>
        {/* 全宽：表概述、字段信息、血缘信息、数据预览 Tab */}
        <Col span={24} className={styles.leftPanel}>
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
                        <Descriptions column={3} size="small">
                          <Descriptions.Item label="资产名称">
                            <div>
                              <div style={{ fontWeight: 'bold' }}>
                                {asset.englishName || asset.name}
                              </div>
                              {asset.englishName && (
                                <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>
                                  {asset.name}
                                </div>
                              )}
                            </div>
                          </Descriptions.Item>
                          <Descriptions.Item label="资产类型">{typeInfo.text}</Descriptions.Item>
                          <Descriptions.Item label="环境">开发环境</Descriptions.Item>
                          <Descriptions.Item label="负责人">
                            <Space>
                              {asset.owner}
                              <Button type="link" size="small" style={{ padding: 0, fontSize: '12px' }}>
                                转交
                              </Button>
                            </Space>
                          </Descriptions.Item>
                          <Descriptions.Item label="所属部门">{asset.department}</Descriptions.Item>
                          <Descriptions.Item label="表类型">物理表</Descriptions.Item>
                          <Descriptions.Item label="创建时间">
                            {new Date(asset.createdAt).toLocaleString()}
                          </Descriptions.Item>
                          <Descriptions.Item label="更新时间">
                            {new Date(asset.updatedAt).toLocaleString()}
                          </Descriptions.Item>
                          <Descriptions.Item label="DDL变更时间">
                            {new Date(asset.createdAt).toLocaleString()}
                          </Descriptions.Item>
                          <Descriptions.Item label="创建人">{asset.owner}</Descriptions.Item>
                          <Descriptions.Item label="最近访问">{getRelativeTime(asset.updatedAt)}</Descriptions.Item>
                          <Descriptions.Item label="访问次数">{formatNumber(asset.accessCount)}</Descriptions.Item>
                          <Descriptions.Item label="产出任务">
                            <Button type="link" size="small" style={{ padding: 0, fontSize: '12px' }}>
                              dim_sku_properties(LD_dummy_...)
                            </Button>
                          </Descriptions.Item>
                          <Descriptions.Item label="收藏数">0</Descriptions.Item>
                          <Descriptions.Item label="浏览量">{formatNumber(asset.accessCount)}</Descriptions.Item>
                        </Descriptions>
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
      </Row>
    </div>
  );
};

export default AssetDetailPage;
