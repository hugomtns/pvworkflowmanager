import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import type { Task } from '../types';

const UserTaskList: React.FC = () => {
  const { tasks, currentUser, updateTask, users } = useContext(AppContext);

  const userTasks = tasks.filter(
    t => t.assignedUserId === currentUser.id
  );

  const handleMarkDone = (task: Task) => {
    updateTask({
      ...task,
      isCompleted: true,
      completedAt: new Date(),
      completedBy: currentUser.id,
    });
  };

  return (
    <div style={{ margin: '2rem 0' }}>
      <h2 style={{ color: '#1976d2', fontWeight: 600 }}>My Tasks</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #1976d220' }}>
        <thead>
          <tr style={{ background: '#e3f2fd' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>Task</th>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>Goal</th>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>Deadline</th>
            <th style={{ textAlign: 'center', padding: '0.75rem' }}>Status</th>
            <th style={{ textAlign: 'center', padding: '0.75rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userTasks.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#888' }}>No tasks assigned.</td></tr>
          )}
          {userTasks.map(task => (
            <tr key={task.id} style={{ borderBottom: '1px solid #e3e3e3', background: task.isCompleted ? '#f1f8e9' : '#fff' }}>
              <td style={{ padding: '0.75rem' }}>{task.name}</td>
              <td style={{ padding: '0.75rem' }}>{task.description}</td>
              <td style={{ padding: '0.75rem' }}>{task.deadline ? (task.deadline instanceof Date ? task.deadline.toLocaleDateString() : new Date(task.deadline).toLocaleDateString()) : '-'}</td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                {task.isCompleted
                  ? <span style={{ color: '#388e3c', fontWeight: 600 }}>Done<br /><small>{task.completedAt ? (task.completedAt instanceof Date ? task.completedAt.toLocaleDateString() : new Date(task.completedAt).toLocaleDateString()) : ''}</small></span>
                  : <span style={{ color: '#d32f2f', fontWeight: 600 }}>Pending</span>
                }
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                {!task.isCompleted && (
                  <button
                    onClick={() => handleMarkDone(task)}
                    style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 4, padding: '0.35rem 1.1rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 1px 4px #388e3c22', transition: 'background 0.15s' }}
                    onMouseOver={e => (e.currentTarget.style.background = '#256029')}
                    onMouseOut={e => (e.currentTarget.style.background = '#388e3c')}
                  >
                    Mark as Done
                  </button>
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
