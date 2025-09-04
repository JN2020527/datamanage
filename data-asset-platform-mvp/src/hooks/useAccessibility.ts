import { useEffect, useCallback, useState } from 'react';

interface AccessibilityOptions {
  /** 是否启用焦点管理 */
  enableFocusManagement?: boolean;
  /** 是否启用键盘导航 */
  enableKeyboardNavigation?: boolean;
  /** 是否启用屏幕阅读器支持 */
  enableScreenReader?: boolean;
  /** 是否启用高对比度模式检测 */
  enableHighContrastDetection?: boolean;
}

interface AccessibilityState {
  /** 是否使用键盘导航 */
  isUsingKeyboard: boolean;
  /** 是否为高对比度模式 */
  isHighContrast: boolean;
  /** 是否可能使用屏幕阅读器 */
  isUsingScreenReader: boolean;
  /** 当前焦点元素 */
  focusedElement: Element | null;
}

/**
 * 可访问性增强 Hook
 * 提供键盘导航、焦点管理、屏幕阅读器支持等功能
 */
export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    enableFocusManagement = true,
    enableKeyboardNavigation = true,
    enableScreenReader = true,
    enableHighContrastDetection = true
  } = options;

  const [state, setState] = useState<AccessibilityState>({
    isUsingKeyboard: false,
    isHighContrast: false,
    isUsingScreenReader: false,
    focusedElement: null
  });

  // 检测键盘使用
  const handleKeyboardInteraction = useCallback(() => {
    setState(prev => ({ ...prev, isUsingKeyboard: true }));
  }, []);

  const handleMouseInteraction = useCallback(() => {
    setState(prev => ({ ...prev, isUsingKeyboard: false }));
  }, []);

  // 检测高对比度模式
  const detectHighContrast = useCallback(() => {
    if (!enableHighContrastDetection) return;

    // 检测 Windows 高对比度模式
    const isWindowsHighContrast = window.matchMedia('(prefers-contrast: high)').matches ||
      window.matchMedia('(-ms-high-contrast: active)').matches ||
      window.matchMedia('(-ms-high-contrast: black-on-white)').matches ||
      window.matchMedia('(-ms-high-contrast: white-on-black)').matches;

    setState(prev => ({ ...prev, isHighContrast: isWindowsHighContrast }));
  }, [enableHighContrastDetection]);

  // 检测屏幕阅读器使用
  const detectScreenReader = useCallback(() => {
    if (!enableScreenReader) return;

    // 检测常见的屏幕阅读器特征
    const hasScreenReaderIndicators = 
      // 检查是否存在屏幕阅读器用户常用的媒体查询
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      // 检查是否有辅助技术API
      !!(window.navigator as any).userAgent.match(/NVDA|JAWS|DRAGON|ZoomText/i) ||
      // 检查是否禁用了动画
      window.getComputedStyle(document.documentElement).getPropertyValue('prefers-reduced-motion') === 'reduce';

    setState(prev => ({ ...prev, isUsingScreenReader: hasScreenReaderIndicators }));
  }, [enableScreenReader]);

  // 焦点管理
  const handleFocusChange = useCallback((event: FocusEvent) => {
    if (!enableFocusManagement) return;
    
    setState(prev => ({ 
      ...prev, 
      focusedElement: event.target as Element 
    }));
  }, [enableFocusManagement]);

  // 跳转到主要内容
  const skipToMainContent = useCallback(() => {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent && mainContent instanceof HTMLElement) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // 跳转到导航
  const skipToNavigation = useCallback(() => {
    const navigation = document.querySelector('nav, [role="navigation"], .navigation');
    if (navigation && navigation instanceof HTMLElement) {
      navigation.focus();
      navigation.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // 宣布内容变化（对屏幕阅读器）
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableScreenReader) return;

    // 创建或获取现有的 live region
    let liveRegion = document.getElementById('screen-reader-announcements');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'screen-reader-announcements';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    // 更新 aria-live 优先级
    liveRegion.setAttribute('aria-live', priority);
    
    // 清空后设置内容，确保屏幕阅读器能检测到变化
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion!.textContent = message;
    }, 10);
  }, [enableScreenReader]);

  // 管理焦点陷阱（用于模态框等）
  const trapFocus = useCallback((container: HTMLElement) => {
    if (!enableFocusManagement) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // 自动聚焦第一个元素
    firstElement?.focus();

    // 返回清理函数
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [enableFocusManagement]);

  // 添加键盘导航支持
  const enhanceKeyboardNavigation = useCallback((container: HTMLElement) => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, target } = event;
      const element = target as HTMLElement;

      // 为没有默认键盘行为的元素添加支持
      if (element.getAttribute('role') === 'button' && (key === 'Enter' || key === ' ')) {
        event.preventDefault();
        element.click();
      }

      // 方向键导航（用于网格或列表）
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        const currentIndex = Array.from(container.children).indexOf(element);
        let nextElement: Element | null = null;

        switch (key) {
          case 'ArrowDown':
          case 'ArrowRight':
            nextElement = container.children[currentIndex + 1];
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            nextElement = container.children[currentIndex - 1];
            break;
        }

        if (nextElement && nextElement instanceof HTMLElement) {
          event.preventDefault();
          nextElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableKeyboardNavigation]);

  // 初始化
  useEffect(() => {
    // 检测用户交互类型
    document.addEventListener('keydown', handleKeyboardInteraction);
    document.addEventListener('mousedown', handleMouseInteraction);
    document.addEventListener('focusin', handleFocusChange);

    // 检测可访问性特性
    detectHighContrast();
    detectScreenReader();

    // 监听媒体查询变化
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    contrastMediaQuery.addEventListener('change', detectHighContrast);
    motionMediaQuery.addEventListener('change', detectScreenReader);

    // 添加全局样式类
    if (state.isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    if (state.isUsingScreenReader) {
      document.documentElement.classList.add('screen-reader');
    }

    return () => {
      document.removeEventListener('keydown', handleKeyboardInteraction);
      document.removeEventListener('mousedown', handleMouseInteraction);
      document.removeEventListener('focusin', handleFocusChange);
      contrastMediaQuery.removeEventListener('change', detectHighContrast);
      motionMediaQuery.removeEventListener('change', detectScreenReader);
    };
  }, [handleKeyboardInteraction, handleMouseInteraction, handleFocusChange, detectHighContrast, detectScreenReader, state.isHighContrast, state.isUsingScreenReader]);

  return {
    ...state,
    skipToMainContent,
    skipToNavigation,
    announceToScreenReader,
    trapFocus,
    enhanceKeyboardNavigation
  };
};
