import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAppStore } from '@store/useAppStore';
import { api } from '@mock/api';
import router from './router/index';
import ErrorBoundary from '@components/Error/ErrorBoundary';
import './assets/styles/global.css';
import 'dayjs/locale/zh-cn';

function App() {
  const { setCurrentUser, setAuthenticated } = useAppStore();

  useEffect(() => {
    // 初始化用户信息
    const initUser = async () => {
      try {
        const { data } = await api.getCurrentUser();
        setCurrentUser(data);
        setAuthenticated(true);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    initUser();
  }, [setCurrentUser, setAuthenticated]);

  return (
    <ErrorBoundary>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#1677FF',
            borderRadius: 6,
            wireframe: false,
          },
          components: {
            Layout: {
              headerBg: '#fff',
              siderBg: '#fff',
            },
            Menu: {
              itemBg: 'transparent',
              subMenuItemBg: 'transparent',
            },
          },
        }}
      >
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
