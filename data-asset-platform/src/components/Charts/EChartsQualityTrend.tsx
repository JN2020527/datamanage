import React, { useMemo } from 'react';
import { Card } from 'antd';
import ReactECharts from 'echarts-for-react';
import { BarChartOutlined } from '@ant-design/icons';

interface QualityTrendData {
  month: string;
  score: number;
  issues: number;
  fixed: number;
}

interface EChartsQualityTrendProps {
  data: QualityTrendData[];
  height?: number;
  title?: string;
}

const EChartsQualityTrend: React.FC<EChartsQualityTrendProps> = ({
  data = [],
  height = 300,
  title = "数据质量趋势"
}) => {
  const option = useMemo(() => {
    const months = data.map(item => item.month);
    const scores = data.map(item => item.score);
    const issues = data.map(item => item.issues);
    const fixed = data.map(item => item.fixed);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: function (params: any) {
          let result = `<div style="padding: 8px;">`;
          result += `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`;
          params.forEach((param: any) => {
            const unit = param.seriesName === '质量评分' ? '分' : '个';
            result += `
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                ${param.marker}
                <span style="margin-right: 8px;">${param.seriesName}:</span>
                <span style="font-weight: 600;">${param.value}${unit}</span>
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
        data: ['质量评分', '发现问题', '已修复'],
        top: 10,
        left: 'center',
        itemGap: 20,
        textStyle: {
          fontSize: 12,
          color: '#666'
        }
      },
      grid: {
        left: '5%',
        right: '12%',
        bottom: '8%',
        top: '20%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: months,
          axisPointer: {
            type: 'shadow'
          },
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
          name: '数量',
          nameLocation: 'middle',
          nameGap: 35,
          nameTextStyle: {
            color: '#666',
            fontSize: 11
          },
          min: 0,
          position: 'left',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#666',
            fontSize: 11,
            margin: 15
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0',
              type: 'dashed'
            }
          }
        },
        {
          type: 'value',
          name: '评分',
          nameLocation: 'middle',
          nameGap: 35,
          nameTextStyle: {
            color: '#666',
            fontSize: 11
          },
          min: 0,
          max: 100,
          position: 'right',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#666',
            fontSize: 11,
            formatter: '{value}分',
            margin: 15
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: '发现问题',
          type: 'bar',
          stack: 'issues',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#FF6B6B' },
                { offset: 1, color: '#FF4757' }
              ]
            },
            borderRadius: [2, 2, 0, 0]
          },
          data: issues,
          animationDelay: function (idx: number) {
            return idx * 100;
          }
        },
        {
          name: '已修复',
          type: 'bar',
          stack: 'issues',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#52C41A' },
                { offset: 1, color: '#389E0D' }
              ]
            },
            borderRadius: [2, 2, 0, 0]
          },
          data: fixed,
          animationDelay: function (idx: number) {
            return idx * 100 + 50;
          }
        },
        {
          name: '质量评分',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          lineStyle: {
            width: 4,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#1677FF' },
                { offset: 1, color: '#722ED1' }
              ]
            }
          },
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#1677FF',
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 5,
            shadowColor: 'rgba(22, 119, 255, 0.3)'
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              borderWidth: 4,
              shadowBlur: 10,
              shadowColor: 'rgba(22, 119, 255, 0.5)'
            }
          },
          data: scores,
          animationDelay: function (idx: number) {
            return idx * 100 + 200;
          }
        }
      ],
      animationEasing: 'cubicOut'
    };
  }, [data]);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChartOutlined style={{ color: '#1677FF' }} />
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

export default EChartsQualityTrend; 