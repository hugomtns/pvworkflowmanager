import React, { useMemo, useState, useContext } from 'react';
import type { Project, Workflow, Status, User, Transition } from '../types';
import { getValidNextTransitions, describeTransitionRequirements, canUserTransition } from '../utils/transitionRules';
import type { NextTransitionOption } from '../utils/transitionRules';
import { AppContext } from '../context/AppContext';

interface StatusChangeModalProps {
  project: Project;
  workflow: Workflow | undefined;
  statuses: Status[];
  currentUser: User;
  onCancel: () => void;
  onConfirm: (transition: Transition) => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({ project, workflow, statuses, currentUser, onCancel, onConfirm }) => {
  const options: NextTransitionOption[] = useMemo(() => {
    return getValidNextTransitions(workflow, project.currentStatusId, statuses);
  }, [workflow, project.currentStatusId, statuses]);

  const [selectedId, setSelectedId] = useState<string>(options[0]?.transition.id || '');
  const [error, setError] = useState<string | undefined>(undefined);

  const selected = options.find(o => o.transition.id === selectedId);

  const { users } = useContext(AppContext);

  const idToUserName = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach(u => { map[u.id] = u.name; });
    return map;
  }, [users]);

  const req = selected ? describeTransitionRequirements(selected.transition, idToUserName) : undefined;
  const incompleteTasks = selected?.incompleteTasks || [];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
    }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '90%', maxWidth: '560px', padding: '1.25rem' }}>
        <h3 style={{ margin: 0, marginBottom: '0.75rem' }}>Change Status</h3>
        {options.length === 0 ? (
          <div style={{
            backgroundColor: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.75rem'
          }}>
            No valid next statuses from current status.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Select next status</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                {options.map(o => (
                  <option key={o.transition.id} value={o.transition.id}>
                    {o.toStatus?.name || o.transition.toStatusId}
                  </option>
                ))}
              </select>
            </div>

            {selected && (
              <div style={{
                border: '1px solid #eee', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.75rem', backgroundColor: '#fafafa'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Transition requirements</div>
                {!req?.requiresApproval ? (
                  <div style={{ color: '#2e7d32' }}>No approval required</div>
                ) : (
                  <div>
                    <div style={{ color: '#b71c1c', fontWeight: 600, marginBottom: '0.25rem' }}>Approval required</div>
                    <div style={{ fontSize: '0.9rem', color: '#555' }}>
                      Roles: {req.approverRoles.join(', ') || '—'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#555' }}>
                      Users: {req.approverUsers.join(', ') || '—'}
                    </div>
                  </div>
                )}

                {/* Task blocking info */}
                {selected.blockedByTasks ? (
                  <div style={{ marginTop: 12, background: '#fff3f3', border: '1px solid #ffd6d6', padding: 8, borderRadius: 6 }}>
                    <div style={{ fontWeight: 700, color: '#b71c1c', marginBottom: 6 }}>Blocked by incomplete required tasks</div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                      {incompleteTasks.map(task => (
                        <li key={task.id} style={{ fontSize: '0.95rem', color: '#333' }}>
                          {task.name} — <em style={{ color: '#555' }}>{idToUserName[task.assignedUserId] || task.assignedUserId}</em>
                        </li>
                      ))}
                    </ul>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: 8 }}>Complete the required tasks before performing this transition.</div>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fdecea', border: '1px solid #f5c2c0', color: '#b71c1c', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.5rem'
          }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button onClick={onCancel} style={{ border: '1px solid #ddd', backgroundColor: 'white', padding: '0.5rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          <button
            disabled={!selected || !!selected.blockedByTasks}
            onClick={() => {
              if (!selected) return;
              if (!currentUser) {
                setError('No current user available.');
                return;
              }
              const perm = canUserTransition(currentUser, selected.transition, !!selected.blockedByTasks);
              if (!perm.allowed) {
                setError(perm.reason || 'You are not allowed to perform this transition.');
                return;
              }
              setError(undefined);
              onConfirm(selected.transition);
            }}
            style={{ backgroundColor: '#9c27b0', color: 'white', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '4px', cursor: 'pointer', opacity: (!selected || !!selected.blockedByTasks) ? 0.6 : 1 }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;


