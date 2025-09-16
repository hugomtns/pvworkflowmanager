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
    <div className="modal-overlay">
      <div className="modal-container modal-form">
        <h3 className="modal-title">
          {status ? 'Edit Status' : 'Create New Status'}
        </h3>

        <form onSubmit={handleSubmit} className="form">
          {/* Status Name */}
          <div className="form-field">
            <label className="form-label required">
              Status Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g., In Progress, Under Review"
            />
            {errors.name && (
              <span className="form-error">
                {errors.name}
              </span>
            )}
          </div>

          {/* Status Color */}
          <div className="form-field">
            <label className="form-label">
              Status Color
            </label>
            <div className="form-color-group">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="form-color"
              />
              <div
                className="form-color-preview"
                style={{ backgroundColor: formData.color }}
              />
              <span className="form-color-value">
                {formData.color}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="form-field">
            <label className="form-label required">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Describe what this status represents..."
            />
            {errors.description && (
              <span className="form-error">
                {errors.description}
              </span>
            )}
          </div>

          {/* Entity Types */}
          <div className="form-field">
            <label className="form-label required">
              Entity Types
            </label>
            <div className="form-checkbox-group">
              {availableEntityTypes.map(entityType => (
                <label key={entityType} className="form-label checkbox">
                  <input
                    type="checkbox"
                    checked={formData.entityTypes.includes(entityType)}
                    onChange={(e) => handleEntityTypeChange(entityType, e.target.checked)}
                    className="form-checkbox"
                  />
                  <span style={{ textTransform: 'capitalize' }}>{entityType}</span>
                </label>
              ))}
            </div>
            {errors.entityTypes && (
              <span className="form-error">
                {errors.entityTypes}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-cancel btn-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success btn-lg"
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