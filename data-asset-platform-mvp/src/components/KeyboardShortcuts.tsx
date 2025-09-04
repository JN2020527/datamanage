import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Table, Typography, Tag, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Shortcut {
  key: string;
  description: string;
  category: string;
  action?: () => void;
}

interface KeyboardShortcutsProps {
  /** 是否显示帮助模态框 */
  visible?: boolean;
  /** 关闭帮助模态框的回调 */
  onClose?: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  visible = false,
  onClose
}) => {
  const navigate = useNavigate();

  // 定义快捷键映射
  const shortcuts: Shortcut[] = [
    {
      key: 'Ctrl + /',
      description: '显示/隐藏快捷键帮助',
      category: '通用',
    },
    {
      key: 'Ctrl + K',
      description: '全局搜索（聚焦搜索框）',
      category: '搜索',
      action: () => {
        // 聚焦搜索框
        const searchInput = document.querySelector('input[placeholder*="搜索"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    },
    {
      key: '/',
      description: '快速搜索（聚焦搜索框）',
      category: '搜索',
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="搜索"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    },
    {
      key: 'Escape',
      description: '取消当前操作/关闭模态框',
      category: '通用',
    },
    {
      key: 'Alt + H',
      description: '返回首页',
      category: '导航',
      action: () => navigate('/')
    },
    {
      key: 'Alt + D',
      description: '进入资产发现页',
      category: '导航',
      action: () => navigate('/discovery')
    },
    {
      key: 'Alt + U',
      description: '进入系统用户管理',
      category: '导航',
      action: () => navigate('/system/users')
    },
    {
      key: 'Ctrl + Enter',
      description: '提交表单/确认操作',
      category: '操作',
    },
    {
      key: 'Ctrl + R',
      description: '刷新当前页面数据',
      category: '操作',
      action: () => window.location.reload()
    },
    {
      key: 'F5',
      description: '刷新页面',
      category: '操作',
      action: () => window.location.reload()
    },
    {
      key: 'Tab',
      description: '在可聚焦元素间切换',
      category: '可访问性',
    },
    {
      key: 'Shift + Tab',
      description: '反向在可聚焦元素间切换',
      category: '可访问性',
    },
    {
      key: 'Enter',
      description: '激活聚焦的元素（按钮、链接等）',
      category: '可访问性',
    },
    {
      key: 'Space',
      description: '激活按钮或复选框',
      category: '可访问性',
    }
  ];

  // 处理键盘事件
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
    const isCtrlOrCmd = ctrlKey || metaKey;
    
    // 防止在输入框中触发快捷键
    const activeElement = document.activeElement;
    const isInputActive = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.getAttribute('contenteditable') === 'true'
    );

    // Ctrl/Cmd + / 或 ? - 显示帮助
    if ((isCtrlOrCmd && key === '/') || (shiftKey && key === '?')) {
      event.preventDefault();
      if (onClose) {
        onClose();
      }
      return;
    }

    // 如果在输入框中，只处理特定快捷键
    if (isInputActive) {
      // Escape - 失去焦点
      if (key === 'Escape') {
        (activeElement as HTMLElement).blur();
        event.preventDefault();
      }
      return;
    }

    // 处理其他快捷键
    switch (true) {
      // Ctrl/Cmd + K - 全局搜索
      case isCtrlOrCmd && key.toLowerCase() === 'k':
        event.preventDefault();
        shortcuts.find(s => s.key === 'Ctrl + K')?.action?.();
        break;

      // / - 快速搜索
      case key === '/' && !isCtrlOrCmd && !altKey:
        event.preventDefault();
        shortcuts.find(s => s.key === '/')?.action?.();
        break;

      // Alt + H - 首页
      case altKey && key.toLowerCase() === 'h':
        event.preventDefault();
        shortcuts.find(s => s.key === 'Alt + H')?.action?.();
        break;

      // Alt + D - 发现页
      case altKey && key.toLowerCase() === 'd':
        event.preventDefault();
        shortcuts.find(s => s.key === 'Alt + D')?.action?.();
        break;

      // Alt + U - 用户管理
      case altKey && key.toLowerCase() === 'u':
        event.preventDefault();
        shortcuts.find(s => s.key === 'Alt + U')?.action?.();
        break;

      // Ctrl/Cmd + R - 刷新数据
      case isCtrlOrCmd && key.toLowerCase() === 'r':
        // 这里可以触发页面数据刷新而不是整页刷新
        // event.preventDefault();
        break;

      // F5 - 刷新页面
      case key === 'F5':
        // 保持默认行为
        break;

      default:
        break;
    }
  }, [navigate, onClose]);

  // 绑定键盘事件
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 表格列配置
  const columns = [
    {
      title: '快捷键',
      dataIndex: 'key',
      key: 'key',
      width: 120,
      render: (key: string) => (
        <Tag style={{ fontFamily: 'monospace', fontSize: '12px' }}>{key}</Tag>
      )
    },
    {
      title: '功能描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => {
        const colorMap: Record<string, string> = {
          '通用': 'blue',
          '搜索': 'green',
          '导航': 'orange',
          '操作': 'purple',
          '可访问性': 'cyan'
        };
        return <Tag color={colorMap[category] || 'default'}>{category}</Tag>;
      }
    }
  ];

  // 按分类分组显示
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Modal
      title={
        <Space>
          <QuestionCircleOutlined />
          键盘快捷键
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="keyboard-shortcuts-modal"
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          使用以下快捷键可以更高效地操作系统。按 <Tag>Ctrl + /</Tag> 随时查看此帮助。
        </Text>
      </div>

      {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
        <div key={category} style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 12 }}>
            {category}
          </Title>
          <Table
            dataSource={categoryShortcuts}
            columns={columns}
            rowKey="key"
            pagination={false}
            size="small"
            showHeader={false}
            style={{ marginBottom: 16 }}
          />
        </div>
      ))}

      <div style={{ 
        padding: '16px', 
        background: '#f6f8fa', 
        borderRadius: '6px',
        marginTop: 24 
      }}>
        <Text strong>提示：</Text>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>大部分快捷键在输入框聚焦时不会触发</li>
          <li>使用 <Tag>Tab</Tag> 和 <Tag>Shift + Tab</Tag> 在界面元素间导航</li>
          <li>在可聚焦元素上按 <Tag>Enter</Tag> 或 <Tag>Space</Tag> 激活</li>
          <li>按 <Tag>Escape</Tag> 取消当前操作或关闭模态框</li>
        </ul>
      </div>
    </Modal>
  );
};

export default KeyboardShortcuts;
