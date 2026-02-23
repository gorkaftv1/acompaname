import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

/**
 * Button component variants
 */
type ButtonVariant = 'primary' | 'secondary' | 'outline';

/**
 * Button component size options
 */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Button component
 */
export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  /**
   * Visual variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize;
  
  /**
   * Whether the button is in a loading state
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Whether the button should take full width
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Button content
   */
  children: React.ReactNode;
}

/**
 * Button Component
 * 
 * A versatile button component with multiple variants, smooth animations,
 * and full accessibility support. Uses Framer Motion for interactions.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Variant styles
    const variantStyles = {
      primary: 'bg-[#4A9B9B] text-white hover:bg-[#3A8989] focus:ring-[#4A9B9B] shadow-md',
      secondary: 'bg-[#A8C5B5] text-[#2C5F7C] hover:bg-[#98B5A5] focus:ring-[#A8C5B5] shadow-md',
      outline: 'bg-transparent text-[#4A9B9B] border-2 border-[#4A9B9B] hover:bg-[#4A9B9B]/10 focus:ring-[#4A9B9B]',
    };
    
    // Size styles
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };
    
    // Width style
    const widthStyle = fullWidth ? 'w-full' : '';
    
    // Combine all styles
    const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;
    
    return (
      <motion.button
        ref={ref}
        className={combinedStyles}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
