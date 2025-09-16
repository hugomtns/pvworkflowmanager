/**
 * StatusBadge Component
 * Reusable status display with color coding
 */

import React from 'react';
import type { Status } from '../../types';

export interface StatusBadgeProps {
  /** Status object with name and color */
  status: Status;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show full width */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether the badge is interactive (clickable) */
  interactive?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  interactive = false
}) => {
  const baseClasses = 'status-badge';
  const sizeClass = `status-badge-${size}`;
  const fullWidthClass = fullWidth ? 'status-badge-full-width' : '';
  const interactiveClass = (interactive || onClick) ? 'status-badge-interactive' : '';

  const classes = [
    baseClasses,
    sizeClass,
    fullWidthClass,
    interactiveClass,
    className
  ].filter(Boolean).join(' ');

  const style = {
    '--status-color': status.color,
    '--status-color-light': `${status.color}20`,
    '--status-color-dark': adjustColorBrightness(status.color, -20)
  } as React.CSSProperties;

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      className={classes}
      style={style}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      title={`Status: ${status.name}${status.description ? ` - ${status.description}` : ''}`}
    >
      <span className="status-badge-dot" />
      <span className="status-badge-text">{status.name}</span>
    </Component>
  );
};

/**
 * Utility function to adjust color brightness
 */
function adjustColorBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert to RGB
  const num = parseInt(hex, 16);
  const r = (num >> 16) + percent;
  const g = (num >> 8 & 0x00FF) + percent;
  const b = (num & 0x0000FF) + percent;

  // Ensure values stay within bounds
  const newR = Math.min(255, Math.max(0, r));
  const newG = Math.min(255, Math.max(0, g));
  const newB = Math.min(255, Math.max(0, b));

  return `#${(newR << 16 | newG << 8 | newB).toString(16).padStart(6, '0')}`;
}

export default StatusBadge;