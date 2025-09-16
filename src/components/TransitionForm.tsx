import React, { useEffect, useMemo, useState } from 'react';
import type { Workflow, Status, Transition, User } from '../types';
import { userOperations } from '../data/dataAccess';
import { validateTransition } from '../utils/validation';
import { useEntityFormValidation } from '../hooks/useFormValidation';

interface TransitionFormProps {
  workflow: Workflow;
  allStatuses: Status[];
  initial?: Transition; // if provided, edit mode
  onCancel: () => void;
  onSave: (transition: Transition) => void;
}

const TransitionForm: React.FC<TransitionFormProps> = ({ workflow, allStatuses, initial, onCancel, onSave }) => {
  const initialData = {
    fromStatusId: initial?.fromStatusId || '',
    toStatusId: initial?.toStatusId || '',
    requiresApproval: initial?.requiresApproval || false,
    approverRoles: initial?.approverRoles || [],
    approverUserIds: initial?.approverUserIds || [],
    id: initial?.id || `trans-${Date.now()}`,
    tasks: initial?.tasks || [],
    conditions: initial?.conditions || []
  };

  const {
    formData,
    errors,
    validate,
    updateField,
    getFieldClassName,
    hasFieldError,
    getFieldError
  } = useEntityFormValidation(initialData, validateTransition);

  const workflowStatuses = useMemo(() => {
    const set = new Set(workflow.statuses);
    return allStatuses.filter(s => set.has(s.id));
  }, [workflow.statuses, allStatuses]);

  const users: User[] = userOperations.getAll();
  const roleOptions = ['admin', 'user'];

  useEffect(() => {
    if (!formData.fromStatusId && workflowStatuses.length > 0) {
      updateField('fromStatusId', workflowStatuses[0].id);
    }
    if (!formData.toStatusId && workflowStatuses.length > 1) {
      updateField('toStatusId', workflowStatuses[1].id);
    }
  }, [workflowStatuses, formData.fromStatusId, formData.toStatusId, updateField]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const trans: Transition = {
        id: formData.id,
        fromStatusId: formData.fromStatusId,
        toStatusId: formData.toStatusId,
        requiresApproval: formData.requiresApproval,
        approverRoles: formData.approverRoles,
        approverUserIds: formData.approverUserIds,
        tasks: formData.tasks,
        conditions: formData.conditions
      };
      onSave(trans);
    }
  };

  const toggleInArray = (fieldName: keyof typeof formData, value: string) => {
    const arr = formData[fieldName] as string[];
    if (arr.includes(value)) {
      updateField(fieldName, arr.filter(v => v !== value));
    } else {
      updateField(fieldName, [...arr, value]);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container modal-form">
        <h3 className="modal-title">{initial ? 'Edit Transition' : 'Add Transition'}</h3>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-field">
              <label className="form-label required">From Status</label>
              <select
                value={formData.fromStatusId}
                onChange={(e) => updateField('fromStatusId', e.target.value)}
                className={getFieldClassName('form-select', 'fromStatusId')}
              >
                {workflowStatuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {hasFieldError('fromStatusId') && (
                <span className="form-error">{getFieldError('fromStatusId')}</span>
              )}
            </div>
            <div className="form-field">
              <label className="form-label required">To Status</label>
              <select
                value={formData.toStatusId}
                onChange={(e) => updateField('toStatusId', e.target.value)}
                className={getFieldClassName('form-select', 'toStatusId')}
              >
                {workflowStatuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {hasFieldError('toStatusId') && (
                <span className="form-error">{getFieldError('toStatusId')}</span>
              )}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label checkbox">
              <input
                type="checkbox"
                checked={formData.requiresApproval}
                onChange={(e) => updateField('requiresApproval', e.target.checked)}
                className="form-checkbox"
              />
              <span>Requires approval</span>
            </label>
          </div>

          {formData.requiresApproval && (
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Approver Roles</label>
                <div className="form-checkbox-group">
                  {roleOptions.map(role => (
                    <label key={role} className="form-label checkbox">
                      <input
                        type="checkbox"
                        checked={formData.approverRoles.includes(role)}
                        onChange={() => toggleInArray('approverRoles', role)}
                        className="form-checkbox"
                      />
                      <span style={{ textTransform: 'capitalize' }}>{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Approver Users</label>
                <div className="form-checkbox-scroll">
                  {users.map(u => (
                    <label key={u.id} className="form-label checkbox">
                      <input
                        type="checkbox"
                        checked={formData.approverUserIds.includes(u.id)}
                        onChange={() => toggleInArray('approverUserIds', u.id)}
                        className="form-checkbox"
                      />
                      <span>{u.name} ({u.role})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <div className="form-errors">
              {Object.values(errors).join(' · ')}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-cancel btn-lg">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg">
              {initial ? 'Save Transition' : 'Add Transition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransitionForm;


