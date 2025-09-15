import React from 'react';

const ProjectList: React.FC = () => {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0 }}>Projects</h2>
        <button style={{
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Create New Project
        </button>
      </div>
      
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p>No projects yet. This will show the project list.</p>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Coming up: Search, filters, project cards, and status indicators
        </p>
      </div>
    </div>
  );
};

export default ProjectList;