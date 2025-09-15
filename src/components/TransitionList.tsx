import React from 'react';
import type { Workflow, Status, Transition } from '../types';
import { workflowOperations } from '../data/dataAccess';
import TransitionForm from './TransitionForm';
import { validateTransitionAgainstWorkflow } from '../utils/workflowValidation';

interface TransitionListProps {
  workflow: Workflow;
  allStatuses: Status[];
  onClose: () => void;
  onUpdated?: (updated: Workflow) => void;
}

const TransitionList: React.FC<TransitionListProps> = ({ workflow, allStatuses, onClose, onUpdated }) => {
  const [currentWorkflow, setCurrentWorkflow] = React.useState<Workflow>(() => {
    const latest = workflowOperations.getById(workflow.id);
    return latest || workflow;
  });
  const [showForm, setShowForm] = React.useState<{ mode: 'create' | 'edit'; transition?: Transition } | null>(null);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);

  React.useEffect(() => {
    const latest = workflowOperations.getById(workflow.id);
    if (latest) setCurrentWorkflow(latest);
  }, [workflow.id]);

  const statusIdToName = React.useMemo(() => {
    const map: Record<string, string> = {};
    allStatuses.forEach(s => { map[s.id] = s.name; });
    return map;
  }, [allStatuses]);

  const handleDelete = (transitionId: string) => {
    if (!window.confirm('Delete this transition?')) return;
    const remaining = (currentWorkflow.transitions || []).filter(t => t.id !== transitionId);
    const updated = workflowOperations.update(currentWorkflow.id, { transitions: remaining });
    if (!updated) {
      alert('Failed to delete transition.');
      return;
    }
    setCurrentWorkflow(updated);
    if (onUpdated) onUpdated(updated);
  };

  const transitions: Transition[] = currentWorkflow.transitions || [];
  const hasTransitions = transitions.length > 0;

  const handleCreate = (t: Transition) => {
    const next = [...(currentWorkflow.transitions || []), t];
    const validation = validateTransitionAgainstWorkflow(currentWorkflow, next, t);
    if (!validation.valid) {
      setErrorMessages(validation.errors);
      return;
    }
    const updated = workflowOperations.update(currentWorkflow.id, { transitions: next });
    if (!updated) {
      setErrorMessages(['Failed to add transition.']);
      return;
    }
    setCurrentWorkflow(updated);
    setShowForm(null);
    setErrorMessages([]);
    if (onUpdated) onUpdated(updated);
  };

  const handleEdit = (t: Transition) => {
    const next = (currentWorkflow.transitions || []).map(x => x.id === t.id ? t : x);
    const validation = validateTransitionAgainstWorkflow(currentWorkflow, next, t, t.id);
    if (!validation.valid) {
      setErrorMessages(validation.errors);
      return;
    }
    const updated = workflowOperations.update(currentWorkflow.id, { transitions: next });
    if (!updated) {
      setErrorMessages(['Failed to save transition.']);
      return;
    }
    setCurrentWorkflow(updated);
    setShowForm(null);
    setErrorMessages([]);
    if (onUpdated) onUpdated(updated);
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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '85vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Transitions — {currentWorkflow.name}</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              style={{
                backgroundColor: '#9c27b0',
                color: 'white',
                border: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => setShowForm({ mode: 'create' })}
            >
              + Add Transition
            </button>
            <button
              onClick={onClose}
              style={{
                border: '1px solid #ddd',
                backgroundColor: 'white',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {errorMessages.length > 0 && (
          <div style={{
            backgroundColor: '#fdecea',
            border: '1px solid #f5c2c0',
            color: '#b71c1c',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '0.75rem'
          }}>
            {errorMessages.map((e, i) => (
              <div key={i} style={{ fontSize: '0.9rem' }}>{e}</div>
            ))}
          </div>
        )}

        {!hasTransitions ? (
          <div style={{
            backgroundColor: '#f9f9f9',
            border: '1px solid #eee',
            borderRadius: '6px',
            padding: '1rem',
            textAlign: 'center',
            color: '#666'
          }}>
            No transitions configured yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {transitions.map(t => (
              <div
                key={t.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  alignItems: 'center',
                  gap: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'white'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#333' }}>
                    {statusIdToName[t.fromStatusId] || t.fromStatusId} → {statusIdToName[t.toStatusId] || t.toStatusId}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                    {t.requiresApproval ? (
                      <span style={{ color: '#d32f2f' }}>
                        Requires approval · Roles: {t.approverRoles.length} · Users: {t.approverUserIds.length}
                      </span>
                    ) : (
                      <span style={{ color: '#2e7d32' }}>No approval required</span>
                    )}
                  </div>
                </div>
                <button
                  style={{
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowForm({ mode: 'edit', transition: t })}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {showForm && (
        <TransitionForm
          workflow={currentWorkflow}
          allStatuses={allStatuses}
          initial={showForm.mode === 'edit' ? showForm.transition : undefined}
          onCancel={() => setShowForm(null)}
          onSave={(t) => showForm.mode === 'create' ? handleCreate(t) : handleEdit(t)}
        />
      )}
    </div>
  );
};

export default TransitionList;


