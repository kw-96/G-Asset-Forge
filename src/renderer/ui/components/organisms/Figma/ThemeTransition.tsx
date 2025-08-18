import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useTheme } from '../../../theme/ThemeProvider';

interface ThemeTransitionProps {
  children: React.ReactNode;
}

// 主题切换过渡容器
const TransitionContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

// 主题切换遮罩层
const TransitionOverlay = styled(motion.div)<{ isTransitioning: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.colors.background};
  z-index: ${props => props.theme.zIndex.overlay};
  pointer-events: ${props => props.isTransitioning ? 'all' : 'none'};
  opacity: ${props => props.isTransitioning ? 1 : 0};
`;

// 主题切换加载指示器
const TransitionLoader = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const LoaderSpinner = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.theme.colors.border.default};
  border-top: 2px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
`;

// 颜色插值动画组件
const ColorInterpolationWrapper = styled(motion.div)`
  width: 100%;
  height: 100%;
  transition: background-color ${props => props.theme.animation.duration.transition} 
              ${props => props.theme.animation.easing.smooth};
`;

export const ThemeTransition: React.FC<ThemeTransitionProps> = ({ children }) => {
  const { actualMode, transitionDuration, reducedMotion } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousMode, setPreviousMode] = useState(actualMode);

  useEffect(() => {
    if (previousMode !== actualMode && !reducedMotion) {
      setIsTransitioning(true);
      
      // 模拟主题切换处理时间
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(false);
        setPreviousMode(actualMode);
      }, Math.min(transitionDuration, 300));

      return () => clearTimeout(transitionTimer);
    } else {
      setPreviousMode(actualMode);
    }
  }, [actualMode, previousMode, transitionDuration, reducedMotion]);

  // 如果启用了减少动画，直接渲染内容
  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <TransitionContainer>
      <ColorInterpolationWrapper
        key={actualMode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: transitionDuration / 1000,
          ease: 'easeInOut'
        }}
      >
        {children}
      </ColorInterpolationWrapper>

      <AnimatePresence>
        {isTransitioning && (
          <TransitionOverlay
            isTransitioning={isTransitioning}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: transitionDuration / 2000, // 一半时间用于显示遮罩
              ease: 'easeInOut'
            }}
          >
            <TransitionLoader
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: 'easeOut'
              }}
            >
              <LoaderSpinner
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
              切换主题中...
            </TransitionLoader>
          </TransitionOverlay>
        )}
      </AnimatePresence>
    </TransitionContainer>
  );
};

// 主题切换按钮组件
interface ThemeToggleButtonProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ToggleButton = styled(motion.button)<{ size: 'sm' | 'md' | 'lg' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${props => {
    switch (props.size) {
      case 'sm': return '6px 12px';
      case 'lg': return '12px 20px';
      default: return '8px 16px';
    }
  }};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => {
    switch (props.size) {
      case 'sm': return props.theme.typography.fontSize.xs;
      case 'lg': return props.theme.typography.fontSize.base;
      default: return props.theme.typography.fontSize.sm;
    }
  }};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} 
              ${props => props.theme.animation.easing.easeOut};

  &:hover {
    background: ${props => props.theme.colors.interaction.hover};
    border-color: ${props => props.theme.colors.border.hover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.soft};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${props => props.theme.shadows.subtle};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.interaction.focus};
    outline-offset: 2px;
  }
`;

const ThemeIcon = styled(motion.div)<{ mode: string }>`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: ${props => {
      switch (props.mode) {
        case 'light': return '"☀️"';
        case 'dark': return '"🌙"';
        case 'system': return '"💻"';
        default: return '"☀️"';
      }
    }};
    font-size: 14px;
  }
`;

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  className,
  showLabel = true,
  size = 'md'
}) => {
  const { mode, toggleTheme, reducedMotion } = useTheme();

  const getModeLabel = (currentMode: string) => {
    switch (currentMode) {
      case 'light': return '浅色';
      case 'dark': return '深色';
      case 'system': return '跟随系统';
      default: return '浅色';
    }
  };

  return (
    <ToggleButton
      className={className}
      size={size}
      onClick={toggleTheme}
      whileHover={reducedMotion ? {} : { scale: 1.02 }}
      whileTap={reducedMotion ? {} : { scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17
      }}
    >
      <ThemeIcon
        mode={mode}
        animate={reducedMotion ? {} : { rotate: mode === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
      {showLabel && getModeLabel(mode)}
    </ToggleButton>
  );
};

// 主题切换性能监控Hook
export const useThemeTransitionPerformance = () => {
  const { transitionDuration } = useTheme();
  const [performanceMetrics, setPerformanceMetrics] = useState({
    lastTransitionTime: 0,
    averageTransitionTime: 0,
    transitionCount: 0,
  });

  const measureTransition = (callback: () => void) => {
    const startTime = performance.now();
    
    callback();
    
    requestAnimationFrame(() => {
      const endTime = performance.now();
      const transitionTime = endTime - startTime;
      
      setPerformanceMetrics(prev => {
        const newCount = prev.transitionCount + 1;
        const newAverage = (prev.averageTransitionTime * prev.transitionCount + transitionTime) / newCount;
        
        return {
          lastTransitionTime: transitionTime,
          averageTransitionTime: newAverage,
          transitionCount: newCount,
        };
      });

      // 性能警告
      if (transitionTime > transitionDuration * 1.5) {
        console.warn(`主题切换性能警告: 实际耗时 ${transitionTime.toFixed(2)}ms，预期 ${transitionDuration}ms`);
      }
    });
  };

  return {
    performanceMetrics,
    measureTransition,
  };
};

export type { ThemeTransitionProps };
export { ThemeTransition as FigmaThemeTransition };