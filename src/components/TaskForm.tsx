import React, { useState } from 'react';
import type { Task, User, Transition } from '../types';
import { validateTask, validationResultToFormErrors } from '../utils/validation';

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
    const result = validateTask(form);
    return validationResultToFormErrors(result);
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
    <form onSubmit={handleSubmit} className="task-form form">
      <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>

      <div className="form-field">
        <label className="form-label required">Name</label>
        <input
          value={form.name || ''}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className={`form-input ${errors.name ? 'error' : ''}`}
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-field">
        <label className="form-label required">Goal</label>
        <input
          value={form.description || ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className={`form-input ${errors.description ? 'error' : ''}`}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </div>

      <div className="form-field">
        <label className="form-label required">Assigned User</label>
        <select
          value={form.assignedUserId || ''}
          onChange={e => setForm(f => ({ ...f, assignedUserId: e.target.value }))}
          className={`form-select ${errors.assignedUserId ? 'error' : ''}`}
        >
          <option value="">Select user</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        {errors.assignedUserId && <span className="form-error">{errors.assignedUserId}</span>}
      </div>

      <div className="form-field">
        <label className="form-label required">Deadline</label>
        <input
          type="date"
          value={form.deadline ? (form.deadline instanceof Date ? form.deadline.toISOString().substring(0, 10) : form.deadline) : ''}
          onChange={e => setForm(f => ({ ...f, deadline: e.target.value ? new Date(e.target.value) : undefined }))}
          className={`form-date ${errors.deadline ? 'error' : ''}`}
        />
        {errors.deadline && <span className="form-error">{errors.deadline}</span>}
      </div>

      <div className="form-field">
        <label className="form-label required">Transition</label>
        <select
          value={form.transitionId || ''}
          onChange={e => setForm(f => ({ ...f, transitionId: e.target.value }))}
          className={`form-select ${errors.transitionId ? 'error' : ''}`}
        >
          <option value="">Select transition</option>
          {transitions.map(tr => (
            <option key={tr.id} value={tr.id}>{tr.id}</option>
          ))}
        </select>
        {errors.transitionId && <span className="form-error">{errors.transitionId}</span>}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-cancel btn-md">Cancel</button>
        <button type="submit" className="btn btn-primary btn-md">{task ? 'Update' : 'Create'}</button>
      </div>
    </form>
  );
};

export default TaskForm;
