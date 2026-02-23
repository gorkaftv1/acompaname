import React, { TextareaHTMLAttributes, ChangeEvent } from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the Textarea component
 */
export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  /**
   * Label text displayed above the textarea
   */
  label?: string;
  
  /**
   * Current value of the textarea
   */
  value?: string;
  
  /**
   * Change handler
   */
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Number of visible text rows
   */
  rows?: number;
  
  /**
   * Maximum character length
   */
  maxLength?: number;
  
  /**
   * Whether the field is required
   */
  required?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Textarea Component
 * 
 * A custom-styled textarea component that matches the AcompañaMe design system.
 * Features smooth animations, character counter, proper accessibility, and error states.
 * 
 * @example
 * ```tsx
 * <Textarea
 *   label="Tell us more"
 *   value={text}
 *   onChange={(e) => setText(e.target.value)}
 *   placeholder="Write your thoughts here..."
 *   rows={4}
 *   maxLength={500}
 *   required
 * />
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      value = '',
      onChange,
      placeholder,
      error,
      rows = 4,
      maxLength,
      required = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const currentLength = value?.toString().length || 0;
    const isNearLimit = maxLength ? currentLength / maxLength >= 0.9 : false;

    return (
      <div className={`w-full ${className}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[#2C5F7C] mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Textarea */}
        <motion.div
          whileFocus={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
        >
          <textarea
            ref={ref}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            required={required}
            disabled={disabled}
            className={`
              w-full px-4 py-3
              bg-white
              border rounded-xl
              text-base text-[#2C5F7C]
              resize-vertical
              transition-all duration-200
              ${error
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 focus:border-[#4A9B9B] focus:ring-2 focus:ring-[#4A9B9B]/20'
              }
              ${disabled
                ? 'opacity-60 cursor-not-allowed bg-gray-50'
                : 'hover:border-[#4A9B9B]/50'
              }
              focus:outline-none
              placeholder:text-gray-400
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : maxLength ? `${id}-counter` : undefined}
          />
        </motion.div>
        
        {/* Footer: Error or Character Counter */}
        <div className="flex justify-between items-start mt-2">
          {/* Error Message */}
          {error && (
            <motion.p
              id={`${id}-error`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600"
              role="alert"
            >
              {error}
            </motion.p>
          )}
          
          {/* Character Counter */}
          {maxLength && (
            <p
              id={`${id}-counter`}
              className={`
                text-xs ml-auto
                transition-colors
                ${isNearLimit ? 'text-red-600 font-medium' : 'text-gray-500'}
              `}
              aria-live="polite"
            >
              {currentLength} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
