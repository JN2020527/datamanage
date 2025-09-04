import { useState, useEffect } from 'react'
import { Layout, Menu, Button, Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { Link, Outlet } from 'react-router-dom'
import { useAccessibility } from '@/hooks/useAccessibility'
import KeyboardShortcuts from './KeyboardShortcuts'
import '@/styles/globals.less'

const { Header, Content, Footer } = Layout

export default function AppLayout() {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const { announceToScreenReader, skipToMainContent } = useAccessibility()

  // 监听快捷键显示/隐藏
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault()
        setShowShortcuts(!showShortcuts)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showShortcuts])

  // 页面加载时宣布
  useEffect(() => {
    announceToScreenReader('数据资产平台已加载完成')
  }, [announceToScreenReader])

  return (
    <Layout className="app-layout">
      {/* 跳转链接（无障碍） */}
      <div className="skip-links" style={{ 
        position: 'absolute',
        top: '-40px',
        left: '0',
        zIndex: 9999,
        background: '#000',
        color: '#fff',
        padding: '8px 12px',
        textDecoration: 'none',
        fontSize: '14px'
      }}>
        <Button 
          type="link" 
          style={{ color: '#fff' }}
          onFocus={(e) => {
            e.currentTarget.parentElement!.style.top = '0'
          }}
          onBlur={(e) => {
            e.currentTarget.parentElement!.style.top = '-40px'
          }}
          onClick={skipToMainContent}
        >
          跳转到主要内容 (按 Tab 键导航)
        </Button>
      </div>

      <Header className="app-header" role="banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ color: '#fff', fontWeight: 600 }}>数据资产平台</div>
            <Menu
              theme="dark"
              mode="horizontal"
              selectable={false}
              role="navigation"
              aria-label="主导航"
              items={[
                { 
                  key: 'home', 
                  label: <Link to="/" aria-label="首页 (Alt+H)">首页</Link> 
                },
                { 
                  key: 'discovery', 
                  label: <Link to="/discovery" aria-label="资产发现页面 (Alt+D)">资产发现</Link> 
                },
                { 
                  key: 'system-users', 
                  label: <Link to="/system/users" aria-label="系统用户管理 (Alt+U)">系统-用户</Link> 
                },
              ]}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tooltip title="快捷键帮助 (Ctrl + /)">
              <Button
                type="text"
                icon={<QuestionCircleOutlined />}
                onClick={() => setShowShortcuts(true)}
                style={{ color: '#fff' }}
                aria-label="显示键盘快捷键帮助"
              />
            </Tooltip>
          </div>
        </div>
      </Header>
      
      <Content 
        className="app-content" 
        role="main" 
        id="main-content"
        tabIndex={-1}
        style={{ outline: 'none' }}
      >
        <Outlet />
      </Content>
      
      <Footer className="app-footer" role="contentinfo">
        © {new Date().getFullYear()} 数据资产平台
      </Footer>

      {/* 键盘快捷键帮助 */}
      <KeyboardShortcuts
        visible={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </Layout>
  )
}

