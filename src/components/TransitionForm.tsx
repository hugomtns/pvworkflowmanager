import React, { useEffect, useMemo, useState } from 'react';
import type { Workflow, Status, Transition, User } from '../types';
import { userOperations } from '../data/dataAccess';

interface TransitionFormProps {
  workflow: Workflow;
  allStatuses: Status[];
  initial?: Transition; // if provided, edit mode
  onCancel: () => void;
  onSave: (transition: Transition) => void;
}

const TransitionForm: React.FC<TransitionFormProps> = ({ workflow, allStatuses, initial, onCancel, onSave }) => {
  const [fromStatusId, setFromStatusId] = useState<string>(initial?.fromStatusId || '');
  const [toStatusId, setToStatusId] = useState<string>(initial?.toStatusId || '');
  const [requiresApproval, setRequiresApproval] = useState<boolean>(initial?.requiresApproval || false);
  const [approverRoles, setApproverRoles] = useState<string[]>(initial?.approverRoles || []);
  const [approverUserIds, setApproverUserIds] = useState<string[]>(initial?.approverUserIds || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const workflowStatuses = useMemo(() => {
    const set = new Set(workflow.statuses);
    return allStatuses.filter(s => set.has(s.id));
  }, [workflow.statuses, allStatuses]);

  const users: User[] = userOperations.getAll();
  const roleOptions = ['admin', 'user'];

  useEffect(() => {
    if (!fromStatusId && workflowStatuses.length > 0) {
      setFromStatusId(workflowStatuses[0].id);
    }
    if (!toStatusId && workflowStatuses.length > 1) {
      setToStatusId(workflowStatuses[1].id);
    }
  }, [workflowStatuses, fromStatusId, toStatusId]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!fromStatusId) next.from = 'Select a from status';
    if (!toStatusId) next.to = 'Select a to status';
    if (fromStatusId && toStatusId && fromStatusId === toStatusId) next.same = 'From and To cannot be the same';
    if (requiresApproval && approverRoles.length === 0 && approverUserIds.length === 0) {
      next.approvers = 'Select at least one role or user';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const trans: Transition = {
      id: initial?.id || `trans-${Date.now()}`,
      fromStatusId,
      toStatusId,
      requiresApproval,
      approverRoles,
      approverUserIds,
      tasks: initial?.tasks || [],
      conditions: initial?.conditions || []
    };
    onSave(trans);
  };

  const toggleInArray = (arr: string[], value: string, setter: (v: string[]) => void) => {
    if (arr.includes(value)) setter(arr.filter(v => v !== value));
    else setter([...arr, value]);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '85vh',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: 0, marginBottom: '1rem' }}>{initial ? 'Edit Transition' : 'Add Transition'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>From</label>
              <select value={fromStatusId} onChange={(e) => setFromStatusId(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                {workflowStatuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>To</label>
              <select value={toStatusId} onChange={(e) => setToStatusId(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                {workflowStatuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} />
              <span style={{ fontWeight: 'bold' }}>Requires approval</span>
            </label>
          </div>

          {requiresApproval && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Approver roles</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {roleOptions.map(role => (
                    <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={approverRoles.includes(role)}
                        onChange={() => toggleInArray(approverRoles, role, setApproverRoles)}
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Approver users</div>
                <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem', maxHeight: '150px', overflow: 'auto' }}>
                  {users.map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={approverUserIds.includes(u.id)}
                        onChange={() => toggleInArray(approverUserIds, u.id, setApproverUserIds)}
                      />
                      <span>{u.name} ({u.role})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <div style={{ color: '#d32f2f', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {Object.values(errors).join(' · ')}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={onCancel} style={{ border: '1px solid #ddd', backgroundColor: 'white', padding: '0.5rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ backgroundColor: '#9c27b0', color: 'white', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}>{initial ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransitionForm;


