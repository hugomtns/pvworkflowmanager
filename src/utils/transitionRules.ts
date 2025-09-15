import type { Workflow, Transition, Status, Task } from '../types';
import { taskOperations } from '../data/dataAccess';

export interface NextTransitionOption {
  transition: Transition;
  toStatus: Status | undefined;
  // Tasks that are incomplete and required for this transition
  incompleteTasks?: Task[];
  // whether the transition is blocked due to incomplete required tasks
  blockedByTasks?: boolean;
}

export const getValidNextTransitions = (
  workflow: Workflow | undefined,
  currentStatusId: string,
  statuses: Status[]
): NextTransitionOption[] => {
  if (!workflow) return [];
  const statusSet = new Set(workflow.statuses);
  const idToStatus: Record<string, Status> = {};
  statuses.forEach(s => { idToStatus[s.id] = s; });
  const candidates = (workflow.transitions || []).filter(t => t.fromStatusId === currentStatusId);
  // Only include transitions where the target status is part of the workflow
  return candidates
    .filter(t => statusSet.has(t.toStatusId))
    .map(t => {
      // find incomplete tasks for this transition
      const incompleteTasks = taskOperations.getIncompleteByTransitionId(t.id) || [];
      // consider only tasks that are marked as required (if that property exists on tasks)
      const requiredIncomplete = incompleteTasks.filter(task => task.isRequired);
      const blockedByTasks = requiredIncomplete.length > 0;
      return { transition: t, toStatus: idToStatus[t.toStatusId], incompleteTasks: requiredIncomplete, blockedByTasks };
    });
};

export const describeTransitionRequirements = (t: Transition, idToUserName?: Record<string, string>) => {
  const approverUsers = (t.approverUserIds || []).map(id => idToUserName?.[id] || id);
  return {
    requiresApproval: t.requiresApproval,
    approverRoles: t.approverRoles || [],
    approverUsers,
    // task requirements will be resolved by callers via getValidNextTransitions which returns incompleteTasks
  };
};

// Permission helper combining approval and task blocking rules
export const canUserTransition = (user: { id: string; role: string }, transition: Transition, blockedByTasks: boolean) => {
  if (blockedByTasks) {
    return { allowed: false, reason: 'Required tasks are incomplete for this transition.' };
  }
  // Admins bypass approval roles
  if (user.role === 'admin') return { allowed: true };

  // Otherwise check approval requirements
  if (!transition.requiresApproval) return { allowed: true };
  const roleAllowed = (transition.approverRoles || []).includes(user.role);
  const userAllowed = (transition.approverUserIds || []).includes(user.id);
  if (roleAllowed || userAllowed) return { allowed: true };
  return { allowed: false, reason: 'You do not have permission to execute this approval-required transition.' };
};


