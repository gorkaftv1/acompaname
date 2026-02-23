import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * Props for the Checkbox component
 */
export interface CheckboxProps {
  /**
   * Label text for the checkbox
   */
  label: string;
  
  /**
   * Whether the checkbox is checked
   */
  checked?: boolean;
  
  /**
   * Change handler
   */
  onChange?: (checked: boolean) => void;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Whether the checkbox is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Checkbox Component
 * 
 * A custom-styled checkbox component with smooth animations that matches
 * the AcompañaMe design system. Features animated checkmark and proper accessibility.
 * 
 * @example
 * ```tsx
 * <Checkbox
 *   label="I accept the terms and conditions"
 *   checked={accepted}
 *   onChange={(checked) => setAccepted(checked)}
 * />
 * ```
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      checked = false,
      onChange,
      error,
      disabled = false,
      className = '',
    },
    ref
  ) => {
    const id = React.useId();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange && !disabled) {
        onChange(e.target.checked);
      }
    };
    
    const handleClick = () => {
      if (onChange && !disabled) {
        onChange(!checked);
      }
    };

    return (
      <div className={`w-full ${className}`}>
        {/* Checkbox Container */}
        <label
          htmlFor={id}
          className={`
            flex items-start gap-3 
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
        >
          {/* Hidden Native Checkbox */}
          <input
            ref={ref}
            type="checkbox"
            id={id}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          
          {/* Custom Checkbox */}
          <motion.div
            onClick={handleClick}
            className={`
              relative flex items-center justify-center
              w-5 h-5 
              rounded-md
              border-2
              transition-all duration-200
              flex-shrink-0
              mt-0.5
              ${error
                ? 'border-red-500'
                : checked
                  ? 'border-[#4A9B9B] bg-[#4A9B9B]'
                  : 'border-gray-300 bg-white hover:border-[#4A9B9B]/50'
              }
              ${disabled ? '' : 'focus-within:ring-2 focus-within:ring-[#4A9B9B]/20'}
            `}
            whileTap={disabled ? {} : { scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {/* Checkmark Icon */}
            <AnimatePresence>
              {checked && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Label Text */}
          <span className="text-base text-[#2C5F7C] leading-relaxed select-none">
            {label}
          </span>
        </label>
        
        {/* Error Message */}
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 ml-8 text-sm text-red-600"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
