import React from 'react';
import { Card, Statistic } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    type: 'up' | 'down';
  };
  suffix?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  suffix,
  onClick,
}) => {
  return (
    <Card
      className="stat-card"
      bodyStyle={{ padding: '24px' }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <div
          className="stat-card-icon"
          style={{
            backgroundColor: color,
            marginRight: '16px',
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div className="stat-card-title">{title}</div>
          <Statistic
            value={value}
            suffix={suffix}
            valueStyle={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#262626',
            }}
          />
        </div>
      </div>

      {trend && (
        <div className="stat-card-trend">
          <span
            className={trend.type === 'up' ? 'trend-up' : 'trend-down'}
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {trend.type === 'up' ? (
              <ArrowUpOutlined style={{ marginRight: '4px' }} />
            ) : (
              <ArrowDownOutlined style={{ marginRight: '4px' }} />
            )}
            {Math.abs(trend.value)}%
          </span>
          <span style={{ color: '#8c8c8c', fontSize: '12px', marginLeft: '8px' }}>
            较上周
          </span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
