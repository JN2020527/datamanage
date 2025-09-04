import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

interface TextEffectProps {
  children: string;
  per?: 'word' | 'char' | 'line';
  as?: keyof JSX.IntrinsicElements;
  variants?: { container?: Variants; item?: Variants };
  className?: string;
  preset?: 'blur-sm' | 'fade-in-blur' | 'scale' | 'fade' | 'slide';
  delay?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  segmentWrapperClassName?: string;
  style?: React.CSSProperties;
  speedReveal?: number;
  speedSegment?: number;
}

const presetVariants = {
  'blur-sm': {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.02,
        },
      },
    },
    item: {
      hidden: { 
        opacity: 0, 
        filter: 'blur(10px)',
        y: 10 
      },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: {
          duration: 0.4,
        },
      },
    },
  },
  'fade-in-blur': {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.03,
        },
      },
    },
    item: {
      hidden: { 
        opacity: 0, 
        filter: 'blur(8px)' 
      },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: {
          duration: 0.6,
          ease: [0.25, 0.4, 0.25, 1],
        },
      },
    },
  },
  scale: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
        },
      },
    },
    item: {
      hidden: { 
        opacity: 0, 
        scale: 0.8 
      },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 10,
        },
      },
    },
  },
  fade: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.02,
        },
      },
    },
    item: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.3,
        },
      },
    },
  },
  slide: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.03,
        },
      },
    },
    item: {
      hidden: { 
        opacity: 0, 
        y: 20 
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.25, 0.4, 0.25, 1],
        },
      },
    },
  },
};

const TextEffect: React.FC<TextEffectProps> = ({
  children,
  per = 'word',
  as: Component = 'p',
  variants,
  className,
  preset = 'fade',
  delay = 0,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
  segmentWrapperClassName,
  style,
  speedReveal = 1,
  speedSegment = 1,
}) => {
  const [hasAnimated, setHasAnimated] = useState(!trigger);
  
  useEffect(() => {
    if (trigger && !hasAnimated) {
      setHasAnimated(true);
      onAnimationStart?.();
    }
  }, [trigger, hasAnimated, onAnimationStart]);

  const currentVariants = variants || presetVariants[preset];

  const splitText = (text: string, type: 'word' | 'char' | 'line') => {
    switch (type) {
      case 'char':
        return text.split('');
      case 'line':
        return text.split('\n');
      case 'word':
      default:
        return text.split(' ');
    }
  };

  const segments = splitText(children, per);

  // 调整动画时间
  const adjustedContainerVariants = {
    ...currentVariants.container,
    visible: {
      ...currentVariants.container.visible,
      transition: {
        ...currentVariants.container.visible.transition,
        staggerChildren: (currentVariants.container.visible.transition?.staggerChildren || 0.02) / speedReveal,
        delayChildren: delay,
      },
    },
  };

  const adjustedItemVariants = {
    ...currentVariants.item,
    visible: {
      ...currentVariants.item.visible,
      transition: {
        ...currentVariants.item.visible.transition,
        duration: (currentVariants.item.visible.transition?.duration || 0.3) / speedSegment,
      },
    },
  };

  return (
    <motion.div
      // @ts-ignore
      as={Component}
      className={className}
      style={style}
      variants={adjustedContainerVariants}
      initial="hidden"
      animate={hasAnimated ? "visible" : "hidden"}
      onAnimationComplete={onAnimationComplete}
    >
      {segments.map((segment, index) => (
        <motion.span
          key={index}
          variants={adjustedItemVariants}
          className={`inline-block ${segmentWrapperClassName || ''}`}
          style={{ 
            marginRight: per === 'word' ? '0.25em' : undefined,
            whiteSpace: per === 'line' ? 'pre-line' : undefined 
          }}
        >
          {segment}
          {per === 'line' && index < segments.length - 1 ? '\n' : ''}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default TextEffect;
