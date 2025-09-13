import React, { useState, useCallback } from 'react';
import {
  Space,
  Tabs,
  Card,
  Select,
  ColorPicker,
  InputNumber,
  Switch,
  Radio,
  Divider,
  Typography,
  Slider,
  Button,
  Form,
  Tag
} from 'antd';
import {
  BgColorsOutlined,
  FontSizeOutlined,
  BorderOutlined,
  HighlightOutlined,
  SettingOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// 接口定义
interface TableStyleConfig {
  theme: 'default' | 'simple' | 'bordered' | 'striped';
  headerStyle: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    textAlign: 'left' | 'center' | 'right';
  };
  bodyStyle: {
    fontSize: number;
    rowHeight: number;
    alternateRowColor: boolean;
    borderStyle: 'none' | 'horizontal' | 'vertical' | 'all';
  };
  colors: {
    primary: string;
    secondary: string;
    border: string;
    text: string;
  };
}

interface StyleConfigPanelProps {
  style: TableStyleConfig;
  onStyleUpdate: (style: TableStyleConfig) => void;
}

const StyleConfigPanel: React.FC<StyleConfigPanelProps> = ({
  style,
  onStyleUpdate
}) => {
  const [activeTab, setActiveTab] = useState('theme');

  // 预设主题
  const presetThemes = [
    {
      name: 'default',
      label: '默认',
      preview: '#1890ff',
      config: {
        theme: 'default' as const,
        headerStyle: {
          backgroundColor: '#fafafa',
          textColor: '#262626',
          fontSize: 14,
          fontWeight: 'bold' as const,
          textAlign: 'left' as const
        },
        bodyStyle: {
          fontSize: 14,
          rowHeight: 40,
          alternateRowColor: true,
          borderStyle: 'horizontal' as const
        },
        colors: {
          primary: '#1890ff',
          secondary: '#f0f0f0',
          border: '#d9d9d9',
          text: '#262626'
        }
      }
    },
    {
      name: 'simple',
      label: '简洁',
      preview: '#52c41a',
      config: {
        theme: 'simple' as const,
        headerStyle: {
          backgroundColor: '#ffffff',
          textColor: '#262626',
          fontSize: 14,
          fontWeight: 'bold' as const,
          textAlign: 'left' as const
        },
        bodyStyle: {
          fontSize: 14,
          rowHeight: 36,
          alternateRowColor: false,
          borderStyle: 'none' as const
        },
        colors: {
          primary: '#52c41a',
          secondary: '#f6ffed',
          border: '#d9f7be',
          text: '#262626'
        }
      }
    },
    {
      name: 'bordered',
      label: '边框',
      preview: '#722ed1',
      config: {
        theme: 'bordered' as const,
        headerStyle: {
          backgroundColor: '#f0f0f0',
          textColor: '#262626',
          fontSize: 14,
          fontWeight: 'bold' as const,
          textAlign: 'center' as const
        },
        bodyStyle: {
          fontSize: 14,
          rowHeight: 44,
          alternateRowColor: false,
          borderStyle: 'all' as const
        },
        colors: {
          primary: '#722ed1',
          secondary: '#f9f0ff',
          border: '#d3adf7',
          text: '#262626'
        }
      }
    },
    {
      name: 'striped',
      label: '斑马纹',
      preview: '#fa8c16',
      config: {
        theme: 'striped' as const,
        headerStyle: {
          backgroundColor: '#fa8c16',
          textColor: '#ffffff',
          fontSize: 15,
          fontWeight: 'bold' as const,
          textAlign: 'left' as const
        },
        bodyStyle: {
          fontSize: 14,
          rowHeight: 42,
          alternateRowColor: true,
          borderStyle: 'horizontal' as const
        },
        colors: {
          primary: '#fa8c16',
          secondary: '#fff7e6',
          border: '#ffd591',
          text: '#262626'
        }
      }
    }
  ];

  // 处理样式更新
  const handleStyleChange = useCallback((key: keyof TableStyleConfig, value: any) => {
    onStyleUpdate({
      ...style,
      [key]: value
    });
  }, [style, onStyleUpdate]);

  // 处理嵌套样式更新
  const handleNestedStyleChange = useCallback((
    parentKey: keyof TableStyleConfig,
    childKey: string,
    value: any
  ) => {
    onStyleUpdate({
      ...style,
      [parentKey]: {
        ...style[parentKey],
        [childKey]: value
      }
    });
  }, [style, onStyleUpdate]);

  // 应用预设主题
  const handleApplyTheme = useCallback((themeConfig: any) => {
    onStyleUpdate(themeConfig);
  }, [onStyleUpdate]);

  // 渲染主题选择
  const renderThemeConfig = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>预设主题</Text>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {presetThemes.map(theme => (
            <Card
              key={theme.name}
              size="small"
              hoverable
              className={style.theme === theme.name ? 'theme-card-active' : ''}
              onClick={() => handleApplyTheme(theme.config)}
              style={{
                border: style.theme === theme.name ? `2px solid ${theme.preview}` : '1px solid #d9d9d9',
                cursor: 'pointer'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: theme.preview,
                    borderRadius: 4,
                    margin: '0 auto 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 18
                  }}
                >
                  <BgColorsOutlined />
                </div>
                <Text strong>{theme.label}</Text>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Divider />

      <div>
        <Text strong>快速设置</Text>
        <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>斑马纹行</Text>
            <Switch
              checked={style.bodyStyle.alternateRowColor}
              onChange={(checked) => handleNestedStyleChange('bodyStyle', 'alternateRowColor', checked)}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>表格边框</Text>
            <Select
              value={style.bodyStyle.borderStyle}
              onChange={(value) => handleNestedStyleChange('bodyStyle', 'borderStyle', value)}
              style={{ width: 120 }}
              options={[
                { value: 'none', label: '无边框' },
                { value: 'horizontal', label: '水平边框' },
                { value: 'vertical', label: '垂直边框' },
                { value: 'all', label: '全边框' }
              ]}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>行高</Text>
            <InputNumber
              value={style.bodyStyle.rowHeight}
              onChange={(value) => handleNestedStyleChange('bodyStyle', 'rowHeight', value || 40)}
              min={24}
              max={80}
              style={{ width: 120 }}
              addonAfter="px"
            />
          </div>
        </Space>
      </div>
    </Space>
  );

  // 渲染表头配置
  const renderHeaderConfig = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>表头样式</Text>
        <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 12 }}>
          <div>
            <Text>背景色</Text>
            <ColorPicker
              value={style.headerStyle.backgroundColor}
              onChange={(color) => handleNestedStyleChange('headerStyle', 'backgroundColor', color.toHexString())}
              style={{ width: '100%', marginTop: 4 }}
              showText
            />
          </div>

          <div>
            <Text>文字颜色</Text>
            <ColorPicker
              value={style.headerStyle.textColor}
              onChange={(color) => handleNestedStyleChange('headerStyle', 'textColor', color.toHexString())}
              style={{ width: '100%', marginTop: 4 }}
              showText
            />
          </div>

          <div>
            <Text>字体大小</Text>
            <Slider
              value={style.headerStyle.fontSize}
              onChange={(value) => handleNestedStyleChange('headerStyle', 'fontSize', value)}
              min={12}
              max={20}
              marks={{
                12: '12px',
                14: '14px',
                16: '16px',
                18: '18px',
                20: '20px'
              }}
              style={{ marginTop: 4 }}
            />
          </div>

          <div>
            <Text>字体粗细</Text>
            <Radio.Group
              value={style.headerStyle.fontWeight}
              onChange={(e) => handleNestedStyleChange('headerStyle', 'fontWeight', e.target.value)}
              style={{ width: '100%', marginTop: 4 }}
            >
              <Radio.Button value="normal">正常</Radio.Button>
              <Radio.Button value="bold">加粗</Radio.Button>
            </Radio.Group>
          </div>

          <div>
            <Text>文字对齐</Text>
            <Radio.Group
              value={style.headerStyle.textAlign}
              onChange={(e) => handleNestedStyleChange('headerStyle', 'textAlign', e.target.value)}
              style={{ width: '100%', marginTop: 4 }}
            >
              <Radio.Button value="left">左对齐</Radio.Button>
              <Radio.Button value="center">居中</Radio.Button>
              <Radio.Button value="right">右对齐</Radio.Button>
            </Radio.Group>
          </div>
        </Space>
      </div>
    </Space>
  );

  // 渲染表体配置
  const renderBodyConfig = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>表体样式</Text>
        <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 12 }}>
          <div>
            <Text>字体大小</Text>
            <Slider
              value={style.bodyStyle.fontSize}
              onChange={(value) => handleNestedStyleChange('bodyStyle', 'fontSize', value)}
              min={12}
              max={18}
              marks={{
                12: '12px',
                14: '14px',
                16: '16px',
                18: '18px'
              }}
              style={{ marginTop: 4 }}
            />
          </div>

          <div>
            <Text>行高</Text>
            <Slider
              value={style.bodyStyle.rowHeight}
              onChange={(value) => handleNestedStyleChange('bodyStyle', 'rowHeight', value)}
              min={24}
              max={80}
              marks={{
                24: '紧凑',
                40: '标准',
                56: '宽松',
                80: '超宽'
              }}
              style={{ marginTop: 4 }}
            />
          </div>
        </Space>
      </div>

      <Divider />

      <div>
        <Text strong>颜色配置</Text>
        <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 12 }}>
          <div>
            <Text>主色调</Text>
            <ColorPicker
              value={style.colors.primary}
              onChange={(color) => handleNestedStyleChange('colors', 'primary', color.toHexString())}
              style={{ width: '100%', marginTop: 4 }}
              showText
            />
          </div>

          <div>
            <Text>辅助色</Text>
            <ColorPicker
              value={style.colors.secondary}
              onChange={(color) => handleNestedStyleChange('colors', 'secondary', color.toHexString())}
              style={{ width: '100%', marginTop: 4 }}
              showText
            />
          </div>

          <div>
            <Text>边框色</Text>
            <ColorPicker
              value={style.colors.border}
              onChange={(color) => handleNestedStyleChange('colors', 'border', color.toHexString())}
              style={{ width: '100%', marginTop: 4 }}
              showText
            />
          </div>

          <div>
            <Text>文字色</Text>
            <ColorPicker
              value={style.colors.text}
              onChange={(color) => handleNestedStyleChange('colors', 'text', color.toHexString())}
              style={{ width: '100%', marginTop: 4 }}
              showText
            />
          </div>
        </Space>
      </div>
    </Space>
  );

  // 渲染预览
  const renderPreview = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>样式预览</Text>
        <Card style={{ marginTop: 12 }}>
          <div style={{ overflow: 'hidden', borderRadius: 4 }}>
            {/* 表头预览 */}
            <div
              style={{
                backgroundColor: style.headerStyle.backgroundColor,
                color: style.headerStyle.textColor,
                fontSize: style.headerStyle.fontSize,
                fontWeight: style.headerStyle.fontWeight,
                textAlign: style.headerStyle.textAlign,
                padding: '12px 16px',
                borderBottom: `1px solid ${style.colors.border}`,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 16
              }}
            >
              <div>列名1</div>
              <div>列名2</div>
              <div>列名3</div>
            </div>

            {/* 表体预览 */}
            {[0, 1, 2].map(index => (
              <div
                key={index}
                style={{
                  backgroundColor: style.bodyStyle.alternateRowColor && index % 2 === 1 
                    ? style.colors.secondary 
                    : 'transparent',
                  color: style.colors.text,
                  fontSize: style.bodyStyle.fontSize,
                  height: style.bodyStyle.rowHeight,
                  padding: '0 16px',
                  borderBottom: style.bodyStyle.borderStyle === 'horizontal' || style.bodyStyle.borderStyle === 'all'
                    ? `1px solid ${style.colors.border}`
                    : 'none',
                  borderLeft: style.bodyStyle.borderStyle === 'vertical' || style.bodyStyle.borderStyle === 'all'
                    ? `1px solid ${style.colors.border}`
                    : 'none',
                  borderRight: style.bodyStyle.borderStyle === 'vertical' || style.bodyStyle.borderStyle === 'all'
                    ? `1px solid ${style.colors.border}`
                    : 'none',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 16,
                  alignItems: 'center'
                }}
              >
                <div>数据{index + 1}-1</div>
                <div>数据{index + 1}-2</div>
                <div>数据{index + 1}-3</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Text strong>当前配置</Text>
        <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 12 }}>
          <Tag color="blue">主题：{presetThemes.find(t => t.name === style.theme)?.label || '自定义'}</Tag>
          <Tag color="green">边框：{
            style.bodyStyle.borderStyle === 'none' ? '无边框' :
            style.bodyStyle.borderStyle === 'horizontal' ? '水平边框' :
            style.bodyStyle.borderStyle === 'vertical' ? '垂直边框' : '全边框'
          }</Tag>
          <Tag color="orange">行高：{style.bodyStyle.rowHeight}px</Tag>
          <Tag color="purple">斑马纹：{style.bodyStyle.alternateRowColor ? '启用' : '禁用'}</Tag>
        </Space>
      </div>

      <Button 
        type="primary" 
        icon={<EyeOutlined />} 
        block
        onClick={() => {
          // 可以在这里触发全屏预览
          console.log('打开全屏预览');
        }}
      >
        全屏预览
      </Button>
    </Space>
  );

  const tabItems = [
    {
      key: 'theme',
      label: '主题',
      children: renderThemeConfig(),
      icon: <BgColorsOutlined />
    },
    {
      key: 'header',
      label: '表头',
      children: renderHeaderConfig(),
      icon: <FontSizeOutlined />
    },
    {
      key: 'body',
      label: '表体',
      children: renderBodyConfig(),
      icon: <BorderOutlined />
    },
    {
      key: 'preview',
      label: '预览',
      children: renderPreview(),
      icon: <EyeOutlined />
    }
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={tabItems}
      size="small"
      tabBarStyle={{ marginBottom: 16 }}
    />
  );
};

export default StyleConfigPanel; 