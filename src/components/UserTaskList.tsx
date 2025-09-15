import React, { useContext } from 'react';
import type { Project } from '../types';
import { AppContext } from '../context/AppContext';
import { taskOperations } from '../data/dataAccess';

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
};

const UserTaskList: React.FC<{ project?: Project }> = ({ project }) => {
  const { tasks, currentUser, isAdmin, users, setTasks, workflows } = useContext(AppContext);

  // Determine relevant transitions for the project (if provided)
  const workflow = project ? workflows.find(wf => wf.id === project.workflowId) as any : undefined;
  const possibleTransitions = workflow ? workflow.transitions.filter((tr: any) => tr.fromStatusId === project!.currentStatusId) : [];
  const relevantTransitionIds = possibleTransitions.map((t: any) => t.id);

  // Filter tasks: assigned to current user or admin; if project provided, only tasks for that project's next transitions
  const visibleTasks = tasks.filter((task: any) => {
    const assignedOk = task.assignedUserId === currentUser.id || isAdmin;
    const transitionOk = project ? relevantTransitionIds.includes(task.transitionId) : true;
    return assignedOk && transitionOk;
  });

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || id;

  const handleMarkDone = (taskId: string) => {
    if (!currentUser) return;
    const updated = taskOperations.markCompleted(taskId, currentUser.id);
    if (updated) {
      // refresh context tasks from storage so UI stays in sync
      setTasks(taskOperations.getAll());
    } else {
      alert('Failed to mark task as completed');
    }
  };

  const handleUndo = (taskId: string) => {
    const updated = taskOperations.markIncomplete(taskId);
    if (updated) {
      setTasks(taskOperations.getAll());
    } else {
      alert('Failed to undo task completion');
    }
  };

  if (visibleTasks.length === 0) return null;

  return (
    <div style={{ margin: '1.2rem 0 0.5rem 0', background: '#f5fafd', borderRadius: 6, padding: '1rem', border: '1px solid #e3f2fd' }}>
      <div style={{ fontWeight: 600, color: '#1976d2', marginBottom: 8 }}>{project ? 'Pending Tasks for Next Transitions' : 'Your Tasks'}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'none' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Task</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Goal</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Deadline</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Assigned</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
            <th style={{ textAlign: 'center', padding: '0.5rem' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {visibleTasks.map((task: any) => (
            <tr key={task.id} style={{ borderBottom: '1px solid #e3e3e3' }}>
              <td style={{ padding: '0.5rem' }}>{task.name}</td>
              <td style={{ padding: '0.5rem' }}>{task.description}</td>
              <td style={{ padding: '0.5rem' }}>{task.deadline ? (task.deadline instanceof Date ? task.deadline.toLocaleDateString() : new Date(task.deadline).toLocaleDateString()) : '-'}</td>
              <td style={{ padding: '0.5rem' }}>{getUserName(task.assignedUserId)}</td>
              <td style={{ padding: '0.5rem' }}>{task.isCompleted ? `Completed ${formatDate(task.completedAt)}` : 'Pending'}</td>
              <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                {!task.isCompleted ? (
                  <button
                    onClick={() => handleMarkDone(task.id)}
                    style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 4, padding: '0.35rem 1.1rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 1px 4px #388e3c22', transition: 'background 0.15s' }}
                    onMouseOver={e => (e.currentTarget.style.background = '#256029')}
                    onMouseOut={e => (e.currentTarget.style.background = '#388e3c')}
                  >
                    Mark as Done
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#388e3c', fontWeight: 600 }}>Done</span>
                    <button
                      onClick={() => handleUndo(task.id)}
                      title="Undo completion"
                      style={{ background: '#fff', color: '#1976d2', border: '1px solid #1976d2', borderRadius: 4, padding: '0.25rem 0.6rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Undo
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTaskList;

