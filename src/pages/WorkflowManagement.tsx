import React from 'react';

const WorkflowManagement: React.FC = () => {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0 }}>Manage Workflows</h2>
        <button style={{
          backgroundColor: '#9c27b0',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Create New Workflow
        </button>
      </div>
      
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p>Workflow management interface goes here.</p>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Coming up: Workflow list, canvas builder, transition configuration
        </p>
      </div>
    </div>
  );
};

export default WorkflowManagement;