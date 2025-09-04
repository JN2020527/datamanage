import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface QualityTrendData {
  date: string;
  score: number;
}

interface QualityTrendChartProps {
  data: QualityTrendData[];
  height?: number;
}

const QualityTrendChart: React.FC<QualityTrendChartProps> = ({
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
        text: '质量趋势',
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
          return `${point.axisValue}<br/>${point.seriesName}: ${point.value}分`;
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
          min: 80,
          max: 100,
          axisLabel: {
            fontSize: 12,
            color: '#666',
            formatter: '{value}分',
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
          name: '质量评分',
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#52C41A',
          },
          itemStyle: {
            color: '#52C41A',
            borderColor: '#fff',
            borderWidth: 2,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(82, 196, 26, 0.5)',
            },
          },
          markLine: {
            silent: true,
            lineStyle: {
              color: '#FAAD14',
              type: 'dashed',
            },
            data: [
              {
                yAxis: 90,
                name: '优秀线',
                label: {
                  position: 'start',
                  formatter: '优秀线 (90分)',
                },
              },
            ],
          },
          data: data.map(item => item.score),
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

export default QualityTrendChart;
