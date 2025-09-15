import React, { useState, useEffect } from 'react';
import { statusOperations } from '../data/dataAccess';
import type { Workflow, Status } from '../types';

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

  const entityTypes = ['project', 'campaign', 'design', 'file'];

  // Load available statuses when component mounts or entity type changes
  useEffect(() => {
    const allStatuses = statusOperations.getAll();
    const filteredStatuses = allStatuses.filter(status => 
      status.entityTypes.includes(formData.entityType)
    );
    setAvailableStatuses(filteredStatuses);
    
    // Remove any selected statuses that don't match the new entity type
    setFormData(prev => ({
      ...prev,
      statuses: prev.statuses.filter(statusId => 
        filteredStatuses.some(status => status.id === statusId)
      )
    }));
  }, [formData.entityType]);

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

    if (formData.statuses.length < 2) {
      newErrors.statuses = 'At least 2 statuses must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create basic transitions (linear flow)
      const transitions = formData.statuses.slice(0, -1).map((fromStatusId, index) => ({
        id: `trans-${Date.now()}-${index}`,
        fromStatusId,
        toStatusId: formData.statuses[index + 1],
        requiresApproval: false,
        approverRoles: [],
        approverUserIds: [],
        tasks: [],
        conditions: []
      }));

      onSave({
        ...formData,
        transitions
      });
    }
  };

  const handleStatusToggle = (statusId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        statuses: [...prev.statuses, statusId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        statuses: prev.statuses.filter(id => id !== statusId)
      }));
    }
  };

  const moveStatus = (statusId: string, direction: 'up' | 'down') => {
    const currentIndex = formData.statuses.indexOf(statusId);
    if (currentIndex === -1) return;

    const newStatuses = [...formData.statuses];
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < newStatuses.length) {
      [newStatuses[currentIndex], newStatuses[newIndex]] = [newStatuses[newIndex], newStatuses[currentIndex]];
      setFormData(prev => ({ ...prev, statuses: newStatuses }));
    }
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
        width: '600px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 1.5rem 0' }}>
          {workflow ? 'Edit Workflow' : 'Create New Workflow'}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Workflow Name */}
          <div style={{ marginBottom: '1rem' }}>
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
                minHeight: '80px',
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

          {/* Entity Type */}
          <div style={{ marginBottom: '1rem' }}>
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
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
              New {formData.entityType} entities will automatically use this workflow
            </div>
          </div>

          {/* Status Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Workflow Statuses * (Select and arrange in order)
            </label>
            
            {availableStatuses.length === 0 ? (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fff3e0',
                border: '1px solid #ff9800',
                borderRadius: '4px',
                color: '#e65100'
              }}>
                No statuses available for {formData.entityType} entities. 
                Please create some statuses first.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '2rem' }}>
                {/* Available Statuses */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Available Statuses
                  </div>
                  <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '1rem',
                    minHeight: '200px',
                    backgroundColor: '#fafafa'
                  }}>
                    {availableStatuses.map(status => (
                      <label
                        key={status.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          backgroundColor: formData.statuses.includes(status.id) ? '#e8f5e8' : 'white',
                          border: '1px solid #ddd'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.statuses.includes(status.id)}
                          onChange={(e) => handleStatusToggle(status.id, e.target.checked)}
                        />
                        <div style={{
                          width: '16px',
                          height: '16px',
                          backgroundColor: status.color,
                          borderRadius: '50%'
                        }} />
                        <span style={{ fontSize: '0.9rem' }}>{status.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Selected Statuses (Workflow Order) */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Workflow Order
                  </div>
                  <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '1rem',
                    minHeight: '200px',
                    backgroundColor: '#f0f8ff'
                  }}>
                    {formData.statuses.length === 0 ? (
                      <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                        Select statuses from the left
                      </div>
                    ) : (
                      formData.statuses.map((statusId, index) => {
                        const status = availableStatuses.find(s => s.id === statusId);
                        if (!status) return null;

                        return (
                          <div
                            key={statusId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.5rem',
                              padding: '0.5rem',
                              backgroundColor: 'white',
                              border: '1px solid #ddd',
                              borderRadius: '4px'
                            }}
                          >
                            <span style={{ fontSize: '0.8rem', color: '#666', minWidth: '20px' }}>
                              {index + 1}.
                            </span>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              backgroundColor: status.color,
                              borderRadius: '50%'
                            }} />
                            <span style={{ fontSize: '0.9rem', flex: 1 }}>{status.name}</span>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button
                                type="button"
                                onClick={() => moveStatus(statusId, 'up')}
                                disabled={index === 0}
                                style={{
                                  padding: '0.25rem',
                                  border: 'none',
                                  backgroundColor: index === 0 ? '#f5f5f5' : '#2196f3',
                                  color: index === 0 ? '#999' : 'white',
                                  borderRadius: '3px',
                                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                                  fontSize: '0.7rem'
                                }}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => moveStatus(statusId, 'down')}
                                disabled={index === formData.statuses.length - 1}
                                style={{
                                  padding: '0.25rem',
                                  border: 'none',
                                  backgroundColor: index === formData.statuses.length - 1 ? '#f5f5f5' : '#2196f3',
                                  color: index === formData.statuses.length - 1 ? '#999' : 'white',
                                  borderRadius: '3px',
                                  cursor: index === formData.statuses.length - 1 ? 'not-allowed' : 'pointer',
                                  fontSize: '0.7rem'
                                }}
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
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