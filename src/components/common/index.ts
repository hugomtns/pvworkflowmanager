/**
 * Common Components Index
 * Centralized exports for all reusable base components
 */

// Base form components
export { default as BaseButton } from './BaseButton';
export { default as BaseInput } from './BaseInput';
export { default as BaseSelect } from './BaseSelect';
export { default as BaseModal } from './BaseModal';

// Data display components
export { default as StatusBadge } from './StatusBadge';

// Type exports
export type { BaseButtonProps, ButtonVariant, ButtonSize } from './BaseButton';
export type { BaseInputProps } from './BaseInput';
export type { BaseSelectProps, SelectOption } from './BaseSelect';
export type { BaseModalProps } from './BaseModal';
export type { StatusBadgeProps } from './StatusBadge';