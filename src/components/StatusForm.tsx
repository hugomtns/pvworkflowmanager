import React from 'react';
import type { Status } from '../types';
import { validateStatus } from '../utils/validation';
import { useEntityFormValidation } from '../hooks/useFormValidation';
import { BaseButton, BaseInput } from './common';

interface StatusFormProps {
  status?: Status; // undefined for create, Status object for edit
  onSave: (statusData: Omit<Status, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const StatusForm: React.FC<StatusFormProps> = ({ status, onSave, onCancel }) => {
  const initialData = {
    name: status?.name || '',
    color: status?.color || '#2196f3',
    description: status?.description || '',
    entityTypes: status?.entityTypes || ['project']
  };

  const {
    formData,
    validate,
    updateField,
    getFieldClassName,
    hasFieldError,
    getFieldError
  } = useEntityFormValidation(initialData, validateStatus);

  const availableEntityTypes = ['project', 'campaign', 'design', 'file'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSave(formData);
    }
  };

  const handleEntityTypeChange = (entityType: string, checked: boolean) => {
    if (checked) {
      updateField('entityTypes', [...formData.entityTypes, entityType]);
    } else {
      updateField('entityTypes', formData.entityTypes.filter(type => type !== entityType));
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
          <BaseInput
            label="Status Name"
            required
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={hasFieldError('name') ? getFieldError('name') : undefined}
            placeholder="e.g., In Progress, Under Review"
          />

          {/* Status Color */}
          <div className="form-field">
            <label className="form-label">
              Status Color
            </label>
            <div className="form-color-group">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => updateField('color', e.target.value)}
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
              onChange={(e) => updateField('description', e.target.value)}
              className={getFieldClassName('form-textarea', 'description')}
              placeholder="Describe what this status represents..."
            />
            {hasFieldError('description') && (
              <span className="form-error">
                {getFieldError('description')}
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
            {hasFieldError('entityTypes') && (
              <span className="form-error">
                {getFieldError('entityTypes')}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <BaseButton
              type="button"
              variant="cancel"
              size="lg"
              onClick={onCancel}
            >
              Cancel
            </BaseButton>
            <BaseButton
              type="submit"
              variant="success"
              size="lg"
            >
              {status ? 'Update Status' : 'Create Status'}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusForm;