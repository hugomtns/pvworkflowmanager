/**
 * ProjectForm Component
 * Unified modal for creating and editing projects
 */

import React, { useContext, useMemo } from 'react';
import type { Project } from '../types';
import { validateProject } from '../utils/validation';
import { useEntityFormValidation } from '../hooks/useFormValidation';
import { BaseButton, BaseInput, BaseSelect, BaseModal } from './common';
import { AppContext } from '../context/AppContext';

export interface ProjectFormProps {
  /** Project to edit (undefined for create mode) */
  project?: Project;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Function called when project is saved */
  onSave: (projectData: Omit<Project, 'id' | 'createdAt' | 'lastEditedAt' | 'statusHistory'>) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  isOpen,
  onClose,
  onSave
}) => {
  const { workflows, currentUser } = useContext(AppContext);

  // Filter workflows to only show project workflows
  const projectWorkflows = useMemo(() => {
    return workflows.filter(workflow => workflow.entityType === 'project');
  }, [workflows]);

  // Convert workflows to select options
  const workflowOptions = useMemo(() => {
    return projectWorkflows.map(workflow => ({
      value: workflow.id,
      label: `${workflow.name} - ${workflow.description}`
    }));
  }, [projectWorkflows]);

  // Initialize form data
  const initialData = useMemo(() => ({
    title: project?.title || '',
    description: project?.description || '',
    creator: project?.creator || currentUser.id,
    workflowId: project?.workflowId || (projectWorkflows.find(w => w.isDefault)?.id || ''),
    currentStatusId: project?.currentStatusId || ''
  }), [project, currentUser.id, projectWorkflows]);

  const {
    formData,
    validate,
    updateField,
    hasFieldError,
    getFieldError
  } = useEntityFormValidation(initialData, validateProject);

  // Get the first status of selected workflow for new projects
  const selectedWorkflow = useMemo(() => {
    return projectWorkflows.find(w => w.id === formData.workflowId);
  }, [projectWorkflows, formData.workflowId]);

  // Update current status when workflow changes (for new projects only)
  React.useEffect(() => {
    if (!project && selectedWorkflow && selectedWorkflow.statuses.length > 0) {
      updateField('currentStatusId', selectedWorkflow.statuses[0]);
    }
    // updateField is stable after hook fix, but excluding to be safe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkflow, project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSave({
        title: formData.title,
        description: formData.description,
        creator: formData.creator,
        workflowId: formData.workflowId,
        currentStatusId: formData.currentStatusId || selectedWorkflow?.statuses[0] || ''
      });
    }
  };

  const isEditMode = Boolean(project);
  const canChangeWorkflow = !isEditMode || (project?.statusHistory?.length || 0) <= 1;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Project' : 'Create New Project'}
      size="md"
      type="form"
    >
      <form onSubmit={handleSubmit} className="form">
        <BaseInput
          label="Project Title"
          required
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          error={hasFieldError('title') ? getFieldError('title') : undefined}
          placeholder="Enter project title (e.g., Residential Solar - Smith House)"
        />

        <BaseInput
          label="Description"
          required
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          error={hasFieldError('description') ? getFieldError('description') : undefined}
          placeholder="Describe the project scope and requirements"
          containerClassName="form-field"
          wrapperClassName="form-input-wrapper"
          className="form-textarea"
          style={{ minHeight: '80px' }}
        />

        <BaseSelect
          label="Workflow"
          required
          value={formData.workflowId}
          onChange={(e) => updateField('workflowId', e.target.value)}
          error={hasFieldError('workflowId') ? getFieldError('workflowId') : undefined}
          options={workflowOptions}
          placeholder="Select project workflow"
          disabled={!canChangeWorkflow}
          helpText={!canChangeWorkflow ? 'Workflow cannot be changed after project has progressed' : undefined}
        />

        {selectedWorkflow && (
          <div className="form-field">
            <label className="form-label">Initial Status</label>
            <div className="status-badge status-badge-md">
              <span className="status-badge-dot" style={{ backgroundColor: '#1976d2' }} />
              <span className="status-badge-text">
                {/* We'll need to get the status name from the status ID */}
                Will start in first workflow status
              </span>
            </div>
            <span className="form-help">
              {isEditMode ? 'Current project status will be preserved' : 'Project will begin at the first step of the selected workflow'}
            </span>
          </div>
        )}

        <div className="form-actions">
          <BaseButton
            type="button"
            variant="cancel"
            onClick={onClose}
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
          >
            {isEditMode ? 'Update Project' : 'Create Project'}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  );
};

export default ProjectForm;