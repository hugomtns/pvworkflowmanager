/**
 * BaseSelect Component
 * Standardized select dropdown component with error display and consistent styling
 */

import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface BaseSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Select label */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Help text to display below the select */
  helpText?: string;
  /** Placeholder text for empty option */
  placeholder?: string;
  /** Select options */
  options: SelectOption[];
  /** Container class name */
  containerClassName?: string;
  /** Label class name */
  labelClassName?: string;
  /** Whether to show the placeholder as first option */
  showPlaceholder?: boolean;
}

const BaseSelect: React.FC<BaseSelectProps> = ({
  label,
  required = false,
  error,
  helpText,
  placeholder = 'Select an option',
  options,
  containerClassName = '',
  labelClassName = '',
  className = '',
  id,
  showPlaceholder = true,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  const selectClasses = [
    'form-select',
    hasError ? 'error' : '',
    className
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'form-label',
    required ? 'required' : '',
    labelClassName
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'form-field',
    containerClassName
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={selectId} className={labelClasses}>
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={selectClasses}
        {...props}
      >
        {showPlaceholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <span className="form-error">{error}</span>
      )}

      {!error && helpText && (
        <span className="form-help">{helpText}</span>
      )}
    </div>
  );
};

export default BaseSelect;