import React from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the Radio component
 */
export interface RadioProps {
  /**
   * Label text for the radio button
   */
  label: string;
  
  /**
   * Name attribute for the radio group
   */
  name: string;
  
  /**
   * Value of this radio option
   */
  value: string;
  
  /**
   * Whether this radio is checked
   */
  checked?: boolean;
  
  /**
   * Change handler
   */
  onChange?: (value: string) => void;
  
  /**
   * Optional description text shown below the label
   */
  description?: string;
  
  /**
   * Whether the radio is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Radio Component
 * 
 * A custom-styled radio button component with smooth animations that matches
 * the AcompañaMe design system. Features animated inner circle and optional description.
 * 
 * @example
 * ```tsx
 * <Radio
 *   label="Option A"
 *   name="options"
 *   value="a"
 *   checked={selected === 'a'}
 *   onChange={(value) => setSelected(value)}
 *   description="This is the first option"
 * />
 * ```
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      name,
      value,
      checked = false,
      onChange,
      description,
      disabled = false,
      className = '',
    },
    ref
  ) => {
    const id = React.useId();
    
    const handleChange = () => {
      if (onChange && !disabled) {
        onChange(value);
      }
    };

    return (
      <label
        htmlFor={id}
        className={`
          flex items-start gap-3 
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${className}
        `}
      >
        {/* Hidden Native Radio */}
        <input
          ref={ref}
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        
        {/* Custom Radio Circle */}
        <div className="relative flex-shrink-0 mt-0.5">
          <motion.div
            className={`
              w-5 h-5 
              rounded-full
              border-2
              transition-all duration-200
              flex items-center justify-center
              ${checked
                ? 'border-[#4A9B9B]'
                : 'border-gray-300 hover:border-[#4A9B9B]/50'
              }
              ${disabled ? '' : 'focus-within:ring-2 focus-within:ring-[#4A9B9B]/20'}
            `}
            whileTap={disabled ? {} : { scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {/* Inner Circle (when checked) */}
            {checked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
                className="w-2.5 h-2.5 rounded-full bg-[#4A9B9B]"
              />
            )}
          </motion.div>
        </div>
        
        {/* Label and Description Container */}
        <div className="flex-1">
          {/* Label Text */}
          <span className="block text-base font-medium text-[#2C5F7C] leading-relaxed select-none">
            {label}
          </span>
          
          {/* Description (optional) */}
          {description && (
            <span className="block mt-1 text-sm text-gray-600 leading-snug select-none">
              {description}
            </span>
          )}
        </div>
      </label>
    );
  }
);

Radio.displayName = 'Radio';
