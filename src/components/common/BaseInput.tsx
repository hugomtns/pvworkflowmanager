/**
 * BaseInput Component
 * Standardized input component with error display and consistent styling
 */

import React from 'react';

export interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Help text to display below the input */
  helpText?: string;
  /** Icon to display before the input */
  icon?: React.ReactNode;
  /** Icon to display after the input */
  iconAfter?: React.ReactNode;
  /** Container class name */
  containerClassName?: string;
  /** Label class name */
  labelClassName?: string;
  /** Input wrapper class name */
  wrapperClassName?: string;
}

const BaseInput: React.FC<BaseInputProps> = ({
  label,
  required = false,
  error,
  helpText,
  icon,
  iconAfter,
  containerClassName = '',
  labelClassName = '',
  wrapperClassName = '',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  const inputClasses = [
    'form-input',
    hasError ? 'error' : '',
    icon ? 'with-icon' : '',
    iconAfter ? 'with-icon-after' : '',
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

  const wrapperClasses = [
    'form-input-wrapper',
    wrapperClassName
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
        </label>
      )}

      <div className={wrapperClasses}>
        {icon && <span className="form-input-icon">{icon}</span>}
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        {iconAfter && <span className="form-input-icon-after">{iconAfter}</span>}
      </div>

      {error && (
        <span className="form-error">{error}</span>
      )}

      {!error && helpText && (
        <span className="form-help">{helpText}</span>
      )}
    </div>
  );
};

export default BaseInput;