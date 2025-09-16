import React, { useMemo, useState, useContext } from 'react';
import type { Project, Workflow, Status, User, Transition } from '../types';
import { getValidNextTransitions, describeTransitionRequirements, canUserTransition } from '../utils/transitionRules';
import type { NextTransitionOption } from '../utils/transitionRules';
import { AppContext } from '../context/AppContext';
import { createUserNameMap } from '../utils/userHelpers';

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
    return createUserNameMap(users);
  }, [users]);

  const req = selected ? describeTransitionRequirements(selected.transition, idToUserName) : undefined;
  const incompleteTasks = selected?.incompleteTasks || [];

  return (
    <div className="modal-overlay">
      <div className="modal-container modal-status">
        <h3 className="modal-title">Change Status</h3>
        {options.length === 0 ? (
          <div className="modal-warning">
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
                  <div className="modal-task-blocked">
                    <div className="modal-task-blocked-title">Blocked by incomplete required tasks</div>
                    <ul>
                      {incompleteTasks.map(task => (
                        <li key={task.id}>
                          {task.name} — <em style={{ color: '#555' }}>{idToUserName[task.assignedUserId] || task.assignedUserId}</em>
                        </li>
                      ))}
                    </ul>
                    <div className="modal-task-blocked-note">Complete the required tasks before performing this transition.</div>
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
        <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-cancel btn-md">Cancel</button>
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
            className="btn btn-modal-primary btn-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;


