import React, { useState, useEffect, useCallback } from 'react';
import { workflowOperations, statusOperations, projectOperations } from '../data/dataAccess';
import WorkflowForm from '../components/WorkflowForm';
import TransitionList from '../components/TransitionList';
import ActionMenu, { type ActionMenuOption } from '../components/ActionMenu';
import type { Workflow, Status } from '../types';

const WorkflowManagement: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | undefined>(undefined);
  const [transitionsWorkflow, setTransitionsWorkflow] = useState<Workflow | undefined>(undefined);

  // Load data when component mounts
  useEffect(() => {
    loadWorkflows();
    setStatuses(statusOperations.getAll());
  }, []);

  const loadWorkflows = () => {
    setWorkflows(workflowOperations.getAll());
  };

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

  // Handle workflow actions
  const handleCreateWorkflow = () => {
    setEditingWorkflow(undefined);
    setShowForm(true);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setShowForm(true);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    // Check if workflow is in use by any projects
    const projects = projectOperations.getAll();
    const projectsUsingWorkflow = projects.filter(project => project.workflowId === workflowId);

    if (projectsUsingWorkflow.length > 0) {
      alert(`Cannot delete this workflow. It is currently used by ${projectsUsingWorkflow.length} project(s): ${projectsUsingWorkflow.map(p => p.title).join(', ')}`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      const success = workflowOperations.delete(workflowId);
      if (success) {
        loadWorkflows();
      } else {
        alert('Failed to delete workflow.');
      }
    }
  };

  const handleSaveWorkflow = (workflowData: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>, assignedProjectIds?: string[]) => {
    let savedWorkflow: Workflow | null = null;
    if (editingWorkflow) {
      // Update existing workflow
      const updated = workflowOperations.update(editingWorkflow.id, workflowData);
      if (!updated) {
        alert('Failed to update workflow.');
        return;
      }
      savedWorkflow = updated;
    } else {
      // Create new workflow
      savedWorkflow = workflowOperations.create(workflowData);
    }

    // If caller supplied specific projects to assign this workflow to, update those projects
    if (assignedProjectIds && savedWorkflow) {
      const projects = projectOperations.getAll();
      assignedProjectIds.forEach(pid => {
        const proj = projects.find(p => p.id === pid);
        if (proj) {
          projectOperations.update(pid, { workflowId: savedWorkflow!.id });
        }
      });
    }

    loadWorkflows();
    setShowForm(false);
    setEditingWorkflow(undefined);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingWorkflow(undefined);
  };

  // Create action menu options for each workflow
  const createWorkflowActionMenu = useCallback((workflow: Workflow): ActionMenuOption[] => [
    {
      label: 'Edit Workflow',
      icon: '✏️',
      onClick: () => handleEditWorkflow(workflow)
    },
    {
      label: 'Manage Transitions',
      icon: '🔄',
      onClick: () => {
        const latest = workflowOperations.getById(workflow.id);
        setTransitionsWorkflow(latest || workflow);
      }
    },
    {
      label: 'Delete Workflow',
      icon: '🗑️',
      color: '#f44336',
      onClick: () => handleDeleteWorkflow(workflow.id)
    }
  ], []);

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0 }}>Manage Workflows ({filteredWorkflows.length})</h2>
        <button 
          onClick={handleCreateWorkflow}
          style={{
            backgroundColor: '#9c27b0',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
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
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'left',
                transition: 'box-shadow 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              {/* Action Menu */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px'
              }}>
                <ActionMenu
                  options={createWorkflowActionMenu(workflow)}
                  buttonStyle={{
                    fontSize: '18px',
                    padding: '6px 10px'
                  }}
                />
              </div>

              {/* Workflow Title */}
              <h3 style={{
                margin: '0 0 0.5rem 0',
                color: '#333',
                fontSize: '1.25rem',
                paddingRight: '40px' // Add padding to avoid overlap with action menu
              }}>
                {workflow.name}
                {workflow.isDefault && (
                  <span style={{
                    marginLeft: '0.75rem',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '600'
                  }}>
                    DEFAULT
                  </span>
                )}
              </h3>

              {/* Workflow Description */}
              <p style={{
                margin: '0 0 1rem 0',
                color: '#666',
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                {workflow.description}
              </p>

              {/* Entity Type Badge */}
              <div style={{
                display: 'inline-block',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                marginBottom: '1rem'
              }}>
                {workflow.entityType} Workflow
              </div>

              {/* Workflow Stats */}
              <div style={{ margin: '0.6rem 0' }}>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#333',
                  fontWeight: '600'
                }}>
                  <strong>{workflow.statuses.length}</strong> statuses • <strong>{workflow.transitions.length}</strong> transitions
                </div>
              </div>

              {/* Status Flow */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#888',
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>
                  Status Flow:
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#555',
                  backgroundColor: '#f8f9fa',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
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

      {/* Workflow Form Modal */}
      {showForm && (
        <WorkflowForm
          workflow={editingWorkflow}
          onSave={handleSaveWorkflow}
          onCancel={handleCancelForm}
        />
      )}

      {/* Transition List Modal */}
      {transitionsWorkflow && (
        <TransitionList
          workflow={transitionsWorkflow}
          allStatuses={statuses}
          onClose={() => setTransitionsWorkflow(undefined)}
          onUpdated={(updated) => {
            setTransitionsWorkflow(updated);
            loadWorkflows();
          }}
        />
      )}
    </div>
  );
};

export default WorkflowManagement;