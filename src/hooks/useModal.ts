/**
 * useModal Hook
 * Standardizes modal state management and keyboard handlers
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseModalOptions {
  /** Whether to close modal on Escape key press (default: true) */
  closeOnEscape?: boolean;
  /** Whether to close modal on backdrop click (default: true) */
  closeOnBackdrop?: boolean;
  /** Callback when modal is opened */
  onOpen?: () => void;
  /** Callback when modal is closed */
  onClose?: () => void;
  /** Whether to prevent body scroll when modal is open (default: true) */
  preventBodyScroll?: boolean;
}

export interface UseModalReturn {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Open the modal */
  openModal: () => void;
  /** Close the modal */
  closeModal: () => void;
  /** Toggle modal open/closed state */
  toggleModal: () => void;
  /** Props to spread on modal backdrop element */
  backdropProps: {
    onClick: (e: React.MouseEvent) => void;
    ref: React.RefObject<HTMLDivElement>;
  };
  /** Props to spread on modal container element */
  modalProps: {
    role: string;
    'aria-modal': boolean;
    tabIndex: -1;
  };
}

/**
 * Custom hook for modal management
 */
export const useModal = (options: UseModalOptions = {}): UseModalReturn => {
  const {
    closeOnEscape = true,
    closeOnBackdrop = true,
    onOpen,
    onClose,
    preventBodyScroll = true
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const openModal = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggleModal = useCallback(() => {
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  }, [isOpen, openModal, closeModal]);

  // Handle Escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, closeModal]);

  // Handle body scroll prevention
  useEffect(() => {
    if (!preventBodyScroll) return;

    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventBodyScroll]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (!closeOnBackdrop) return;

    if (e.target === e.currentTarget) {
      closeModal();
    }
  }, [closeOnBackdrop, closeModal]);

  const backdropProps = {
    onClick: handleBackdropClick,
    ref: backdropRef
  };

  const modalProps = {
    role: 'dialog',
    'aria-modal': true as const,
    tabIndex: -1
  };

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    backdropProps,
    modalProps
  };
};

/**
 * Extended modal hook with data management for edit/create modals
 */
export interface UseDataModalOptions<T> extends UseModalOptions {
  /** Initial data when creating */
  initialData?: T;
}

export interface UseDataModalReturn<T> extends UseModalReturn {
  /** Current modal mode */
  mode: 'create' | 'edit' | 'closed';
  /** Current data being edited (null for create mode) */
  data: T | null;
  /** Open modal in create mode */
  openCreateModal: (initialData?: T) => void;
  /** Open modal in edit mode */
  openEditModal: (data: T) => void;
  /** Whether the modal is in create mode */
  isCreateMode: boolean;
  /** Whether the modal is in edit mode */
  isEditMode: boolean;
}

/**
 * Modal hook with data management for edit/create scenarios
 */
export const useDataModal = <T>(
  options: UseDataModalOptions<T> = {}
): UseDataModalReturn<T> => {
  const { initialData, ...modalOptions } = options;
  const [data, setData] = useState<T | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'closed'>('closed');

  const modal = useModal({
    ...modalOptions,
    onClose: () => {
      setMode('closed');
      setData(null);
      modalOptions.onClose?.();
    }
  });

  const openCreateModal = useCallback((createData?: T) => {
    setMode('create');
    setData(createData || initialData || null);
    modal.openModal();
  }, [initialData, modal]);

  const openEditModal = useCallback((editData: T) => {
    setMode('edit');
    setData(editData);
    modal.openModal();
  }, [modal]);

  return {
    ...modal,
    mode: modal.isOpen ? mode : 'closed',
    data,
    openCreateModal,
    openEditModal,
    isCreateMode: modal.isOpen && mode === 'create',
    isEditMode: modal.isOpen && mode === 'edit'
  };
};

/**
 * Simple boolean modal hook for confirmation dialogs, etc.
 */
export interface UseBooleanModalReturn {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Open the modal */
  open: () => void;
  /** Close the modal */
  close: () => void;
  /** Toggle the modal */
  toggle: () => void;
}

/**
 * Simple boolean modal hook
 */
export const useBooleanModal = (initialState = false): UseBooleanModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};

/**
 * Modal hook for managing multiple related modals (e.g., different modals for a project)
 */
export interface UseMultiModalReturn<T extends string> {
  /** Currently open modal (null if none) */
  activeModal: T | null;
  /** Open a specific modal */
  openModal: (modalKey: T) => void;
  /** Close the currently active modal */
  closeModal: () => void;
  /** Check if a specific modal is open */
  isModalOpen: (modalKey: T) => boolean;
  /** Switch from one modal to another */
  switchModal: (fromModal: T, toModal: T) => void;
}

/**
 * Hook for managing multiple related modals
 */
export const useMultiModal = <T extends string>(
  options: UseModalOptions = {}
): UseMultiModalReturn<T> => {
  const [activeModal, setActiveModal] = useState<T | null>(null);

  // Setup keyboard handler for active modal
  useEffect(() => {
    if (!options.closeOnEscape || !activeModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        options.onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activeModal, options]);

  const openModal = useCallback((modalKey: T) => {
    setActiveModal(modalKey);
    options.onOpen?.();
  }, [options]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    options.onClose?.();
  }, [options]);

  const isModalOpen = useCallback((modalKey: T) => {
    return activeModal === modalKey;
  }, [activeModal]);

  const switchModal = useCallback((fromModal: T, toModal: T) => {
    if (activeModal === fromModal) {
      setActiveModal(toModal);
    }
  }, [activeModal]);

  return {
    activeModal,
    openModal,
    closeModal,
    isModalOpen,
    switchModal
  };
};