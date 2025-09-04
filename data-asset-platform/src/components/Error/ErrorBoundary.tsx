import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { FrownOutlined } from '@ant-design/icons';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Result
          status="error"
          icon={<FrownOutlined />}
          title="页面出现错误"
          subTitle={
            process.env.NODE_ENV === 'development' 
              ? this.state.error?.message 
              : "抱歉，页面遇到了一些问题。请尝试刷新页面或联系管理员。"
          }
          extra={[
            <Button type="primary" key="retry" onClick={this.handleReset}>
              重试
            </Button>,
            <Button key="reload" onClick={this.handleReload}>
              刷新页面
            </Button>,
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
