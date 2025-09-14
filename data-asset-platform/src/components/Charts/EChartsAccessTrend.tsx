import React, { useMemo } from 'react';
import { Card } from 'antd';
import ReactECharts from 'echarts-for-react';
import { LineChartOutlined } from '@ant-design/icons';

interface AccessTrendData {
  date: string;
  visits: number;
  users: number;
}

interface EChartsAccessTrendProps {
  data: AccessTrendData[];
  height?: number;
  title?: string;
}

const EChartsAccessTrend: React.FC<EChartsAccessTrendProps> = ({
  data = [],
  height = 300,
  title = "访问趋势"
}) => {
  const option = useMemo(() => {
    const dates = data.map(item => item.date);
    const visits = data.map(item => item.visits);
    const users = data.map(item => item.users);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function (params: any) {
          let result = `<div style="padding: 8px;">`;
          result += `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`;
          params.forEach((param: any) => {
            result += `
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                ${param.marker}
                <span style="margin-right: 8px;">${param.seriesName}:</span>
                <span style="font-weight: 600;">${param.value}</span>
              </div>
            `;
          });
          result += `</div>`;
          return result;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        data: ['访问量', '用户数'],
        top: 10,
        right: 20,
        textStyle: {
          fontSize: 12,
          color: '#666'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLine: {
            lineStyle: {
              color: '#e8e8e8'
            }
          },
          axisLabel: {
            color: '#666',
            fontSize: 11
          },
          axisTick: {
            show: false
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#666',
            fontSize: 11
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0',
              type: 'dashed'
            }
          }
        }
      ],
      series: [
        {
          name: '访问量',
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: {
            width: 3,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#1677FF' },
                { offset: 1, color: '#52C41A' }
              ]
            }
          },
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#1677FF',
            borderColor: '#fff',
            borderWidth: 2
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              borderWidth: 4,
              shadowBlur: 10,
              shadowColor: 'rgba(22, 119, 255, 0.3)'
            }
          },
          areaStyle: {
            opacity: 0.1,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#1677FF' },
                { offset: 1, color: 'rgba(22, 119, 255, 0.05)' }
              ]
            }
          },
          data: visits,
          animationDelay: function (idx: number) {
            return idx * 50;
          }
        },
        {
          name: '用户数',
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: {
            width: 3,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#52C41A' },
                { offset: 1, color: '#13C2C2' }
              ]
            }
          },
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#52C41A',
            borderColor: '#fff',
            borderWidth: 2
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              borderWidth: 4,
              shadowBlur: 10,
              shadowColor: 'rgba(82, 196, 26, 0.3)'
            }
          },
          areaStyle: {
            opacity: 0.1,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#52C41A' },
                { offset: 1, color: 'rgba(82, 196, 26, 0.05)' }
              ]
            }
          },
          data: users,
          animationDelay: function (idx: number) {
            return idx * 50 + 100;
          }
        }
      ],
      animationEasing: 'cubicInOut'
    };
  }, [data]);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LineChartOutlined style={{ color: '#1677FF' }} />
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

export default EChartsAccessTrend; 