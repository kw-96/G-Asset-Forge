import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { css, keyframes } from 'styled-components';
import { useTheme } from '../theme/ThemeProvider';

// Figma风格加载器类型
export type FigmaLoaderType = 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress' | 'wave';
export type FigmaLoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface FigmaLoaderProps {
  type: FigmaLoaderType;
  size?: FigmaLoaderSize;
  color?: string;
  className?: string;
  text?: string;
  progress?: number; // 0-100 for progress type
}

// 尺寸配置
const sizeConfig = {
  xs: { size: 16, text: '12px' },
  sm: { size: 20, text: '14px' },
  md: { size: 24, text: '16px' },
  lg: { size: 32, text: '18px' },
  xl: { size: 40, text: '20px' },
};

// 旋转动画
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// 脉冲动画
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// 波浪动画
const wave = keyframes`
  0%, 60%, 100% { transform: initial; }
  30% { transform: translateY(-10px); }
`;

// 闪烁动画
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// 加载器容器
const LoaderContainer = styled.div<{ $size: FigmaLoaderSize }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ $size }) => sizeConfig[$size].text};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// 旋转加载器
const SpinnerLoader = styled.div<{ $size: number; $color: string }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border: 2px solid ${({ theme }) => theme.colors.border.default};
  border-top: 2px solid ${({ $color, theme }) => $color || theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// 点状加载器
const DotsContainer = styled.div<{ $size: number }>`
  display: flex;
  gap: ${({ $size }) => $size * 0.2}px;
`;

const Dot = styled(motion.div)<{ $size: number; $color: string }>`
  width: ${({ $size }) => $size * 0.3}px;
  height: ${({ $size }) => $size * 0.3}px;
  background: ${({ $color, theme }) => $color || theme.colors.primary};
  border-radius: 50%;
`;

// 脉冲加载器
const PulseLoader = styled.div<{ $size: number; $color: string }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background: ${({ $color, theme }) => $color || theme.colors.primary};
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

// 骨架屏容器
const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const SkeletonLine = styled.div<{ $width: string; $height: number }>`
  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height}px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.neutral[100]} 25%,
    ${({ theme }) => theme.colors.neutral[50]} 50%,
    ${({ theme }) => theme.colors.neutral[100]} 75%
  );
  background-size: 200% 100%;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  animation: ${shimmer} 1.5s infinite;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: ${shimmer} 1.5s infinite;
  }
`;

// 进度条加载器
const ProgressContainer = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size * 4}px;
  height: ${({ $size }) => $size * 0.2}px;
  background: ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  position: relative;
`;

const ProgressBar = styled(motion.div)<{ $color: string }>`
  height: 100%;
  background: ${({ $color, theme }) => $color || theme.colors.primary};
  border-radius: inherit;
  transform-origin: left;
`;

// 波浪加载器
const WaveContainer = styled.div<{ $size: number }>`
  display: flex;
  gap: ${({ $size }) => $size * 0.1}px;
`;

const WaveBar = styled(motion.div)<{ $size: number; $color: string }>`
  width: ${({ $size }) => $size * 0.15}px;
  height: ${({ $size }) => $size}px;
  background: ${({ $color, theme }) => $color || theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  animation: ${wave} 1.4s ease-in-out infinite;
`;

// 主要的加载器组件
export const FigmaLoader: React.FC<FigmaLoaderProps> = ({
  type,
  size = 'md',
  color,
  className,
  text,
  progress = 0,
}) => {
  const { reducedMotion } = useTheme();
  const sizeValue = sizeConfig[size].size;

  const renderLoader = () => {
    if (reducedMotion && (type === 'spinner' || type === 'dots' || type === 'pulse' || type === 'wave')) {
      // 在减少动画模式下显示静态版本
      return (
        <div 
          style={{ 
            width: sizeValue, 
            height: sizeValue, 
            background: color || 'currentColor',
            borderRadius: '50%',
            opacity: 0.6
          }} 
        />
      );
    }

    switch (type) {
      case 'spinner':
        return <SpinnerLoader $size={sizeValue} $color={color || ''} />;
      
      case 'dots':
        return (
          <DotsContainer $size={sizeValue}>
            {[0, 1, 2].map((index) => (
              <Dot
                key={index}
                $size={sizeValue}
                $color={color || ''}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </DotsContainer>
        );
      
      case 'pulse':
        return <PulseLoader $size={sizeValue} $color={color || ''} />;
      
      case 'skeleton':
        return (
          <SkeletonContainer>
            <SkeletonLine $width="100%" $height={16} />
            <SkeletonLine $width="80%" $height={16} />
            <SkeletonLine $width="60%" $height={16} />
          </SkeletonContainer>
        );
      
      case 'progress':
        return (
          <ProgressContainer $size={sizeValue}>
            <ProgressBar
              $color={color || ''}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </ProgressContainer>
        );
      
      case 'wave':
        return (
          <WaveContainer $size={sizeValue}>
            {[0, 1, 2, 3, 4].map((index) => (
              <WaveBar
                key={index}
                $size={sizeValue}
                $color={color || ''}
                animate={{ 
                  scaleY: [1, 0.3, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </WaveContainer>
        );
      
      default:
        return <SpinnerLoader $size={sizeValue} $color={color || ''} />;
    }
  };

  return (
    <LoaderContainer className={className} $size={size}>
      {renderLoader()}
      {text && <span>{text}</span>}
    </LoaderContainer>
  );
};

// 预设的加载器组件
export const FigmaSpinner: React.FC<Omit<FigmaLoaderProps, 'type'>> = (props) => (
  <FigmaLoader {...props} type="spinner" />
);

export const FigmaDots: React.FC<Omit<FigmaLoaderProps, 'type'>> = (props) => (
  <FigmaLoader {...props} type="dots" />
);

export const FigmaPulse: React.FC<Omit<FigmaLoaderProps, 'type'>> = (props) => (
  <FigmaLoader {...props} type="pulse" />
);

export const FigmaSkeleton: React.FC<Omit<FigmaLoaderProps, 'type'>> = (props) => (
  <FigmaLoader {...props} type="skeleton" />
);

export const FigmaProgressLoader: React.FC<Omit<FigmaLoaderProps, 'type'>> = (props) => (
  <FigmaLoader {...props} type="progress" />
);

export const FigmaWave: React.FC<Omit<FigmaLoaderProps, 'type'>> = (props) => (
  <FigmaLoader {...props} type="wave" />
);

// 骨架屏组件变体
export interface FigmaSkeletonProps {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: string;
  avatar?: boolean;
  className?: string;
}

export const FigmaSkeletonText: React.FC<FigmaSkeletonProps> = ({
  lines = 3,
  lineHeight = 16,
  lastLineWidth = '60%',
  avatar = false,
  className,
}) => {
  return (
    <SkeletonContainer className={className}>
      {avatar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <SkeletonLine $width="40px" $height={40} style={{ borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <SkeletonLine $width="120px" $height={14} />
            <div style={{ height: '4px' }} />
            <SkeletonLine $width="80px" $height={12} />
          </div>
        </div>
      )}
      
      {Array.from({ length: lines }, (_, index) => (
        <SkeletonLine
          key={index}
          $width={index === lines - 1 ? lastLineWidth : '100%'}
          $height={lineHeight}
        />
      ))}
    </SkeletonContainer>
  );
};

// 加载状态组件
export interface FigmaLoadingStateProps {
  loading: boolean;
  children: React.ReactNode;
  loader?: React.ReactNode;
  overlay?: boolean;
  blur?: boolean;
}

const LoadingOverlay = styled(motion.div)<{ $blur: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.overlay};
  backdrop-filter: ${({ $blur }) => $blur ? 'blur(2px)' : 'none'};
`;

const LoadingContainer = styled.div<{ $loading: boolean; $blur: boolean }>`
  position: relative;
  
  ${({ $loading, $blur }) => $loading && $blur && css`
    filter: blur(1px);
    pointer-events: none;
  `}
`;

export const FigmaLoadingState: React.FC<FigmaLoadingStateProps> = ({
  loading,
  children,
  loader,
  overlay = true,
  blur = false,
}) => {
  const { reducedMotion } = useTheme();

  return (
    <LoadingContainer $loading={loading} $blur={blur && !overlay}>
      {children}
      
      <AnimatePresence>
        {loading && overlay && (
          <LoadingOverlay
            $blur={blur}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            {loader || <FigmaSpinner size="lg" text="加载中..." />}
          </LoadingOverlay>
        )}
      </AnimatePresence>
    </LoadingContainer>
  );
};

// 状态指示器组件
export type FigmaStatusType = 'idle' | 'loading' | 'success' | 'error' | 'warning';

export interface FigmaStatusIndicatorProps {
  status: FigmaStatusType;
  size?: FigmaLoaderSize;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const StatusContainer = styled.div<{ $size: FigmaLoaderSize }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ $size }) => sizeConfig[$size].text};
`;

const StatusIcon = styled(motion.div)<{ 
  $size: number; 
  $status: FigmaStatusType;
}>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${({ $status, theme }) => {
    switch ($status) {
      case 'idle':
        return css`
          background: ${theme.colors.neutral[300]};
          color: ${theme.colors.neutral[600]};
        `;
      case 'loading':
        return css`
          background: ${theme.colors.primary};
          color: white;
        `;
      case 'success':
        return css`
          background: ${theme.colors.semantic.success[500]};
          color: white;
        `;
      case 'error':
        return css`
          background: ${theme.colors.semantic.error[500]};
          color: white;
        `;
      case 'warning':
        return css`
          background: ${theme.colors.semantic.warning[500]};
          color: white;
        `;
      default:
        return css`
          background: ${theme.colors.neutral[300]};
          color: ${theme.colors.neutral[600]};
        `;
    }
  }}
`;

const StatusLabel = styled.span<{ $status: FigmaStatusType }>`
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'success':
        return theme.colors.semantic.success[600];
      case 'error':
        return theme.colors.semantic.error[600];
      case 'warning':
        return theme.colors.semantic.warning[600];
      default:
        return theme.colors.text.secondary;
    }
  }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

export const FigmaStatusIndicator: React.FC<FigmaStatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className,
}) => {
  const { reducedMotion } = useTheme();
  const sizeValue = sizeConfig[size].size;

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return animated && !reducedMotion ? '⟳' : '○';
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      default:
        return '○';
    }
  };

  const getStatusLabel = () => {
    if (label) return label;
    
    switch (status) {
      case 'loading':
        return '加载中';
      case 'success':
        return '成功';
      case 'error':
        return '错误';
      case 'warning':
        return '警告';
      default:
        return '空闲';
    }
  };

  return (
    <StatusContainer className={className} $size={size}>
      <StatusIcon
        $size={sizeValue}
        $status={status}
        animate={
          status === 'loading' && animated && !reducedMotion
            ? { rotate: 360 }
            : {}
        }
        transition={
          status === 'loading' && animated && !reducedMotion
            ? { duration: 1, repeat: Infinity, ease: 'linear' }
            : {}
        }
      >
        {getStatusIcon()}
      </StatusIcon>
      
      {showLabel && (
        <StatusLabel $status={status}>
          {getStatusLabel()}
        </StatusLabel>
      )}
    </StatusContainer>
  );
};