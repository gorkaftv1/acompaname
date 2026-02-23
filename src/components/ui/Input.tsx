import React from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the Input component
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Label text for the input
   */
  label?: string;
  
  /**
   * Error message to display below the input
   */
  error?: string;
  
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  
  /**
   * Whether the input is required
   * @default false
   */
  required?: boolean;
  
  /**
   * Whether the input should take full width
   * @default true
   */
  fullWidth?: boolean;
}

/**
 * Input Component
 * 
 * A fully-featured input component with label, error states, and smooth
 * focus animations. Supports form libraries via forwardRef.
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   error={errors.email}
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if not provided
    const inputId = id || `input-${React.useId()}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    
    // Base input styles
    const baseInputStyles = 'block w-full px-4 py-3 text-base text-[#1A1A1A] bg-white border-2 rounded-xl transition-colors placeholder:text-[#9CA3AF] focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed';
    
    // Dynamic border color based on state
    const borderStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
      : 'border-[#E5E7EB] focus:border-[#4A9B9B] focus:ring-2 focus:ring-[#4A9B9B]/20';
    
    // Width style
    const widthStyle = fullWidth ? 'w-full' : '';
    
    // Combine input styles
    const inputStyles = `${baseInputStyles} ${borderStyles} ${className}`;
    
    return (
      <div className={widthStyle}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#1A1A1A] mb-2"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        {/* Input with Framer Motion */}
        <motion.div
          initial={false}
          animate={{
            scale: 1,
          }}
          whileFocus={{
            scale: 1.01,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
        >
          <input
            ref={ref}
            id={inputId}
            className={inputStyles}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />
        </motion.div>
        
        {/* Error Message */}
        {error && (
          <motion.p
            id={errorId}
            className="mt-2 text-sm text-red-500 flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            role="alert"
          >
            <svg
              className="w-4 h-4 mr-1 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.p>
        )}
        
        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-2 text-sm text-[#6B7280]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
