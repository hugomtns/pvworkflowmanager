import React, { useState } from 'react';
import type { Status } from '../types';

interface StatusFormProps {
  status?: Status; // undefined for create, Status object for edit
  onSave: (statusData: Omit<Status, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const StatusForm: React.FC<StatusFormProps> = ({ status, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: status?.name || '',
    color: status?.color || '#2196f3',
    description: status?.description || '',
    entityTypes: status?.entityTypes || ['project']
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const availableEntityTypes = ['project', 'campaign', 'design', 'file'];

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Status name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Status name must be at least 2 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.entityTypes.length === 0) {
      newErrors.entityTypes = 'At least one entity type must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleEntityTypeChange = (entityType: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        entityTypes: [...prev.entityTypes, entityType]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        entityTypes: prev.entityTypes.filter(type => type !== entityType)
      }));
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
        width: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 1.5rem 0' }}>
          {status ? 'Edit Status' : 'Create New Status'}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Status Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Status Name *
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
              placeholder="e.g., In Progress, Under Review"
            />
            {errors.name && (
              <div style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.name}
              </div>
            )}
          </div>

          {/* Status Color */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Status Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                style={{
                  width: '60px',
                  height: '40px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
              <div style={{
                width: '30px',
                height: '30px',
                backgroundColor: formData.color,
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 0 0 1px #ddd'
              }} />
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                {formData.color}
              </span>
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
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder="Describe what this status represents..."
            />
            {errors.description && (
              <div style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.description}
              </div>
            )}
          </div>

          {/* Entity Types */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Entity Types *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {availableEntityTypes.map(entityType => (
                <label
                  key={entityType}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.entityTypes.includes(entityType)}
                    onChange={(e) => handleEntityTypeChange(entityType, e.target.checked)}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{entityType}</span>
                </label>
              ))}
            </div>
            {errors.entityTypes && (
              <div style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.entityTypes}
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
                backgroundColor: '#4caf50',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {status ? 'Update Status' : 'Create Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusForm;