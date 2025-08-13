import React from 'react';
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';
import styled from 'styled-components';
import { useTheme } from '../theme/ThemeProvider';

// Figma风格过渡动画类型
export type FigmaTransitionType = 
  | 'fade' 
  | 'slide' 
  | 'scale' 
  | 'collapse' 
  | 'drawer' 
  | 'modal' 
  | 'panel'
  | 'dropdown'
  | 'tooltip'
  | 'notification';

export type FigmaTransitionDirection = 'up' | 'down' | 'left' | 'right';

export interface FigmaTransitionProps {
  type: FigmaTransitionType;
  direction?: FigmaTransitionDirection;
  duration?: number;
  children: React.ReactNode;
  show: boolean;
  // Figma风格的动画配置
  spring?: boolean;
  damping?: number;
  stiffness?: number;
  className?: string;
  onAnimationStart?: (definition: any) => void;
  onAnimationComplete?: (definition: any) => void;
}

// Figma风格的动画变体
const getFigmaVariants = (
  type: FigmaTransitionType, 
  direction: FigmaTransitionDirection = 'up'
): Variants => {
  const variants: Record<FigmaTransitionType, Variants> = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    
    slide: {
      hidden: {
        opacity: 0,
        x: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
        y: direction === 'up' ? -20 : direction === 'down' ? 20 : 0,
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
      }
    },
    
    scale: {
      hidden: { 
        opacity: 0, 
        scale: 0.95,
        transformOrigin: 'center center'
      },
      visible: { 
        opacity: 1, 
        scale: 1,
        transformOrigin: 'center center'
      }
    },
    
    collapse: {
      hidden: { 
        opacity: 0, 
        height: 0,
        overflow: 'hidden'
      },
      visible: { 
        opacity: 1, 
        height: 'auto',
        overflow: 'visible'
      }
    },
    
    drawer: {
      hidden: {
        opacity: 0,
        x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
        y: direction === 'up' ? '-100%' : direction === 'down' ? '100%' : 0,
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
      }
    },
    
    modal: {
      hidden: { 
        opacity: 0, 
        scale: 0.9,
        y: 20,
        transformOrigin: 'center center'
      },
      visible: { 
        opacity: 1, 
        scale: 1,
        y: 0,
        transformOrigin: 'center center'
      }
    },
    
    panel: {
      hidden: { 
        opacity: 0,
        x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
        scale: 0.98
      },
      visible: { 
        opacity: 1,
        x: 0,
        scale: 1
      }
    },
    
    dropdown: {
      hidden: { 
        opacity: 0,
        scale: 0.95,
        y: -10,
        transformOrigin: 'top center'
      },
      visible: { 
        opacity: 1,
        scale: 1,
        y: 0,
        transformOrigin: 'top center'
      }
    },
    
    tooltip: {
      hidden: { 
        opacity: 0,
        scale: 0.9,
        y: direction === 'up' ? 5 : direction === 'down' ? -5 : 0,
        x: direction === 'left' ? 5 : direction === 'right' ? -5 : 0,
      },
      visible: { 
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
      }
    },
    
    notification: {
      hidden: { 
        opacity: 0,
        x: direction === 'right' ? 300 : direction === 'left' ? -300 : 0,
        y: direction === 'up' ? -100 : direction === 'down' ? 100 : 0,
        scale: 0.95
      },
      visible: { 
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1
      }
    }
  };

  return variants[type];
};

// Figma风格的过渡配置
const getFigmaTransition = (
  type: FigmaTransitionType,
  duration: number,
  spring: boolean,
  damping: number,
  stiffness: number,
  reducedMotion: boolean
): Transition => {
  if (reducedMotion) {
    return { duration: 0 };
  }

  if (spring) {
    const springConfigs: Record<FigmaTransitionType, any> = {
      fade: { type: 'spring', damping: 25, stiffness: 300 },
      slide: { type: 'spring', damping: 20, stiffness: 300 },
      scale: { type: 'spring', damping: 15, stiffness: 400 },
      collapse: { type: 'spring', damping: 30, stiffness: 300 },
      drawer: { type: 'spring', damping: 25, stiffness: 250 },
      modal: { type: 'spring', damping: 20, stiffness: 300 },
      panel: { type: 'spring', damping: 25, stiffness: 280 },
      dropdown: { type: 'spring', damping: 18, stiffness: 350 },
      tooltip: { type: 'spring', damping: 15, stiffness: 400 },
      notification: { type: 'spring', damping: 22, stiffness: 300 },
    };

    return {
      ...springConfigs[type],
      damping,
      stiffness,
    };
  }

  const easingConfigs: Record<FigmaTransitionType, string> = {
    fade: 'easeOut',
    slide: 'easeOut',
    scale: 'easeOut',
    collapse: 'easeInOut',
    drawer: 'easeOut',
    modal: 'easeOut',
    panel: 'easeOut',
    dropdown: 'easeOut',
    tooltip: 'easeOut',
    notification: 'easeOut',
  };

  return {
    duration: duration / 1000,
    ease: easingConfigs[type],
  };
};

// 过渡容器
const TransitionContainer = styled(motion.div)`
  width: 100%;
  height: 100%;
`;

export const FigmaTransition: React.FC<FigmaTransitionProps> = ({
  type,
  direction = 'up',
  duration = 250,
  children,
  show,
  spring = false,
  damping = 20,
  stiffness = 300,
  className,
  onAnimationStart,
  onAnimationComplete,
}) => {
  const { reducedMotion } = useTheme();
  
  const variants = getFigmaVariants(type, direction);
  const transition = getFigmaTransition(type, duration, spring, damping, stiffness, reducedMotion);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <TransitionContainer
          className={className}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants}
          transition={transition}
          {...(onAnimationStart && { onAnimationStart })}
          {...(onAnimationComplete && { onAnimationComplete })}
        >
          {children}
        </TransitionContainer>
      )}
    </AnimatePresence>
  );
};

// 预设的Figma风格过渡组件
export const FigmaFadeTransition: React.FC<Omit<FigmaTransitionProps, 'type'>> = (props) => (
  <FigmaTransition {...props} type="fade" />
);

export const FigmaSlideTransition: React.FC<Omit<FigmaTransitionProps, 'type'>> = (props) => (
  <FigmaTransition {...props} type="slide" />
);

export const FigmaScaleTransition: React.FC<Omit<FigmaTransitionProps, 'type'>> = (props) => (
  <FigmaTransition {...props} type="scale" />
);

export const FigmaDrawerTransition: React.FC<Omit<FigmaTransitionProps, 'type'>> = (props) => (
  <FigmaTransition {...props} type="drawer" />
);

export const FigmaModalTransition: React.FC<Omit<FigmaTransitionProps, 'type'>> = (props) => (
  <FigmaTransition {...props} type="modal" />
);

export const FigmaPanelTransition: React.FC<Omit<FigmaTransitionProps, 'type'>> = (props) => (
  <FigmaTransition {...props} type="panel" />
);

export const FigmaDropdownTransition: React.FC<Omit<FigmaTransitionProps, 'type'>> = (props) => (
  <FigmaTransition {...props} type="dropdown" />
);

export const FigmaTooltipTransition: React.FC<Omit<FigmaTransitionProps, 'type'>> = (props) => (
  <FigmaTransition {...props} type="tooltip" />
);

export const FigmaNotificationTransition: React.FC<Omit<FigmaTransitionProps, 'type'>> = (props) => (
  <FigmaTransition {...props} type="notification" />
);

// 高级过渡组件：支持多个子元素的交错动画
export interface FigmaStaggerTransitionProps {
  children: React.ReactNode[];
  show: boolean;
  staggerDelay?: number;
  type?: FigmaTransitionType;
  direction?: FigmaTransitionDirection;
  duration?: number;
  spring?: boolean;
}

export const FigmaStaggerTransition: React.FC<FigmaStaggerTransitionProps> = ({
  children,
  show,
  staggerDelay = 50,
  type = 'slide',
  direction = 'up',
  duration = 250,
  spring = false,
}) => {
  const { reducedMotion } = useTheme();
  
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : staggerDelay / 1000,
      },
    },
  };

  const itemVariants = getFigmaVariants(type, direction);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
        >
          {React.Children.map(children, (child, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={getFigmaTransition(type, duration, spring, 20, 300, reducedMotion)}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 页面过渡组件
export interface FigmaPageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  type?: FigmaTransitionType;
  direction?: FigmaTransitionDirection;
  duration?: number;
}

export const FigmaPageTransition: React.FC<FigmaPageTransitionProps> = ({
  children,
  pageKey,
  type = 'slide',
  direction = 'right',
  duration = 300,
}) => {
  const { reducedMotion } = useTheme();
  const variants = getFigmaVariants(type, direction);
  const transition = getFigmaTransition(type, duration, false, 20, 300, reducedMotion);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={variants}
        transition={transition}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};