import React, { useState } from 'react';
import type { Task, User, Transition } from '../types';
import { validateTask } from '../utils/validation';
import { useEntityFormValidation } from '../hooks/useFormValidation';

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
  const initialData = initialState(task);

  const {
    formData,
    errors,
    validate,
    updateField,
    getFieldClassName,
    hasFieldError,
    getFieldError
  } = useEntityFormValidation(initialData as Partial<Task>, validateTask);

  React.useEffect(() => {
    console.log('TaskForm mounted', task?.id);
    return () => { console.log('TaskForm unmounted', task?.id); };
  }, [task?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSave({
        ...formData,
        id: task?.id || Date.now().toString(),
        deadline: formData.deadline instanceof Date ? formData.deadline : (formData.deadline ? new Date(formData.deadline) : undefined),
      } as Task);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form form">
      <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>

      <div className="form-field">
        <label className="form-label required">Name</label>
        <input
          value={formData.name || ''}
          onChange={e => updateField('name', e.target.value)}
          className={getFieldClassName('form-input', 'name')}
        />
        {hasFieldError('name') && <span className="form-error">{getFieldError('name')}</span>}
      </div>

      <div className="form-field">
        <label className="form-label required">Goal</label>
        <input
          value={formData.description || ''}
          onChange={e => updateField('description', e.target.value)}
          className={getFieldClassName('form-input', 'description')}
        />
        {hasFieldError('description') && <span className="form-error">{getFieldError('description')}</span>}
      </div>

      <div className="form-field">
        <label className="form-label required">Assigned User</label>
        <select
          value={formData.assignedUserId || ''}
          onChange={e => updateField('assignedUserId', e.target.value)}
          className={getFieldClassName('form-select', 'assignedUserId')}
        >
          <option value="">Select user</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        {hasFieldError('assignedUserId') && <span className="form-error">{getFieldError('assignedUserId')}</span>}
      </div>

      <div className="form-field">
        <label className="form-label required">Deadline</label>
        <input
          type="date"
          value={formData.deadline ? (formData.deadline instanceof Date ? formData.deadline.toISOString().substring(0, 10) : formData.deadline) : ''}
          onChange={e => updateField('deadline', e.target.value ? new Date(e.target.value) : undefined)}
          className={getFieldClassName('form-date', 'deadline')}
        />
        {hasFieldError('deadline') && <span className="form-error">{getFieldError('deadline')}</span>}
      </div>

      <div className="form-field">
        <label className="form-label required">Transition</label>
        <select
          value={formData.transitionId || ''}
          onChange={e => updateField('transitionId', e.target.value)}
          className={getFieldClassName('form-select', 'transitionId')}
        >
          <option value="">Select transition</option>
          {transitions.map(tr => (
            <option key={tr.id} value={tr.id}>{tr.id}</option>
          ))}
        </select>
        {hasFieldError('transitionId') && <span className="form-error">{getFieldError('transitionId')}</span>}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-cancel btn-md">Cancel</button>
        <button type="submit" className="btn btn-primary btn-md">{task ? 'Update' : 'Create'}</button>
      </div>
    </form>
  );
};

export default TaskForm;
