import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface AccessTrendData {
  date: string;
  count: number;
}

interface AccessTrendChartProps {
  data: AccessTrendData[];
  height?: number;
}

const AccessTrendChart: React.FC<AccessTrendChartProps> = ({
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
        text: '访问趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 500,
          color: '#333',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
        formatter: (params: any) => {
          const point = params[0];
          return `${point.axisValue}<br/>${point.seriesName}: ${point.value}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: data.map(item => item.date.substring(5)), // 只显示月-日
          axisLabel: {
            fontSize: 12,
            color: '#666',
          },
          axisLine: {
            lineStyle: {
              color: '#E8E8E8',
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            fontSize: 12,
            color: '#666',
          },
          axisLine: {
            lineStyle: {
              color: '#E8E8E8',
            },
          },
          splitLine: {
            lineStyle: {
              color: '#F0F0F0',
            },
          },
        },
      ],
      series: [
        {
          name: '访问量',
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#1677FF',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(22, 119, 255, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(22, 119, 255, 0.05)',
              },
            ]),
          },
          itemStyle: {
            color: '#1677FF',
            borderColor: '#fff',
            borderWidth: 2,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(22, 119, 255, 0.5)',
            },
          },
          data: data.map(item => item.count),
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

export default AccessTrendChart;
