import React, { useMemo } from 'react';
import { Card } from 'antd';
import ReactECharts from 'echarts-for-react';
import { DotChartOutlined } from '@ant-design/icons';

interface UsageHeatmapData {
  hour: number;
  day: number;
  value: number;
}

interface EChartsUsageHeatmapProps {
  data: UsageHeatmapData[];
  height?: number;
  title?: string;
}

const EChartsUsageHeatmap: React.FC<EChartsUsageHeatmapProps> = ({
  data = [],
  height = 300,
  title = "使用热力图"
}) => {
  const option = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    // 生成模拟数据或使用传入的数据
    const heatmapData = data.length > 0 ? 
      data.map(item => [item.hour, item.day, item.value]) :
      Array.from({ length: 24 * 7 }, (_, i) => {
        const hour = i % 24;
        const day = Math.floor(i / 24);
        // 模拟工作时间有更多访问量
        const baseValue = Math.random() * 50;
        const workHourBonus = (hour >= 9 && hour <= 18 && day < 5) ? 30 : 0;
        const weekendPenalty = day >= 5 ? -20 : 0;
        return [hour, day, Math.max(0, Math.floor(baseValue + workHourBonus + weekendPenalty))];
      });

    const maxValue = Math.max(...heatmapData.map(item => item[2]));

    return {
      tooltip: {
        position: 'top',
        formatter: function (params: any) {
          const [hour, day, value] = params.data;
          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">
                ${days[day]} ${hours[hour]}
              </div>
              <div style="color: #666; font-size: 12px;">
                访问量: ${value}
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
      grid: {
        height: '70%',
        top: '15%',
        left: '10%',
        right: '10%'
      },
      xAxis: {
        type: 'category',
        data: hours,
        splitArea: {
          show: true
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#666',
          fontSize: 10,
          interval: 3 // 每4小时显示一次标签
        }
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: {
          show: true
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#666',
          fontSize: 11
        }
      },
      visualMap: {
        min: 0,
        max: maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        textStyle: {
          color: '#666',
          fontSize: 10
        },
        inRange: {
          color: [
            '#E8F5E8', // 浅绿
            '#C6E48B', // 淡绿
            '#7BC96F', // 中绿
            '#239A3B', // 深绿
            '#196127'  // 最深绿
          ]
        }
      },
      series: [
        {
          name: '访问量',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          progressive: 1000,
          animation: true,
          animationDuration: 1000,
          animationEasing: 'cubicInOut'
        }
      ]
    };
  }, [data]);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DotChartOutlined style={{ color: '#1677FF' }} />
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

export default EChartsUsageHeatmap; 