import React from 'react';

const StatusManagement: React.FC = () => {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0 }}>Manage Statuses</h2>
        <button style={{
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Create New Status
        </button>
      </div>
      
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p>Status management interface goes here.</p>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Coming up: Status list, color picker, entity type selection
        </p>
      </div>
    </div>
  );
};

export default StatusManagement;