import type { Workflow, Transition } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const hasCycle = (statusIds: string[], transitions: Transition[]): boolean => {
  const graph: Record<string, string[]> = {};
  statusIds.forEach(id => { graph[id] = []; });
  transitions.forEach(t => {
    if (!graph[t.fromStatusId]) graph[t.fromStatusId] = [];
    graph[t.fromStatusId].push(t.toStatusId);
  });

  const visited: Record<string, 0 | 1 | 2> = {}; // 0=unvisited,1=visiting,2=done
  const nodes = Object.keys(graph);

  const dfs = (node: string): boolean => {
    if (visited[node] === 1) return true; // found back-edge
    if (visited[node] === 2) return false;
    visited[node] = 1;
    const neighbors = graph[node] || [];
    for (const nxt of neighbors) {
      if (dfs(nxt)) return true;
    }
    visited[node] = 2;
    return false;
  };

  for (const n of nodes) {
    if (!visited[n]) {
      if (dfs(n)) return true;
    }
  }
  return false;
};

export const hasDuplicateEdge = (
  transitions: Transition[],
  fromStatusId: string,
  toStatusId: string,
  ignoreId?: string
): boolean => {
  return transitions.some(t => t.fromStatusId === fromStatusId && t.toStatusId === toStatusId && t.id !== ignoreId);
};

export const hasStartAndEndNodes = (statusIds: string[], transitions: Transition[]): boolean => {
  if (statusIds.length <= 1) return true;
  if (transitions.length === 0) return false;
  const inDegree: Record<string, number> = {};
  const outDegree: Record<string, number> = {};
  statusIds.forEach(id => { inDegree[id] = 0; outDegree[id] = 0; });
  transitions.forEach(t => {
    outDegree[t.fromStatusId] = (outDegree[t.fromStatusId] || 0) + 1;
    inDegree[t.toStatusId] = (inDegree[t.toStatusId] || 0) + 1;
  });
  const hasStart = statusIds.some(id => inDegree[id] === 0 && outDegree[id] > 0);
  const hasEnd = statusIds.some(id => outDegree[id] === 0 && inDegree[id] > 0);
  return hasStart && hasEnd;
};

export const validateTransitionAgainstWorkflow = (
  workflow: Workflow,
  nextTransitions: Transition[],
  candidate: Transition,
  editingId?: string
): ValidationResult => {
  const errors: string[] = [];

  // Duplicate edge
  if (hasDuplicateEdge(nextTransitions, candidate.fromStatusId, candidate.toStatusId, editingId)) {
    errors.push('A transition with the same From → To already exists');
  }

  // Prevent cycles
  if (hasCycle(workflow.statuses, nextTransitions)) {
    errors.push('This change would create a circular dependency');
  }

  // Ensure at least one start and end node exist
  if (!hasStartAndEndNodes(workflow.statuses, nextTransitions)) {
    errors.push('Workflow must contain at least one start and one end status');
  }

  // Approver requirement
  if (candidate.requiresApproval && candidate.approverRoles.length === 0 && candidate.approverUserIds.length === 0) {
    errors.push('Approval required: select at least one approver role or user');
  }

  return { valid: errors.length === 0, errors };
};


