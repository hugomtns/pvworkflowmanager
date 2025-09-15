import React, { useState, useEffect } from 'react';
import { statusOperations } from '../data/dataAccess';
import WorkflowCanvas from './WorkflowCanvas';
import type { Workflow, Status } from '../types';

interface WorkflowLayoutData {
  statusPositions: { [statusId: string]: { x: number; y: number } };
  connections: Array<{ id: string; fromStatusId: string; toStatusId: string }>;
}

interface WorkflowFormProps {
  workflow?: Workflow; // undefined for create, Workflow object for edit
  onSave: (workflowData: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const WorkflowForm: React.FC<WorkflowFormProps> = ({ workflow, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
    entityType: workflow?.entityType || 'project',
    statuses: workflow?.statuses || [],
    isDefault: workflow?.isDefault || false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableStatuses, setAvailableStatuses] = useState<Status[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const [workflowLayout, setWorkflowLayout] = useState<WorkflowLayoutData>({
    statusPositions: workflow?.layout?.statusPositions || {},
    connections: (workflow?.transitions || []).map((t, index) => ({
      id: t.id || `trans-${index}`,
      fromStatusId: t.fromStatusId,
      toStatusId: t.toStatusId
    }))
  });

  const entityTypes = ['project', 'campaign', 'design', 'file'];

  // Load available statuses and initialize layout when component mounts or entity type changes
  useEffect(() => {
    const allStatuses = statusOperations.getAll();
    const filteredStatuses = allStatuses.filter(status => 
      status.entityTypes.includes(formData.entityType)
    );
    setAvailableStatuses(filteredStatuses);
    
    // Update selected statuses based on current workflow
    const workflowStatuses = filteredStatuses.filter(status => 
      formData.statuses.includes(status.id)
    );
    setSelectedStatuses(workflowStatuses);

    // Keep connections in sync if workflow transitions change while editing
    if (workflow?.transitions) {
      const connections = workflow.transitions.map((t, index) => ({
        id: t.id || `trans-${index}`,
        fromStatusId: t.fromStatusId,
        toStatusId: t.toStatusId
      }));
      setWorkflowLayout(prev => ({
        ...prev,
        connections
      }));
    }
  }, [formData.entityType, formData.statuses, workflow]);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Workflow name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Workflow name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (selectedStatuses.length < 2) {
      newErrors.statuses = 'At least 2 statuses must be selected for the workflow';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create transitions based on canvas connections
      const transitions = workflowLayout.connections.map((conn, index) => ({
        id: `trans-${Date.now()}-${index}`,
        fromStatusId: conn.fromStatusId,
        toStatusId: conn.toStatusId,
        requiresApproval: false,
        approverRoles: [],
        approverUserIds: [],
        tasks: [],
        conditions: []
      }));

      onSave({
        ...formData,
        statuses: selectedStatuses.map(s => s.id),
        transitions,
        layout: {
          statusPositions: workflowLayout.statusPositions
        }
      });
    }
  };

  // Handle status selection from palette
  const handleStatusSelectionChange = (statuses: Status[]) => {
    setSelectedStatuses(statuses);
    setFormData(prev => ({
      ...prev,
      statuses: statuses.map(s => s.id)
    }));
  };

  // Handle canvas updates
  const handleStatusMove = (statusId: string, x: number, y: number) => {
    setWorkflowLayout(prev => ({
      ...prev,
      statusPositions: {
        ...prev.statusPositions,
        [statusId]: { x, y }
      }
    }));
  };

  const handleConnectionsChange = (connections: Array<{ id: string; fromStatusId: string; toStatusId: string }>) => {
    setWorkflowLayout(prev => ({
      ...prev,
      connections
    }));
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
        padding: '2rem',
        width: '90%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 1.5rem 0' }}>
          {workflow ? 'Edit Workflow' : 'Create New Workflow'}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Basic Workflow Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Workflow Name */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: 'bold'
              }}>
                Workflow Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.name ? '1px solid #f44336' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="e.g., Standard Project Workflow"
              />
              {errors.name && (
                <div style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {errors.name}
                </div>
              )}
            </div>

            {/* Entity Type */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: 'bold'
              }}>
                Entity Type
              </label>
              <select
                value={formData.entityType}
                onChange={(e) => setFormData(prev => ({ ...prev, entityType: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                {entityTypes.map(type => (
                  <option key={type} value={type} style={{ textTransform: 'capitalize' }}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.description ? '1px solid #f44336' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                minHeight: '60px',
                resize: 'vertical'
              }}
              placeholder="Describe the purpose of this workflow..."
            />
            {errors.description && (
              <div style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.description}
              </div>
            )}
          </div>

          {/* Default Workflow Toggle */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              />
              <span style={{ fontWeight: 'bold' }}>Make this the default workflow</span>
            </label>
          </div>

          {/* CANVAS SECTION - This replaces the old status selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Design Your Workflow * (Drag statuses to build your workflow)
            </label>
            
            {availableStatuses.length === 0 ? (
              <div style={{
                padding: '2rem',
                backgroundColor: '#fff3e0',
                border: '1px solid #ff9800',
                borderRadius: '4px',
                color: '#e65100',
                textAlign: 'center'
              }}>
                No statuses available for {formData.entityType} entities. 
                <br />Please create some statuses first.
              </div>
            ) : (
              <div>
                {/* Status Palette */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Available Statuses (click to add/remove):
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    flexWrap: 'wrap',
                    padding: '0.75rem',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    {availableStatuses.map(status => (
                      <div
                        key={status.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          backgroundColor: selectedStatuses.some(s => s.id === status.id) ? '#e8f5e8' : 'white',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                        onClick={() => {
                          if (selectedStatuses.some(s => s.id === status.id)) {
                            // Remove from selection
                            const newSelection = selectedStatuses.filter(s => s.id !== status.id);
                            handleStatusSelectionChange(newSelection);
                          } else {
                            // Add to selection
                            handleStatusSelectionChange([...selectedStatuses, status]);
                          }
                        }}
                      >
                        <div style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: status.color,
                          borderRadius: '50%'
                        }} />
                        <span>{status.name}</span>
                        {selectedStatuses.some(s => s.id === status.id) && (
                          <span style={{ color: '#4caf50' }}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Canvas */}
                <div style={{
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}>
                  <WorkflowCanvas 
                    statuses={selectedStatuses}
                    width={900}
                    height={400}
                    onStatusMove={handleStatusMove}
                    onConnectionsChange={handleConnectionsChange}
                    initialPositions={workflowLayout.statusPositions}
                    initialConnections={workflowLayout.connections}
                  />
                </div>
                
                {selectedStatuses.length > 0 && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    fontSize: '0.8rem', 
                    color: '#666' 
                  }}>
                    Selected: {selectedStatuses.length} status{selectedStatuses.length !== 1 ? 'es' : ''} 
                    ({selectedStatuses.map(s => s.name).join(', ')})
                  </div>
                )}
              </div>
            )}
            
            {errors.statuses && (
              <div style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.statuses}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: '#9c27b0',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {workflow ? 'Update Workflow' : 'Create Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkflowForm;