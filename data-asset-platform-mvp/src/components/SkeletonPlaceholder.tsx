import React from 'react';
import { Skeleton, Card, Row, Col } from 'antd';
import '@/styles/globals.less';

export type SkeletonType = 'card' | 'list' | 'table' | 'chart' | 'detail' | 'custom';

interface SkeletonPlaceholderProps {
  /** 骨架屏类型 */
  type?: SkeletonType;
  /** 是否显示为卡片形式 */
  card?: boolean;
  /** 行数（用于list和table类型） */
  rows?: number;
  /** 是否显示头像 */
  avatar?: boolean;
  /** 是否显示标题 */
  title?: boolean;
  /** 段落行数 */
  paragraph?: number | { rows?: number; width?: string | number | Array<string | number> };
  /** 是否激活动画 */
  active?: boolean;
  /** 自定义高度 */
  height?: number | string;
}

const SkeletonPlaceholder: React.FC<SkeletonPlaceholderProps> = ({
  type = 'custom',
  card = false,
  rows = 3,
  avatar = false,
  title = true,
  paragraph = 3,
  active = true,
  height
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 6 }, (_, index) => (
              <Col span={8} key={index}>
                <Card>
                  <Skeleton 
                    active={active}
                    avatar={false}
                    title={{ width: '60%' }}
                    paragraph={{ rows: 2, width: ['100%', '80%'] }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        );

      case 'list':
        return (
          <div>
            {Array.from({ length: rows }, (_, index) => (
              <div key={index} style={{ marginBottom: 24, padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Skeleton 
                  active={active}
                  avatar={{ size: 48, shape: 'circle' }}
                  title={{ width: '40%' }}
                  paragraph={{ rows: 2, width: ['100%', '60%'] }}
                />
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div>
            {/* 表格头部 */}
            <div style={{ marginBottom: 16 }}>
              <Skeleton.Input active={active} style={{ width: 200, height: 32 }} />
              <div style={{ float: 'right' }}>
                <Skeleton.Button active={active} style={{ width: 80, height: 32, marginLeft: 8 }} />
                <Skeleton.Button active={active} style={{ width: 80, height: 32, marginLeft: 8 }} />
              </div>
              <div style={{ clear: 'both' }} />
            </div>
            
            {/* 表格行 */}
            {Array.from({ length: rows }, (_, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                padding: '12px 0', 
                borderBottom: '1px solid #f0f0f0',
                alignItems: 'center'
              }}>
                <Skeleton.Input active={active} style={{ width: '20%', height: 20, marginRight: 16 }} />
                <Skeleton.Input active={active} style={{ width: '25%', height: 20, marginRight: 16 }} />
                <Skeleton.Input active={active} style={{ width: '15%', height: 20, marginRight: 16 }} />
                <Skeleton.Input active={active} style={{ width: '20%', height: 20, marginRight: 16 }} />
                <Skeleton.Button active={active} style={{ width: 60, height: 24 }} />
              </div>
            ))}
          </div>
        );

      case 'chart':
        return (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Skeleton.Input 
              active={active} 
              style={{ 
                width: '100%', 
                height: height || 300,
                borderRadius: 8
              }} 
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 16 }}>
              <Skeleton.Button active={active} style={{ width: 60, height: 20 }} />
              <Skeleton.Button active={active} style={{ width: 60, height: 20 }} />
              <Skeleton.Button active={active} style={{ width: 60, height: 20 }} />
            </div>
          </div>
        );

      case 'detail':
        return (
          <div>
            {/* 标题区域 */}
            <div style={{ marginBottom: 24 }}>
              <Skeleton 
                active={active}
                title={{ width: '50%' }}
                paragraph={false}
              />
            </div>
            
            {/* 描述列表 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              {Array.from({ length: 6 }, (_, index) => (
                <Col span={8} key={index}>
                  <div>
                    <Skeleton.Input active={active} style={{ width: '40%', height: 16, marginBottom: 8 }} />
                    <Skeleton.Input active={active} style={{ width: '80%', height: 20 }} />
                  </div>
                </Col>
              ))}
            </Row>
            
            {/* 内容区域 */}
            <Skeleton 
              active={active}
              avatar={false}
              title={false}
              paragraph={{ rows: 4, width: ['100%', '90%', '80%', '60%'] }}
            />
          </div>
        );

      default:
        return (
          <Skeleton 
            active={active}
            avatar={avatar}
            title={title}
            paragraph={typeof paragraph === 'number' ? { rows: paragraph } : paragraph}
            style={{ height }}
          />
        );
    }
  };

  const skeletonContent = renderSkeleton();

  if (card) {
    return (
      <Card className="app-card">
        {skeletonContent}
      </Card>
    );
  }

  return (
    <div style={{ height }}>
      {skeletonContent}
    </div>
  );
};

export default SkeletonPlaceholder;
