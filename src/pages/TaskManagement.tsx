import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import TaskForm from '../components/TaskForm';
import type { Task } from '../types';

const TaskManagement: React.FC = () => {
  const { tasks, workflows, users, transitions, addTask, updateTask, deleteTask, isAdmin } = useContext(AppContext);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ completion: '', search: '' });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const completionMatch = !filters.completion || (filters.completion === 'complete' ? task.isCompleted : !task.isCompleted);
      const searchMatch = !filters.search || task.name.toLowerCase().includes(filters.search.toLowerCase());
      return completionMatch && searchMatch;
    });
  }, [tasks, filters]);

  if (!isAdmin) return <div>Access denied.</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#1976d2', fontWeight: 700, marginBottom: '1.5rem', fontSize: '2rem' }}>Task Management</h1>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <select
          value={filters.completion}
          onChange={e => setFilters(f => ({ ...f, completion: e.target.value }))}
          style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #bbb', background: '#fff' }}
        >
          <option value="">All</option>
          <option value="complete">Complete</option>
          <option value="incomplete">Incomplete</option>
        </select>
        <input
          type="text"
          placeholder="Search by name..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #bbb', flex: 1, minWidth: 200 }}
        />
        <button
          onClick={() => { setSelectedTask(null); setShowForm(true); }}
          style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 1px 4px #1976d220' }}
        >
          New Task
        </button>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: 8, boxShadow: '0 2px 8px #1976d220', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ background: '#e3f2fd' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 700, color: '#1976d2', fontSize: '1rem' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 700, color: '#1976d2', fontSize: '1rem' }}>Goal</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 700, color: '#1976d2', fontSize: '1rem' }}>Assigned User</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 700, color: '#1976d2', fontSize: '1rem' }}>Deadline</th>
              <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: 700, color: '#1976d2', fontSize: '1rem' }}>Completed</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 700, color: '#1976d2', fontSize: '1rem' }}>Transition</th>
              <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: 700, color: '#1976d2', fontSize: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => {
              const transition = transitions.find(tr => tr.id === task.transitionId);
              const user = users.find(u => u.id === task.assignedUserId);
              return (
                <tr key={task.id} style={{ borderBottom: '1px solid #e3e3e3', background: task.isCompleted ? '#f1f8e9' : '#fff' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>{task.name}</td>
                  <td style={{ padding: '0.75rem', color: '#333' }}>{task.description}</td>
                  <td style={{ padding: '0.75rem' }}>{user ? user.name : '-'}</td>
                  <td style={{ padding: '0.75rem' }}>{task.deadline ? (task.deadline instanceof Date ? task.deadline.toLocaleDateString() : new Date(task.deadline).toLocaleDateString()) : '-'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {task.isCompleted ? <span style={{ color: '#388e3c', fontWeight: 600 }}>Yes</span> : <span style={{ color: '#d32f2f', fontWeight: 600 }}>No</span>}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{transition ? transition.id : '-'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => { setSelectedTask(task); setShowForm(true); }}
                        style={{
                          background: '#1976d2',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          padding: '0.35rem 1.1rem',
                          fontWeight: 600,
                          fontSize: '1rem',
                          cursor: 'pointer',
                          boxShadow: '0 1px 4px #1976d220',
                          transition: 'background 0.15s',
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = '#1565c0')}
                        onMouseOut={e => (e.currentTarget.style.background = '#1976d2')}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          background: '#fff',
                          color: '#d32f2f',
                          border: '1.5px solid #d32f2f',
                          borderRadius: 4,
                          padding: '0.35rem 1.1rem',
                          fontWeight: 600,
                          fontSize: '1rem',
                          cursor: 'pointer',
                          boxShadow: '0 1px 4px #d32f2f22',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = '#d32f2f';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.color = '#d32f2f';
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showForm && (
        <TaskForm
          task={selectedTask}
          users={users}
          transitions={transitions}
          onSave={(task: Task) => {
            selectedTask ? updateTask(task) : addTask(task);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default TaskManagement;
