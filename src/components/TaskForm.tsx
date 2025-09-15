import React, { useState } from 'react';
import type { Task, User, Transition } from '../types';

interface TaskFormProps {
  task?: Task | null;
  users: User[];
  transitions: Transition[];
  onSave: (task: Task) => void;
  onCancel: () => void;
}

const initialState = (task?: Task | null): Partial<Task> => task ? { ...task } : {
  name: '',
  description: '',
  assignedUserId: '',
  deadline: undefined,
  transitionId: '',
  isRequired: true,
  isCompleted: false,
};

const TaskForm: React.FC<TaskFormProps> = ({ task, users, transitions, onSave, onCancel }) => {
  const [form, setForm] = useState<Partial<Task>>(initialState(task));
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    console.log('TaskForm mounted', task?.id);
    return () => { console.log('TaskForm unmounted', task?.id); };
  }, [task?.id]);

  const validate = () => {
    const errs: { [key: string]: string } = {};
  if (!form.name) errs.name = 'Name is required';
  if (!form.description) errs.description = 'Goal is required';
  if (!form.assignedUserId) errs.assignedUserId = 'Assigned user is required';
  if (!form.deadline) errs.deadline = 'Deadline is required';
  if (!form.transitionId) errs.transitionId = 'Transition is required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSave({
      ...form,
      id: task?.id || Date.now().toString(),
      deadline: form.deadline instanceof Date ? form.deadline : (form.deadline ? new Date(form.deadline) : undefined),
    } as Task);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h2>{task ? 'Edit Task' : 'New Task'}</h2>
      <label>
        Name
        <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        {errors.name && <span className="error">{errors.name}</span>}
      </label>
      <label>
        Goal
        <input value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        {errors.description && <span className="error">{errors.description}</span>}
      </label>
      <label>
        Assigned User
        <select value={form.assignedUserId || ''} onChange={e => setForm(f => ({ ...f, assignedUserId: e.target.value }))}>
          <option value="">Select user</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        {errors.assignedUserId && <span className="error">{errors.assignedUserId}</span>}
      </label>
      <label>
        Deadline
        <input
          type="date"
          value={form.deadline ? (form.deadline instanceof Date ? form.deadline.toISOString().substring(0, 10) : form.deadline) : ''}
          onChange={e => setForm(f => ({ ...f, deadline: e.target.value ? new Date(e.target.value) : undefined }))}
        />
        {errors.deadline && <span className="error">{errors.deadline}</span>}
      </label>
      <label>
        Transition
        <select value={form.transitionId || ''} onChange={e => setForm(f => ({ ...f, transitionId: e.target.value }))}>
          <option value="">Select transition</option>
          {transitions.map(tr => (
            <option key={tr.id} value={tr.id}>{tr.id}</option>
          ))}
        </select>
        {errors.transitionId && <span className="error">{errors.transitionId}</span>}
      </label>
      <div className="actions">
        <button type="submit">{task ? 'Update' : 'Create'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default TaskForm;
