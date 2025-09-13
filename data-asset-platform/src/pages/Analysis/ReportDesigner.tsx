import React, { useState, useCallback, useMemo } from 'react';
import {
  Layout,
  Card,
  Button,
  Space,
  Typography,
  message,
  Flex
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  DownloadOutlined,
  SettingOutlined,
  TableOutlined,
  ArrowLeftOutlined,
  RedoOutlined,
  UndoOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import DataConfigPanel from '../../components/Analysis/ReportDesigner/DataConfigPanel';
import TablePreviewPanel from '../../components/Analysis/ReportDesigner/TablePreviewPanel';
import StyleConfigPanel from '../../components/Analysis/ReportDesigner/StyleConfigPanel';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

// 设计标记常量
const DESIGN_TOKENS = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)'
  },
  colors: {
    primary: '#1890ff',
    border: '#d9d9d9',
    bg: '#fafafa'
  }
};

// 表关联配置接口
interface TableJoin {
  id: string;
  leftTable: string;
  rightTable: string;
  leftField: string;
  rightField: string;
  joinType: 'inner' | 'left' | 'right' | 'full';
  alias?: string;
}

// 数据表配置接口
interface TableConfig {
  id: string;
  name: string;
  alias: string;
  fields: Array<{
    name: string;
    displayName: string;
    dataType: 'string' | 'number' | 'date' | 'boolean';
  }>;
  isMain?: boolean;
}

// 数据源配置接口
interface DataSourceConfig {
  type: 'database' | 'excel' | 'csv' | 'api' | 'manual';
  connection?: {
    database?: string;
    table?: string;
    query?: string;
  };
  data: any[];
  preview: any[];
  // 多表关联配置
  multiTable?: {
    enabled: boolean;
    tables: TableConfig[];
    joins: TableJoin[];
  };
}

// 字段配置接口
interface FieldConfig {
  name: string;
  displayName: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  visible: boolean;
  width?: number;
  order: number;
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
  format?: string;
  // 多表支持
  tableId?: string;
  tableName?: string;
  fullName?: string; // 如 table1.field1
}

// 筛选条件接口
interface FilterCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | 'like' | 'in';
  value: any;
  logic?: 'and' | 'or';
}

// 样式配置接口
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

// 报表配置接口
interface ReportConfig {
  name: string;
  description: string;
  dataSource: DataSourceConfig;
  fields: FieldConfig[];
  filters: FilterCondition[];
  groupBy: string[];
  orderBy: Array<{ field: string; direction: 'asc' | 'desc' }>;
  style: TableStyleConfig;
  limit?: number;
}

const ReportDesigner: React.FC = () => {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();
  
  // 报表配置状态
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: '新建报表',
    description: '',
    dataSource: {
      type: 'manual',
      data: [],
      preview: []
    },
    fields: [],
    filters: [],
    groupBy: [],
    orderBy: [],
    style: {
      theme: 'default',
      headerStyle: {
        backgroundColor: '#fafafa',
        textColor: '#262626',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'left'
      },
      bodyStyle: {
        fontSize: 14,
        rowHeight: 40,
        alternateRowColor: true,
        borderStyle: 'horizontal'
      },
      colors: {
        primary: '#1890ff',
        secondary: '#f0f0f0',
        border: '#d9d9d9',
        text: '#262626'
      }
    }
  });

  // 操作历史状态
  const [history, setHistory] = useState<ReportConfig[]>([reportConfig]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 处理配置更新
  const handleConfigUpdate = useCallback((newConfig: Partial<ReportConfig>) => {
    setReportConfig(prev => {
      const updated = { ...prev, ...newConfig };
      
      // 添加到历史记录
      setHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        newHistory.push(updated);
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
      setHasUnsavedChanges(true);
      
      return updated;
    });
  }, [historyIndex]);

  // 撤销操作
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setReportConfig(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // 重做操作
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setReportConfig(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // 保存报表
  const handleSave = useCallback(async () => {
    try {
      // 这里应该调用API保存报表配置
      console.log('保存报表配置:', reportConfig);
      message.success('报表保存成功！');
      setHasUnsavedChanges(false);
    } catch (error) {
      message.error('保存失败，请重试');
    }
  }, [reportConfig]);

  // 预览报表
  const handlePreview = useCallback(() => {
    // 打开预览模式
    message.info('预览功能开发中...');
  }, []);

  // 导出报表
  const handleExport = useCallback(() => {
    // 导出功能
    message.info('导出功能开发中...');
  }, []);

  // 返回报表列表
  const handleGoBack = useCallback(() => {
    if (hasUnsavedChanges) {
      // 提示保存
      // Modal.confirm(...);
    }
    navigate('/analysis/report');
  }, [navigate, hasUnsavedChanges]);

  // 处理数据源配置更新
  const handleDataSourceUpdate = useCallback((dataSource: DataSourceConfig) => {
    handleConfigUpdate({ dataSource });
  }, [handleConfigUpdate]);

  // 处理字段配置更新
  const handleFieldsUpdate = useCallback((fields: FieldConfig[]) => {
    handleConfigUpdate({ fields });
  }, [handleConfigUpdate]);

  // 处理筛选条件更新
  const handleFiltersUpdate = useCallback((filters: FilterCondition[]) => {
    handleConfigUpdate({ filters });
  }, [handleConfigUpdate]);

  // 处理样式配置更新
  const handleStyleUpdate = useCallback((style: TableStyleConfig) => {
    handleConfigUpdate({ style });
  }, [handleConfigUpdate]);

  // 计算处理后的数据
  const processedData = useMemo(() => {
    let data = [...reportConfig.dataSource.data];
    
    // 应用筛选条件
    reportConfig.filters.forEach(filter => {
      data = data.filter(row => {
        const value = row[filter.field];
        switch (filter.operator) {
          case '=':
            return value === filter.value;
          case '!=':
            return value !== filter.value;
          case '>':
            return value > filter.value;
          case '<':
            return value < filter.value;
          case 'like':
            return String(value).includes(filter.value);
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          default:
            return true;
        }
      });
    });

    // 应用排序
    if (reportConfig.orderBy.length > 0) {
      data.sort((a, b) => {
        for (const sort of reportConfig.orderBy) {
          const aVal = a[sort.field];
          const bVal = b[sort.field];
          const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          if (comparison !== 0) {
            return sort.direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    // 应用数量限制
    if (reportConfig.limit) {
      data = data.slice(0, reportConfig.limit);
    }

    return data;
  }, [reportConfig]);

  return (
    <Layout style={{ height: '100vh', background: DESIGN_TOKENS.colors.bg }}>
      {/* 顶部工具栏 */}
      <Header 
        style={{ 
          background: '#fff', 
          padding: `0 ${DESIGN_TOKENS.spacing.lg}px`,
          borderBottom: `1px solid ${DESIGN_TOKENS.colors.border}`,
          boxShadow: DESIGN_TOKENS.shadows.sm
        }}
      >
        <Flex justify="space-between" align="center" style={{ height: '100%' }}>
          <Flex align="center" gap={DESIGN_TOKENS.spacing.md}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleGoBack}
              type="text"
            >
              返回
            </Button>
            <Flex align="center" gap={DESIGN_TOKENS.spacing.sm}>
              <TableOutlined style={{ fontSize: 20, color: DESIGN_TOKENS.colors.primary }} />
              <Title level={4} style={{ margin: 0 }}>
                {reportConfig.name}
              </Title>
            </Flex>
          </Flex>

          <Flex gap={DESIGN_TOKENS.spacing.sm}>
            <Button 
              icon={<UndoOutlined />} 
              onClick={handleUndo}
              disabled={historyIndex === 0}
              title="撤销"
            />
            <Button 
              icon={<RedoOutlined />} 
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              title="重做"
            />
            <Button 
              icon={<EyeOutlined />} 
              onClick={handlePreview}
            >
              预览
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
            >
              导出
            </Button>
            <Button 
              type="primary"
              icon={<SaveOutlined />} 
              onClick={handleSave}
            >
              {hasUnsavedChanges ? '保存*' : '保存'}
            </Button>
          </Flex>
        </Flex>
      </Header>

      {/* 主内容区 */}
      <Layout style={{ background: 'transparent' }}>
        {/* 左侧数据配置区 */}
        <Sider 
          width={320} 
          style={{ 
            background: 'transparent',
            padding: DESIGN_TOKENS.spacing.md,
            paddingRight: DESIGN_TOKENS.spacing.sm
          }}
        >
          <Card 
            title="数据配置"
            size="small"
            style={{ 
              height: '100%',
              borderRadius: DESIGN_TOKENS.borderRadius.lg,
              boxShadow: DESIGN_TOKENS.shadows.md
            }}
            bodyStyle={{ 
              padding: DESIGN_TOKENS.spacing.md,
              height: 'calc(100% - 57px)',
              overflowY: 'auto'
            }}
          >
            <DataConfigPanel
              dataSource={reportConfig.dataSource}
              fields={reportConfig.fields}
              filters={reportConfig.filters}
              groupBy={reportConfig.groupBy}
              orderBy={reportConfig.orderBy}
              onDataSourceUpdate={handleDataSourceUpdate}
              onFieldsUpdate={handleFieldsUpdate}
              onFiltersUpdate={handleFiltersUpdate}
              onGroupByUpdate={(groupBy: string[]) => handleConfigUpdate({ groupBy })}
              onOrderByUpdate={(orderBy: Array<{ field: string; direction: 'asc' | 'desc' }>) => handleConfigUpdate({ orderBy })}
            />
          </Card>
        </Sider>

        {/* 中央表格预览区 */}
        <Content 
          style={{ 
            padding: DESIGN_TOKENS.spacing.md,
            paddingLeft: DESIGN_TOKENS.spacing.sm,
            paddingRight: DESIGN_TOKENS.spacing.sm
          }}
        >
          <Card 
            title="表格预览"
            size="small"
            style={{ 
              height: '100%',
              borderRadius: DESIGN_TOKENS.borderRadius.lg,
              boxShadow: DESIGN_TOKENS.shadows.md
            }}
            bodyStyle={{ 
              padding: DESIGN_TOKENS.spacing.md,
              height: 'calc(100% - 57px)',
              overflowY: 'auto'
            }}
          >
            <TablePreviewPanel
              data={processedData}
              fields={reportConfig.fields}
              style={reportConfig.style}
              onFieldsUpdate={handleFieldsUpdate}
            />
          </Card>
        </Content>

        {/* 右侧样式配置区 */}
        <Sider 
          width={320} 
          style={{ 
            background: 'transparent',
            padding: DESIGN_TOKENS.spacing.md,
            paddingLeft: DESIGN_TOKENS.spacing.sm
          }}
        >
          <Card 
            title="样式配置"
            size="small"
            style={{ 
              height: '100%',
              borderRadius: DESIGN_TOKENS.borderRadius.lg,
              boxShadow: DESIGN_TOKENS.shadows.md
            }}
            bodyStyle={{ 
              padding: DESIGN_TOKENS.spacing.md,
              height: 'calc(100% - 57px)',
              overflowY: 'auto'
            }}
          >
            <StyleConfigPanel
              style={reportConfig.style}
              onStyleUpdate={handleStyleUpdate}
            />
          </Card>
        </Sider>
      </Layout>
    </Layout>
  );
};

export default ReportDesigner; 