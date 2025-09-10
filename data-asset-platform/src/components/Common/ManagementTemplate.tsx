import React, { useLayoutEffect, useRef, useState } from 'react';
import { Card, Space, Divider, Badge } from 'antd';
import type { ReactNode } from 'react';
import './ManagementTemplate.css';

type Props = {
  title: ReactNode;
  editing?: boolean;
  headerExtra?: ReactNode;
  children: ReactNode;
  bottomActions?: ReactNode;
};

const ManagementTemplate: React.FC<Props> = ({ title, editing, headerExtra, children, bottomActions }) => {
  const areaRef = useRef<HTMLDivElement>(null);
  const [areaHeight, setAreaHeight] = useState<number>(0);

  useLayoutEffect(() => {
    const compute = () => {
      if (!areaRef.current) return;
      const rect = areaRef.current.getBoundingClientRect();
      const bottomGap = 0;
      const space = Math.max(window.innerHeight - rect.top - bottomGap, 320);
      setAreaHeight(space);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  return (
    <div ref={areaRef} style={{ height: areaHeight || undefined, display: 'flex', flexDirection: 'column' }}>
      <Card
        title={
          <Space>
            {title}
            {editing && (
              <span className="catalog-edit-badge">
                <Badge status="processing" text="编辑中" />
              </span>
            )}
          </Space>
        }
        extra={headerExtra}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <div className="management-scroll-area" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {children}
        </div>
        {bottomActions && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>{bottomActions}</div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ManagementTemplate;


