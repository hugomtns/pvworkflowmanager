import type { Transition, User } from '../types';

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

export const canUserExecuteTransition = (user: User, transition: Transition): PermissionCheckResult => {
  if (!transition.requiresApproval) {
    return { allowed: true };
  }
  const roleAllowed = (transition.approverRoles || []).includes(user.role);
  const userAllowed = (transition.approverUserIds || []).includes(user.id);
  if (roleAllowed || userAllowed) {
    return { allowed: true };
  }
  return { allowed: false, reason: 'You do not have permission to execute this approval-required transition.' };
};


