import type { Workflow, Transition, Status } from '../types';

export interface NextTransitionOption {
  transition: Transition;
  toStatus: Status | undefined;
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
    .map(t => ({ transition: t, toStatus: idToStatus[t.toStatusId] }));
};

export const describeTransitionRequirements = (t: Transition, idToUserName?: Record<string, string>) => {
  const approverUsers = (t.approverUserIds || []).map(id => idToUserName?.[id] || id);
  return {
    requiresApproval: t.requiresApproval,
    approverRoles: t.approverRoles || [],
    approverUsers
  };
};


