import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Space,
  Form,
  Input,
  Slider,
  ColorPicker,
  Switch,
  Tabs,
  Divider,
  Typography,
  message,
  Tooltip,
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  DotChartOutlined,
  SaveOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useNotification } from '@hooks/useNotification';

const { Title, Text } = Typography;

interface ChartAnalysisProps {
  data: any[];
  columns: any[];
}

interface ChartConfig {
  type: string;
  xAxis: string;
  yAxis: string[];
  title: string;
  theme: string;
  colors: string[];
  smooth: boolean;
  showDataZoom: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  animation: boolean;
}

const ChartAnalysis: React.FC<ChartAnalysisProps> = ({ data, columns }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(null);
  const [form] = Form.useForm();
  const { showSuccess, showError } = useNotification();

  const [config, setConfig] = useState<ChartConfig>({
    type: 'bar',
    xAxis: '',
    yAxis: [],
    title: '数据分析图表',
    theme: 'light',
    colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
    smooth: false,
    showDataZoom: true,
    showLegend: true,
    showTooltip: true,
    animation: true,
  });

  const chartTypes = [
    { value: 'bar', label: '柱状图', icon: <BarChartOutlined /> },
    { value: 'line', label: '折线图', icon: <LineChartOutlined /> },
    { value: 'area', label: '面积图', icon: <AreaChartOutlined /> },
    { value: 'pie', label: '饼图', icon: <PieChartOutlined /> },
    { value: 'scatter', label: '散点图', icon: <DotChartOutlined /> },
  ];

  const themes = [
    { value: 'light', label: '亮色主题' },
    { value: 'dark', label: '暗色主题' },
    { value: 'vintage', label: '复古主题' },
    { value: 'westeros', label: '权游主题' },
  ];

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current, config.theme);
      setChartInstance(chart);

      const handleResize = () => {
        chart.resize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose();
      };
    }
  }, [config.theme]);

  useEffect(() => {
    if (chartInstance && data.length > 0) {
      updateChart();
    }
  }, [chartInstance, config, data]);

  const updateChart = () => {
    if (!chartInstance || !config.xAxis || config.yAxis.length === 0) return;

    const option = generateChartOption();
    chartInstance.setOption(option, true);
  };

  const generateChartOption = (): EChartsOption => {
    const xAxisData = data.map(item => item[config.xAxis]);
    
    let series: any[] = [];

    if (config.type === 'pie') {
      // 饼图特殊处理
      const pieData = data.map(item => ({
        name: item[config.xAxis],
        value: item[config.yAxis[0]],
      }));
      
      series = [{
        type: 'pie',
        data: pieData,
        radius: ['30%', '70%'],
        center: ['50%', '50%'],
        roseType: 'angle',
        itemStyle: {
          borderRadius: 8,
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      }];
    } else {
      // 其他图表类型
      series = config.yAxis.map((yField, index) => {
        const seriesData = data.map(item => item[yField]);
        
        return {
          name: columns.find(col => col.key === yField)?.name || yField,
          type: config.type === 'area' ? 'line' : config.type,
          data: seriesData,
          smooth: config.type === 'line' && config.smooth,
          areaStyle: config.type === 'area' ? {} : undefined,
          symbolSize: config.type === 'scatter' ? 8 : 4,
          lineStyle: {
            width: 2,
          },
          itemStyle: {
            color: config.colors[index % config.colors.length],
          },
        };
      });
    }

    const option: EChartsOption = {
      title: {
        text: config.title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: config.showTooltip ? {
        trigger: config.type === 'pie' ? 'item' : 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: config.type === 'pie' 
          ? '{b}: {c} ({d}%)'
          : function(params: any) {
              if (Array.isArray(params)) {
                let result = `${params[0].axisValue}<br/>`;
                params.forEach((param: any) => {
                  result += `${param.marker}${param.seriesName}: ${param.value}<br/>`;
                });
                return result;
              }
              return `${params.marker}${params.seriesName}: ${params.value}`;
            },
      } : undefined,
      legend: config.showLegend && config.type !== 'pie' ? {
        top: 'bottom',
        data: config.yAxis.map(yField => 
          columns.find(col => col.key === yField)?.name || yField
        ),
      } : undefined,
      grid: config.type !== 'pie' ? {
        left: '3%',
        right: '4%',
        bottom: config.showLegend ? '15%' : '3%',
        containLabel: true,
      } : undefined,
      xAxis: config.type !== 'pie' ? {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          rotate: xAxisData.length > 10 ? 45 : 0,
        },
        boundaryGap: config.type === 'bar',
      } : undefined,
      yAxis: config.type !== 'pie' ? {
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
          },
        },
      } : undefined,
      dataZoom: config.showDataZoom && config.type !== 'pie' ? [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 20,
        },
      ] : undefined,
      series,
      animation: config.animation,
      color: config.colors,
    };

    return option;
  };

  const handleConfigChange = (key: keyof ChartConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveChart = () => {
    if (!chartInstance) return;

    const base64 = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff',
    });

    const link = document.createElement('a');
    link.download = `chart_${Date.now()}.png`;
    link.href = base64;
    link.click();

    showSuccess('图表已保存到本地');
  };

  const handleFullscreen = () => {
    if (chartRef.current) {
      chartRef.current.requestFullscreen?.();
    }
  };

  const ConfigPanel = () => (
    <Card title="图表配置" size="small">
      <Form form={form} layout="vertical" size="small">
        <Form.Item label="图表类型">
          <Select
            value={config.type}
            onChange={(value) => handleConfigChange('type', value)}
            style={{ width: '100%' }}
          >
            {chartTypes.map(type => (
              <Select.Option key={type.value} value={type.value}>
                <Space>
                  {type.icon}
                  {type.label}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="X轴字段">
          <Select
            value={config.xAxis}
            onChange={(value) => handleConfigChange('xAxis', value)}
            placeholder="选择X轴字段"
            style={{ width: '100%' }}
          >
            {columns.map(col => (
              <Select.Option key={col.key} value={col.key}>
                {col.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Y轴字段">
          <Select
            mode="multiple"
            value={config.yAxis}
            onChange={(value) => handleConfigChange('yAxis', value)}
            placeholder="选择Y轴字段"
            style={{ width: '100%' }}
          >
            {columns.filter(col => col.type === 'number').map(col => (
              <Select.Option key={col.key} value={col.key}>
                {col.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="图表标题">
          <Input
            value={config.title}
            onChange={(e) => handleConfigChange('title', e.target.value)}
            placeholder="输入图表标题"
          />
        </Form.Item>

        <Form.Item label="主题">
          <Select
            value={config.theme}
            onChange={(value) => handleConfigChange('theme', value)}
            style={{ width: '100%' }}
          >
            {themes.map(theme => (
              <Select.Option key={theme.value} value={theme.value}>
                {theme.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Divider />

        <Form.Item label="显示设置">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>显示图例</Text>
              <Switch
                checked={config.showLegend}
                onChange={(checked) => handleConfigChange('showLegend', checked)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>显示提示框</Text>
              <Switch
                checked={config.showTooltip}
                onChange={(checked) => handleConfigChange('showTooltip', checked)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>数据缩放</Text>
              <Switch
                checked={config.showDataZoom}
                onChange={(checked) => handleConfigChange('showDataZoom', checked)}
              />
            </div>
            {config.type === 'line' && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>平滑曲线</Text>
                <Switch
                  checked={config.smooth}
                  onChange={(checked) => handleConfigChange('smooth', checked)}
                />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>动画效果</Text>
              <Switch
                checked={config.animation}
                onChange={(checked) => handleConfigChange('animation', checked)}
              />
            </div>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <Row gutter={[16, 16]}>
      <Col span={18}>
        <Card
          title={
            <Space>
              <BarChartOutlined />
              图表分析
            </Space>
          }
          extra={
            <Space>
              <Tooltip title="保存图表">
                <Button icon={<SaveOutlined />} onClick={handleSaveChart} />
              </Tooltip>
              <Tooltip title="全屏显示">
                <Button icon={<FullscreenOutlined />} onClick={handleFullscreen} />
              </Tooltip>
            </Space>
          }
        >
          <div
            ref={chartRef}
            style={{
              width: '100%',
              height: '500px',
              border: '1px solid #f0f0f0',
              borderRadius: '6px',
            }}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <ConfigPanel />
      </Col>
    </Row>
  );
};

export default ChartAnalysis;
