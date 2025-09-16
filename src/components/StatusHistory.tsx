import React from 'react';
import type { Project, Status, User } from '../types';

interface StatusHistoryProps {
  project: Project;
  statuses: Status[];
  users: User[];
  onClose: () => void;
}

const StatusHistory: React.FC<StatusHistoryProps> = React.memo(({ project, statuses, users, onClose }) => {
  const idToStatus: Record<string, Status> = React.useMemo(() => {
    const map: Record<string, Status> = {};
    statuses.forEach(s => { map[s.id] = s; });
    return map;
  }, [statuses]);

  const idToUser: Record<string, User> = React.useMemo(() => {
    const map: Record<string, User> = {};
    users.forEach(u => { map[u.id] = u; });
    return map;
  }, [users]);

  const entries = project.statusHistory || [];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '90%', maxWidth: '700px', padding: '1.25rem', maxHeight: '85vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0 }}>Status History — {project.title}</h3>
          <button onClick={onClose} style={{ border: '1px solid #ddd', backgroundColor: 'white', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
        </div>

        {entries.length === 0 ? (
          <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '6px', padding: '0.75rem', textAlign: 'center', color: '#666' }}>
            No history entries yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {entries.map(entry => {
              const fromName = entry.fromStatusId ? (idToStatus[entry.fromStatusId]?.name || entry.fromStatusId) : '—';
              const toName = idToStatus[entry.toStatusId]?.name || entry.toStatusId;
              const actor = idToUser[entry.userId]?.name || entry.userId;
              const approvedBy = entry.approvedBy ? (idToUser[entry.approvedBy]?.name || entry.approvedBy) : undefined;
              const when = new Date(entry.timestamp).toLocaleString();
              return (
                <div key={entry.id} style={{ border: '1px solid #e0e0e0', borderRadius: '6px', padding: '0.75rem', backgroundColor: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, color: '#333' }}>{fromName} → {toName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{when}</div>
                  </div>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#555' }}>
                    by {actor}
                    {approvedBy && <span> · approved by {approvedBy}</span>}
                    {entry.comment && <span> · {entry.comment}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

export default StatusHistory;


