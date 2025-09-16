/**
 * BaseModal Component
 * Standardized modal wrapper with overlay and keyboard handling
 */

import React from 'react';
import { useModal } from '../../hooks/useModal';
import type { UseModalOptions } from '../../hooks/useModal';

export interface BaseModalProps extends UseModalOptions {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Modal type for styling */
  type?: 'default' | 'form' | 'status' | 'task';
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Additional class names for the modal container */
  className?: string;
  /** Additional class names for the modal overlay */
  overlayClassName?: string;
  /** Content to render in the modal */
  children: React.ReactNode;
  /** Footer content (buttons, actions, etc.) */
  footer?: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  type = 'default',
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  children,
  footer,
  closeOnEscape = true,
  closeOnBackdrop = true,
  preventBodyScroll = true,
  ...modalOptions
}) => {
  const { backdropProps, modalProps } = useModal({
    closeOnEscape,
    closeOnBackdrop,
    preventBodyScroll,
    onClose,
    ...modalOptions
  });

  if (!isOpen) {
    return null;
  }

  const overlayClasses = [
    'modal-overlay',
    overlayClassName
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'modal-container',
    `modal-${type}`,
    `modal-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={overlayClasses} {...backdropProps}>
      <div className={containerClasses} {...modalProps}>
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h3 className="modal-title">{title}</h3>}
            {showCloseButton && (
              <button
                type="button"
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div className="modal-content">
          {children}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;