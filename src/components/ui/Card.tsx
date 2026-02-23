'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

/**
 * Card component variants
 */
type CardVariant = 'default' | 'highlighted';

/**
 * Props for the Card component
 */
export interface CardProps extends HTMLMotionProps<'div'> {
  /**
   * Visual variant of the card
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Whether the card should have hover effects
   * @default false
   */
  hoverable?: boolean;

  /**
   * Whether the card should be clickable (adds cursor pointer)
   * @default false
   */
  clickable?: boolean;

  /**
   * Card content
   */
  children: React.ReactNode;
}

/**
 * Card Component
 * 
 * A flexible container component with soft shadows and rounded corners.
 * Perfect for grouping related content with a clean, calm aesthetic.
 * 
 * @example
 * ```tsx
 * <Card variant="default">
 *   <h3>Content Title</h3>
 *   <p>Some content here...</p>
 * </Card>
 * 
 * <Card variant="highlighted" hoverable clickable onClick={handleClick}>
 *   <p>Interactive card content</p>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      hoverable = false,
      clickable = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'rounded-xl p-6 transition-all duration-250';

    // Variant styles
    const variantStyles = {
      default: 'bg-white shadow-md',
      highlighted: 'bg-[#F5F3EF] shadow-lg border-2 border-[#A8C5B5]',
    };

    // Interactive styles
    const interactiveStyles = clickable ? 'cursor-pointer' : '';

    // Combine all styles
    const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`;

    // Motion props for hover effect
    const hoverProps = hoverable || clickable
      ? {
        whileHover: {
          y: -4,
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
        },
        whileTap: clickable
          ? {
            scale: 0.98,
          }
          : undefined,
      }
      : {};

    return (
      <motion.div
        ref={ref}
        className={combinedStyles}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        {...hoverProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

/**
 * CardHeader Component
 * 
 * Optional header section for Cards with consistent spacing
 */
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

/**
 * CardTitle Component
 * 
 * Styled title for Card headers
 */
export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-xl font-semibold text-[#2C5F7C] ${className}`}>
      {children}
    </h3>
  );
};

/**
 * CardContent Component
 * 
 * Content area with consistent spacing
 */
export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

/**
 * CardFooter Component
 * 
 * Footer section for action buttons or additional info
 */
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-[#E5E7EB] ${className}`}>
      {children}
    </div>
  );
};
