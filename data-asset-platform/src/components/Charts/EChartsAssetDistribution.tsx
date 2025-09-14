import React, { useMemo } from 'react';
import { Card, Typography } from 'antd';
import ReactECharts from 'echarts-for-react';
import { PieChartOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface AssetDistributionData {
  name: string;
  value: number;
  type: string;
}

interface EChartsAssetDistributionProps {
  data: AssetDistributionData[];
  height?: number;
  title?: string;
}

const EChartsAssetDistribution: React.FC<EChartsAssetDistributionProps> = ({
  data = [],
  height = 300,
  title = "资产分布"
}) => {
  const option = useMemo(() => {
    // 颜色配置
    const colors = [
      '#1677FF', // 蓝色 - 数据表
      '#52C41A', // 绿色 - 数据集
      '#722ED1', // 紫色 - 数据模型
      '#FAAD14', // 橙色 - 报表
      '#13C2C2', // 青色 - 标签
      '#EB2F96', // 粉色 - API
      '#FA8C16', // 橘色
      '#F5222D', // 红色
    ];

    return {
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">
                ${params.marker}${params.name}
              </div>
              <div style="color: #666; font-size: 12px;">
                数量: ${params.value}
              </div>
              <div style="color: #666; font-size: 12px;">
                占比: ${params.percent}%
              </div>
            </div>
          `;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center',
        textStyle: {
          fontSize: 12,
          color: '#666'
        },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 12
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['65%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              formatter: function (params: any) {
                return `${params.name}\n${params.value}`;
              }
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          labelLine: {
            show: false
          },
          data: data.map((item, index) => ({
            ...item,
            itemStyle: {
              color: colors[index % colors.length]
            }
          })),
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function (idx: number) {
            return idx * 100;
          }
        }
      ]
    };
  }, [data, title]);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PieChartOutlined style={{ color: '#1677FF' }} />
          <span>{title}</span>
        </div>
      }
      style={{ height: '100%' }}
      bodyStyle={{ padding: '16px 24px' }}
    >
      <ReactECharts
        option={option}
        style={{ height: height - 60 }}
        opts={{ renderer: 'canvas' }}
      />
    </Card>
  );
};

export default EChartsAssetDistribution; 