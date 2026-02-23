import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * Option type for Select component
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Props for the Select component
 */
export interface SelectProps {
  /**
   * Label text displayed above the select
   */
  label?: string;
  
  /**
   * Array of options to display
   */
  options: SelectOption[];
  
  /**
   * Currently selected value
   */
  value?: string;
  
  /**
   * Change handler
   */
  onChange?: (value: string) => void;
  
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Whether the field is required
   */
  required?: boolean;
  
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Select (Dropdown) Component
 * 
 * A custom-styled select dropdown component that matches the AcompañaMe design system.
 * Features smooth animations, proper accessibility, and error states.
 * 
 * @example
 * ```tsx
 * <Select
 *   label="Choose an option"
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' }
 *   ]}
 *   value={selectedValue}
 *   onChange={(value) => setSelectedValue(value)}
 *   required
 * />
 * ```
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      placeholder = 'Selecciona una opción',
      error,
      required = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

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
        
        {/* Select Container */}
        <motion.div 
          className="relative"
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <select
            ref={ref}
            id={id}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={`
              w-full px-4 py-3 pr-10
              bg-white
              border rounded-xl
              text-base text-[#2C5F7C]
              appearance-none
              transition-all duration-200
              min-h-[48px]
              ${error
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 focus:border-[#4A9B9B] focus:ring-2 focus:ring-[#4A9B9B]/20'
              }
              ${disabled
                ? 'opacity-60 cursor-not-allowed bg-gray-50'
                : 'cursor-pointer hover:border-[#4A9B9B]/50'
              }
              focus:outline-none
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : undefined}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Chevron Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown
              className={`w-5 h-5 transition-colors ${
                disabled ? 'text-gray-400' : 'text-[#4A9B9B]'
              }`}
            />
          </div>
        </motion.div>
        
        {/* Error Message */}
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
