import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface AssetDistributionData {
  name: string;
  value: number;
  percentage: number;
}

interface AssetDistributionChartProps {
  data: AssetDistributionData[];
  height?: number;
}

const AssetDistributionChart: React.FC<AssetDistributionChartProps> = ({
  data,
  height = 300,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data?.length) return;

    // 初始化图表
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const option = {
      title: {
        text: '资产类型分布',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 500,
          color: '#333',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
        itemGap: 12,
        textStyle: {
          fontSize: 12,
        },
      },
      series: [
        {
          name: '资产分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map((item, index) => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: [
                '#1677FF',
                '#52C41A',
                '#FAAD14',
                '#F5222D',
                '#722ED1',
                '#13C2C2',
              ][index % 6],
            },
          })),
        },
      ],
    };

    chartInstance.current.setOption(option);

    // 响应式处理
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: `${height}px`,
      }}
    />
  );
};

export default AssetDistributionChart;
