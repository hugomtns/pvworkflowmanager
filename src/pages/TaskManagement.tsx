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
    <div className="task-management-page">
      <h1>Task Management</h1>
      <div className="filters">
        <select value={filters.completion} onChange={e => setFilters(f => ({ ...f, completion: e.target.value }))}>
          <option value="">All</option>
          <option value="complete">Complete</option>
          <option value="incomplete">Incomplete</option>
        </select>
        <input
          type="text"
          placeholder="Search by name..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        />
        <button onClick={() => { setSelectedTask(null); setShowForm(true); }}>New Task</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Goal</th>
            <th>Assigned User</th>
            <th>Deadline</th>
            <th>Completed</th>
            <th>Transition</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => {
            const transition = transitions.find(tr => tr.id === task.transitionId);
            const user = users.find(u => u.id === task.assignedUserId);
            return (
              <tr key={task.id}>
                <td>{task.name}</td>
                <td>{task.description}</td>
                <td>{user ? user.name : '-'}</td>
                <td>{task.deadline ? (task.deadline instanceof Date ? task.deadline.toLocaleDateString() : new Date(task.deadline).toLocaleDateString()) : '-'}</td>
                <td>{task.isCompleted ? 'Yes' : 'No'}</td>
                <td>{transition ? transition.id : '-'}</td>
                <td>
                  <button onClick={() => { setSelectedTask(task); setShowForm(true); }}>Edit</button>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
