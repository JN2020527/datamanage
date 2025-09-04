import React from 'react';
import LoadingComponent from './Loading';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import SkeletonPlaceholder from './SkeletonPlaceholder';
import type { EmptyType } from './EmptyState';
import type { ErrorType } from './ErrorState';
import type { SkeletonType } from './SkeletonPlaceholder';

interface StateContainerProps {
  /** 是否正在加载 */
  loading?: boolean;
  /** 错误信息 */
  error?: string | null;
  /** 是否为空状态 */
  empty?: boolean;
  /** 数据（用于判断是否为空） */
  data?: any;
  /** 子组件 */
  children: React.ReactNode;
  
  // Loading 配置
  loadingTip?: string;
  loadingSize?: 'small' | 'default' | 'large';
  
  // Empty 配置  
  emptyType?: EmptyType;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  
  // Error 配置
  errorType?: ErrorType;
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  errorActions?: React.ReactNode;
  showErrorDetail?: boolean;
  
  // Skeleton 配置
  skeletonType?: SkeletonType;
  skeletonRows?: number;
  
  // 通用配置
  card?: boolean;
  minHeight?: number | string;
  
  // 是否使用骨架屏替代loading
  useSkeleton?: boolean;
}

/**
 * 统一状态容器组件
 * 根据 loading、error、empty 状态自动渲染对应的 UI
 */
const StateContainer: React.FC<StateContainerProps> = ({
  loading = false,
  error = null,
  empty = false,
  data,
  children,
  loadingTip,
  loadingSize = 'default',
  emptyType = 'default',
  emptyTitle,
  emptyDescription,
  emptyAction,
  errorType = 'generic',
  errorTitle,
  errorDescription,
  onRetry,
  errorActions,
  showErrorDetail = false,
  skeletonType = 'custom',
  skeletonRows = 3,
  card = false,
  minHeight = 200,
  useSkeleton = false
}) => {
  // 自动判断空状态
  const isActuallyEmpty = empty || (
    data !== undefined && 
    (
      data === null || 
      data === '' ||
      (Array.isArray(data) && data.length === 0) ||
      (typeof data === 'object' && Object.keys(data).length === 0)
    )
  );

  // 错误状态
  if (error) {
    return (
      <ErrorState
        type={errorType}
        title={errorTitle}
        description={errorDescription}
        detail={error}
        onRetry={onRetry}
        actions={errorActions}
        card={card}
        minHeight={minHeight}
        showDetail={showErrorDetail}
      />
    );
  }

  // 加载状态
  if (loading) {
    if (useSkeleton) {
      return (
        <SkeletonPlaceholder
          type={skeletonType}
          card={card}
          rows={skeletonRows}
          height={minHeight}
        />
      );
    }
    
    return (
      <LoadingComponent
        tip={loadingTip}
        card={card}
        size={loadingSize}
        minHeight={minHeight}
      />
    );
  }

  // 空状态
  if (isActuallyEmpty) {
    return (
      <EmptyState
        type={emptyType}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        card={card}
        minHeight={minHeight}
      />
    );
  }

  // 正常状态，渲染子组件
  return <>{children}</>;
};

export default StateContainer;
