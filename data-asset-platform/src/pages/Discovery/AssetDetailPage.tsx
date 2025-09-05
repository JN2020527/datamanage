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
} from 'antd';
import {
  StarOutlined,
  EditOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  EyeOutlined,
  HeartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import FieldTable from '@components/Assets/FieldTable';
import CommentItem from '@components/Common/CommentItem';
import { api } from '@mock/api';
import { useNotification } from '@hooks/useNotification';
import { getAssetTypeInfo, getQualityInfo, getRelativeTime, formatNumber } from '@utils/index';
import type { Asset, Field } from '@types/index';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
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

  const handleFavorite = () => {
    setFavorited(!favorited);
    showSuccess(favorited ? '已取消收藏' : '已添加到收藏');
  };

  const handleEdit = () => {
    if (asset) {
      navigate(`/development?edit=${asset.id}`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess('链接已复制到剪贴板');
  };

  const handleDownload = () => {
    showSuccess('数据下载功能开发中...');
  };

  const handleCommentSubmit = (values: { comment: string }) => {
    console.log('提交评论:', values);
    commentForm.resetFields();
    showSuccess('评论发布成功');
  };

  if (loading) {
    return (
      <Spin size="large" tip="加载中..." spinning={true}>
        <div style={{ textAlign: 'center', padding: '100px', minHeight: '400px' }}>
        </div>
      </Spin>
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
    <div className="page-container">
      {/* 面包屑导航 */}
      

      {/* 资产基本信息 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[24, 24]} align="middle">
          <Col flex="auto">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: typeInfo.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: 'white',
                  marginRight: '16px',
                }}
              >
                {typeInfo.icon}
              </div>
              <div>
                <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
                  {asset.name}
                </Title>
                <Space>
                  <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
                  <Tag color={qualityInfo.color}>
                    {qualityInfo.text} {asset.qualityScore}分
                  </Tag>
                </Space>
                <div style={{ marginTop: '8px', color: '#8c8c8c', fontSize: '14px' }}>
                  ID: {asset.id}
                </div>
              </div>
            </div>

            <Paragraph style={{ color: '#595959', fontSize: '16px', lineHeight: '1.6' }}>
              {asset.description}
            </Paragraph>

            <Space wrap>
              {asset.tags?.map((tag, index) => (
                <Tag key={index} style={{ marginBottom: '4px' }}>
                  {tag}
                </Tag>
              )) || []}
            </Space>
          </Col>

          <Col flex="300px">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="large"
                block
                onClick={handleEdit}
              >
                编辑资产
              </Button>
              <Space style={{ width: '100%' }}>
                <Button
                  icon={<HeartOutlined />}
                  onClick={handleFavorite}
                  type={favorited ? 'primary' : 'default'}
                >
                  {favorited ? '已收藏' : '收藏'}
                </Button>
                <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                  分享
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                  下载
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          <Col span={6}>
            <Statistic
              title="负责人"
              value={asset.owner}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="所属部门"
              value={asset.department}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="访问次数"
              value={formatNumber(asset.accessCount)}
              prefix={<EyeOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="最近更新"
              value={getRelativeTime(asset.updatedAt)}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* 详细信息标签页 */}
      <Card>
        <Tabs 
          defaultActiveKey="overview" 
          size="large"
          items={[
            {
              key: 'overview',
              label: '📋 概览',
              children: (
                <Row gutter={[24, 24]}>
                  <Col span={12}>
                    <Card title="基本信息" size="small">
                      <Descriptions column={1} size="small">
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
                  </Col>
                  <Col span={12}>
                    <Card title="质量评估" size="small">
                      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: qualityInfo.color }}>
                          {asset.qualityScore}
                        </div>
                        <div style={{ color: '#8c8c8c' }}>质量评分</div>
                      </div>
                      <Rate
                        disabled
                        allowHalf
                        value={asset.qualityScore / 20}
                        style={{ display: 'block', textAlign: 'center', marginBottom: '16px' }}
                      />
                      <div style={{ textAlign: 'center' }}>
                        <Tag color={qualityInfo.color} style={{ padding: '4px 12px' }}>
                          {qualityInfo.text}
                        </Tag>
                      </div>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'fields',
              label: '🗂️ 字段详情',
              children: <FieldTable fields={fields} />,
            },
            {
              key: 'lineage',
              label: '🔗 血缘关系',
              children: (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <Title level={4}>血缘关系图谱</Title>
                  <Text type="secondary">血缘关系可视化功能开发中...</Text>
                </div>
              ),
            },
            {
              key: 'statistics',
              label: '📊 统计信息',
              children: (
                <>
                  <Row gutter={[24, 24]}>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="总访问量"
                          value={asset.accessCount}
                          prefix={<EyeOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="字段数量"
                          value={fields.length}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="质量评分"
                          value={asset.qualityScore}
                          suffix="分"
                          prefix={<StarOutlined />}
                        />
                      </Card>
                    </Col>
                  </Row>
                  <Card title="访问趋势" style={{ marginTop: '24px' }}>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Text type="secondary">访问趋势图表开发中...</Text>
                    </div>
                  </Card>
                </>
              ),
            },
            {
              key: 'discussion',
              label: '💬 讨论区',
              children: (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <Card title="发表评论" size="small">
                      <Form form={commentForm} onFinish={handleCommentSubmit}>
                        <Form.Item name="comment" rules={[{ required: true, message: '请输入评论内容' }]}>
                          <TextArea
                            rows={4}
                            placeholder="分享你对这个数据资产的看法..."
                            maxLength={500}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                            发表评论
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </div>
                  <div>
                    {comments?.map((item) => (
                      <CommentItem
                        key={item.id}
                        author={item.author}
                        avatar={item.avatar}
                        content={item.content}
                        datetime={getRelativeTime(item.datetime)}
                      />
                    ))}
                  </div>
                </>
              ),
            },
            {
              key: 'history',
              label: '📝 变更历史',
              children: (
                <Timeline>
                  <Timeline.Item color="green">
                    <div>
                      <Text strong>创建资产</Text>
                      <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                        {asset.owner} · {getRelativeTime(asset.createdAt)}
                      </div>
                    </div>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <div>
                      <Text strong>更新描述信息</Text>
                      <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                        {asset.owner} · {getRelativeTime(asset.updatedAt)}
                      </div>
                    </div>
                  </Timeline.Item>
                  <Timeline.Item color="orange">
                    <div>
                      <Text strong>添加标签</Text>
                      <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                        {asset.owner} · 3天前
                      </div>
                    </div>
                  </Timeline.Item>
                </Timeline>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AssetDetailPage;
