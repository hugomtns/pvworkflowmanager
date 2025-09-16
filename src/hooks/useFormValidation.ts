/**
 * useFormValidation Hook
 * Standardizes form validation across components
 */

import { useState, useCallback } from 'react';
import type { ValidationResult, ValidationRule } from '../utils/validation';
import { validateWithRules } from '../utils/validation';

export interface UseFormValidationOptions<T> {
  /** Initial form data */
  initialData: T;
  /** Validation rules to apply */
  validationRules?: ValidationRule<T>[];
  /** Custom validation function */
  customValidator?: (data: T) => ValidationResult;
  /** Whether to validate on change (default: false) */
  validateOnChange?: boolean;
}

export interface UseFormValidationReturn<T> {
  /** Current form data */
  formData: T;
  /** Current validation errors */
  errors: Record<string, string>;
  /** Whether the form is currently valid */
  isValid: boolean;
  /** Whether validation has been attempted */
  hasValidated: boolean;
  /** Update form data */
  setFormData: (data: T | ((prev: T) => T)) => void;
  /** Update a specific field */
  updateField: (field: keyof T, value: any) => void;
  /** Validate the current form data */
  validate: () => boolean;
  /** Clear all validation errors */
  clearErrors: () => void;
  /** Clear validation error for a specific field */
  clearFieldError: (field: keyof T) => void;
  /** Reset form to initial state */
  resetForm: () => void;
  /** Get error for a specific field */
  getFieldError: (field: keyof T) => string | undefined;
  /** Check if a specific field has an error */
  hasFieldError: (field: keyof T) => boolean;
  /** Get CSS class for field (includes 'error' if field has error) */
  getFieldClassName: (baseClassName: string, field: keyof T) => string;
}

/**
 * Custom hook for form validation
 */
export const useFormValidation = <T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> => {
  const {
    initialData,
    validationRules = [],
    customValidator,
    validateOnChange = false
  } = options;

  const [formData, setFormDataState] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasValidated, setHasValidated] = useState(false);

  const validateData = useCallback((data: T): ValidationResult => {
    if (customValidator) {
      return customValidator(data);
    }

    if (validationRules.length > 0) {
      return validateWithRules(data, validationRules);
    }

    // No validation rules provided, assume valid
    return { isValid: true, errors: {} };
  }, [customValidator, validationRules]);

  const validate = useCallback((): boolean => {
    const result = validateData(formData);
    setErrors(result.errors);
    setHasValidated(true);
    return result.isValid;
  }, [formData, validateData]);

  const setFormData = useCallback((data: T | ((prev: T) => T)) => {
    const newData = typeof data === 'function' ? data(formData) : data;
    setFormDataState(newData);

    // Validate on change if enabled
    if (validateOnChange && hasValidated) {
      const result = validateData(newData);
      setErrors(result.errors);
    }
  }, [formData, validateOnChange, hasValidated, validateData]);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setHasValidated(false);
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormDataState(initialData);
    clearErrors();
  }, [initialData, clearErrors]);

  const getFieldError = useCallback((field: keyof T): string | undefined => {
    return errors[field as string];
  }, [errors]);

  const hasFieldError = useCallback((field: keyof T): boolean => {
    return Boolean(errors[field as string]);
  }, [errors]);

  const getFieldClassName = useCallback((baseClassName: string, field: keyof T): string => {
    const hasError = hasFieldError(field);
    return hasError ? `${baseClassName} error` : baseClassName;
  }, [hasFieldError]);

  const isValid = Object.keys(errors).length === 0;

  return {
    formData,
    errors,
    isValid,
    hasValidated,
    setFormData,
    updateField,
    validate,
    clearErrors,
    clearFieldError,
    resetForm,
    getFieldError,
    hasFieldError,
    getFieldClassName
  };
};

/**
 * Convenience hook for forms with pre-built entity validators
 */
export const useEntityFormValidation = <T extends Record<string, any>>(
  initialData: T,
  entityValidator: (data: T) => ValidationResult,
  options: Omit<UseFormValidationOptions<T>, 'initialData' | 'customValidator'> = {}
): UseFormValidationReturn<T> => {
  return useFormValidation({
    initialData,
    customValidator: entityValidator,
    ...options
  });
};