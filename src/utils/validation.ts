/**
 * Validation utilities for PV Workflow Manager
 * Consolidated validation logic to reduce code duplication
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validation rule interface
 */
export interface ValidationRule<T = any> {
  field: keyof T;
  message: string;
  validate: (value: any, data?: T) => boolean;
}

/**
 * Generic validation utilities
 */

/**
 * Run multiple validation rules against data
 */
export const validateWithRules = <T>(
  data: T,
  rules: ValidationRule<T>[]
): ValidationResult => {
  const errors: Record<string, string> = {};

  rules.forEach(rule => {
    const value = data[rule.field];
    if (!rule.validate(value, data)) {
      errors[rule.field as string] = rule.message;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Common validation functions
 */

/**
 * Check if a value is required (not empty, null, or undefined)
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

/**
 * Check if a string meets minimum length requirement
 */
export const minLength = (minLen: number) => (value: string): boolean => {
  if (!value) return false;
  return value.trim().length >= minLen;
};

/**
 * Check if a string meets maximum length requirement
 */
export const maxLength = (maxLen: number) => (value: string): boolean => {
  if (!value) return true; // Allow empty for max length checks
  return value.trim().length <= maxLen;
};

/**
 * Check if an array has minimum number of items
 */
export const minItems = (minCount: number) => (value: any[]): boolean => {
  if (!Array.isArray(value)) return false;
  return value.length >= minCount;
};

/**
 * Check if an array has maximum number of items
 */
export const maxItems = (maxCount: number) => (value: any[]): boolean => {
  if (!Array.isArray(value)) return true; // Allow empty for max checks
  return value.length <= maxCount;
};

/**
 * Check if a value is a valid email
 */
export const isValidEmail = (value: string): boolean => {
  if (!value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Check if a value is a valid URL
 */
export const isValidUrl = (value: string): boolean => {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if a value is a valid date
 */
export const isValidDate = (value: any): boolean => {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Check if a date is in the future
 */
export const isFutureDate = (value: any): boolean => {
  if (!isValidDate(value)) return false;
  const date = new Date(value);
  return date > new Date();
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (value: any): boolean => {
  if (!isValidDate(value)) return false;
  const date = new Date(value);
  return date < new Date();
};

/**
 * Domain-specific validation rules
 */

/**
 * Validation rules for Status entities
 */
export const statusValidationRules = {
  name: {
    required: {
      field: 'name' as const,
      message: 'Status name is required',
      validate: isRequired
    },
    minLength: {
      field: 'name' as const,
      message: 'Status name must be at least 2 characters',
      validate: minLength(2)
    },
    maxLength: {
      field: 'name' as const,
      message: 'Status name must be no more than 50 characters',
      validate: maxLength(50)
    }
  },
  description: {
    required: {
      field: 'description' as const,
      message: 'Description is required',
      validate: isRequired
    },
    minLength: {
      field: 'description' as const,
      message: 'Description must be at least 10 characters',
      validate: minLength(10)
    },
    maxLength: {
      field: 'description' as const,
      message: 'Description must be no more than 500 characters',
      validate: maxLength(500)
    }
  },
  entityTypes: {
    required: {
      field: 'entityTypes' as const,
      message: 'At least one entity type must be selected',
      validate: minItems(1)
    }
  }
};

/**
 * Validation rules for Task entities
 */
export const taskValidationRules = {
  name: {
    required: {
      field: 'name' as const,
      message: 'Task name is required',
      validate: isRequired
    },
    maxLength: {
      field: 'name' as const,
      message: 'Task name must be no more than 100 characters',
      validate: maxLength(100)
    }
  },
  description: {
    required: {
      field: 'description' as const,
      message: 'Task goal is required',
      validate: isRequired
    },
    maxLength: {
      field: 'description' as const,
      message: 'Task goal must be no more than 500 characters',
      validate: maxLength(500)
    }
  },
  assignedUserId: {
    required: {
      field: 'assignedUserId' as const,
      message: 'Assigned user is required',
      validate: isRequired
    }
  },
  deadline: {
    required: {
      field: 'deadline' as const,
      message: 'Deadline is required',
      validate: isRequired
    },
    validDate: {
      field: 'deadline' as const,
      message: 'Please enter a valid date',
      validate: isValidDate
    }
  },
  transitionId: {
    required: {
      field: 'transitionId' as const,
      message: 'Transition is required',
      validate: isRequired
    }
  }
};

/**
 * Validation rules for Workflow entities
 */
export const workflowValidationRules = {
  name: {
    required: {
      field: 'name' as const,
      message: 'Workflow name is required',
      validate: isRequired
    },
    minLength: {
      field: 'name' as const,
      message: 'Workflow name must be at least 3 characters',
      validate: minLength(3)
    },
    maxLength: {
      field: 'name' as const,
      message: 'Workflow name must be no more than 100 characters',
      validate: maxLength(100)
    }
  },
  description: {
    required: {
      field: 'description' as const,
      message: 'Description is required',
      validate: isRequired
    },
    minLength: {
      field: 'description' as const,
      message: 'Description must be at least 10 characters',
      validate: minLength(10)
    },
    maxLength: {
      field: 'description' as const,
      message: 'Description must be no more than 500 characters',
      validate: maxLength(500)
    }
  },
  statuses: {
    minItems: {
      field: 'statuses' as const,
      message: 'At least 2 statuses must be selected for the workflow',
      validate: minItems(2)
    }
  }
};

/**
 * Validation rules for Transition entities
 */
export const transitionValidationRules = {
  fromStatusId: {
    required: {
      field: 'fromStatusId' as const,
      message: 'Select a from status',
      validate: isRequired
    }
  },
  toStatusId: {
    required: {
      field: 'toStatusId' as const,
      message: 'Select a to status',
      validate: isRequired
    }
  },
  differentStatuses: {
    field: 'toStatusId' as const,
    message: 'From and To cannot be the same',
    validate: (toStatusId: string, data: any) => {
      if (!data?.fromStatusId || !toStatusId) return true;
      return data.fromStatusId !== toStatusId;
    }
  },
  approvalRequirement: {
    field: 'requiresApproval' as const,
    message: 'Select at least one role or user when approval is required',
    validate: (requiresApproval: boolean, data: any) => {
      if (!requiresApproval) return true;
      const hasRoles = data?.approverRoles?.length > 0;
      const hasUsers = data?.approverUserIds?.length > 0;
      return hasRoles || hasUsers;
    }
  }
};

/**
 * Pre-built validation functions for common entities
 */

/**
 * Validate a Status entity
 */
export const validateStatus = (status: any): ValidationResult => {
  const rules = [
    statusValidationRules.name.required,
    statusValidationRules.name.minLength,
    statusValidationRules.name.maxLength,
    statusValidationRules.description.required,
    statusValidationRules.description.minLength,
    statusValidationRules.description.maxLength,
    statusValidationRules.entityTypes.required
  ];

  return validateWithRules(status, rules);
};

/**
 * Validate a Task entity
 */
export const validateTask = (task: any): ValidationResult => {
  const rules = [
    taskValidationRules.name.required,
    taskValidationRules.name.maxLength,
    taskValidationRules.description.required,
    taskValidationRules.description.maxLength,
    taskValidationRules.assignedUserId.required,
    taskValidationRules.deadline.required,
    taskValidationRules.deadline.validDate,
    taskValidationRules.transitionId.required
  ];

  return validateWithRules(task, rules);
};

/**
 * Validate a Workflow entity
 */
export const validateWorkflow = (workflow: any): ValidationResult => {
  const rules = [
    workflowValidationRules.name.required,
    workflowValidationRules.name.minLength,
    workflowValidationRules.name.maxLength,
    workflowValidationRules.description.required,
    workflowValidationRules.description.minLength,
    workflowValidationRules.description.maxLength,
    workflowValidationRules.statuses.minItems
  ];

  return validateWithRules(workflow, rules);
};

/**
 * Validate a Transition entity
 */
export const validateTransition = (transition: any): ValidationResult => {
  const rules = [
    transitionValidationRules.fromStatusId.required,
    transitionValidationRules.toStatusId.required,
    transitionValidationRules.differentStatuses,
    transitionValidationRules.approvalRequirement
  ];

  return validateWithRules(transition, rules);
};

/**
 * Validation rules for Project entities
 */
const projectValidationRules = {
  title: {
    required: {
      field: 'title' as const,
      message: 'Project title is required',
      validate: isRequired
    },
    minLength: {
      field: 'title' as const,
      message: 'Project title must be at least 3 characters',
      validate: minLength(3)
    },
    maxLength: {
      field: 'title' as const,
      message: 'Project title must be no more than 100 characters',
      validate: maxLength(100)
    }
  },
  description: {
    required: {
      field: 'description' as const,
      message: 'Project description is required',
      validate: isRequired
    },
    minLength: {
      field: 'description' as const,
      message: 'Project description must be at least 10 characters',
      validate: minLength(10)
    },
    maxLength: {
      field: 'description' as const,
      message: 'Project description must be no more than 500 characters',
      validate: maxLength(500)
    }
  },
  workflowId: {
    required: {
      field: 'workflowId' as const,
      message: 'Workflow selection is required',
      validate: isRequired
    }
  },
  creator: {
    required: {
      field: 'creator' as const,
      message: 'Project creator is required',
      validate: isRequired
    }
  }
};

/**
 * Validate a Project entity
 */
export const validateProject = (project: any): ValidationResult => {
  const rules = [
    projectValidationRules.title.required,
    projectValidationRules.title.minLength,
    projectValidationRules.title.maxLength,
    projectValidationRules.description.required,
    projectValidationRules.description.minLength,
    projectValidationRules.description.maxLength,
    projectValidationRules.workflowId.required,
    projectValidationRules.creator.required
  ];

  return validateWithRules(project, rules);
};

/**
 * Helper function to convert ValidationResult to form error format
 */
export const validationResultToFormErrors = (result: ValidationResult): Record<string, string> => {
  return result.errors;
};

/**
 * Helper function to check if validation result has errors
 */
export const hasValidationErrors = (result: ValidationResult): boolean => {
  return !result.isValid;
};