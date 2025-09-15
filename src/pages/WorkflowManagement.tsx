import React, { useState, useEffect } from 'react';
import { workflowOperations, statusOperations } from '../data/dataAccess';
import type { Workflow, Status } from '../types';

const WorkflowManagement: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data when component mounts
  useEffect(() => {
    setWorkflows(workflowOperations.getAll());
    setStatuses(statusOperations.getAll());
  }, []);

  // Filter workflows based on search term
  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get status names for a workflow
  const getStatusNames = (statusIds: string[]): string => {
    const names = statusIds
      .map(id => statuses.find(status => status.id === id)?.name)
      .filter(name => name !== undefined);
    return names.join(' → ');
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0 }}>Manage Workflows ({filteredWorkflows.length})</h2>
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
      
      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search workflows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Workflow Cards */}
      {filteredWorkflows.length === 0 ? (
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p>No workflows found.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredWorkflows.map(workflow => (
            <div
              key={workflow.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {/* Workflow Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0',
                    color: '#333',
                    fontSize: '1.25rem'
                  }}>
                    {workflow.name}
                    {workflow.isDefault && (
                      <span style={{
                        marginLeft: '0.5rem',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'normal'
                      }}>
                        DEFAULT
                      </span>
                    )}
                  </h3>
                  <p style={{ 
                    margin: 0,
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    {workflow.description}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    Edit
                  </button>
                  <button style={{
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    Canvas
                  </button>
                </div>
              </div>

              {/* Entity Type and Status Count */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <span style={{ 
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    textTransform: 'capitalize'
                  }}>
                    {workflow.entityType}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#666'
                }}>
                  <strong>{workflow.statuses.length}</strong> statuses
                </div>
              </div>

              {/* Status Flow */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#888',
                  marginBottom: '0.5rem'
                }}>
                  <strong>Status Flow:</strong>
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#555',
                  fontFamily: 'monospace',
                  backgroundColor: '#f5f5f5',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {getStatusNames(workflow.statuses) || 'No statuses configured'}
                </div>
              </div>

              {/* Workflow Metadata */}
              <div style={{ 
                fontSize: '0.8rem',
                color: '#888',
                borderTop: '1px solid #eee',
                paddingTop: '1rem'
              }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>Created:</strong> {formatDate(workflow.createdAt)}
                </div>
                <div>
                  <strong>Last Updated:</strong> {formatDate(workflow.updatedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information Panel */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f3e5f5',
        borderRadius: '8px',
        border: '1px solid #9c27b0'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#6a1b9a' }}>
          Next Steps
        </h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#7b1fa2' }}>
          Coming up: Canvas-based workflow builder, drag-and-drop status arrangement, 
          transition configuration, and approval setup.
        </p>
      </div>
    </div>
  );
};

export default WorkflowManagement;