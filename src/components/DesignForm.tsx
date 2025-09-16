/**
 * DesignForm Component
 * Unified modal for creating and editing PV designs
 */

import React, { useContext, useMemo } from 'react';
import type { Design } from '../types';
import { useEntityFormValidation } from '../hooks/useFormValidation';
import { BaseButton, BaseInput, BaseSelect, BaseModal } from './common';
import { AppContext } from '../context/AppContext';

// Validation function for designs
const validateDesign = (design: any) => {
  const errors: Record<string, string> = {};

  if (!design.title?.trim()) errors.title = 'Design title is required';
  if (!design.description?.trim()) errors.description = 'Design description is required';
  if (!design.systemSpecs?.panelCount || design.systemSpecs.panelCount < 1) {
    errors.systemSpecs = 'Panel count must be at least 1';
  }
  if (!design.systemSpecs?.panelWattage || design.systemSpecs.panelWattage < 100) {
    errors.systemSpecs = 'Panel wattage must be at least 100W';
  }
  if (!design.systemSpecs?.panelManufacturer?.trim()) {
    errors.systemSpecs = 'Panel manufacturer is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export interface DesignFormProps {
  /** Design to edit (undefined for create mode) */
  design?: Design;
  /** Project ID for new designs */
  projectId: string;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Function called when design is saved */
  onSave: (designData: Omit<Design, 'id' | 'createdAt' | 'lastEditedAt'>) => void;
}

const DesignForm: React.FC<DesignFormProps> = ({
  design,
  projectId,
  isOpen,
  onClose,
  onSave
}) => {
  const { currentUser } = useContext(AppContext);

  // Panel manufacturer options
  const manufacturerOptions = useMemo(() => [
    { value: 'SunPower', label: 'SunPower' },
    { value: 'Tesla', label: 'Tesla' },
    { value: 'LG Solar', label: 'LG Solar' },
    { value: 'Canadian Solar', label: 'Canadian Solar' },
    { value: 'Jinko Solar', label: 'Jinko Solar' },
    { value: 'REC Group', label: 'REC Group' },
    { value: 'Panasonic', label: 'Panasonic' },
    { value: 'Q Cells', label: 'Q Cells' }
  ], []);

  // Approval status options
  const approvalStatusOptions = useMemo(() => [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ], []);

  // Initialize form data
  const initialData = useMemo(() => ({
    title: design?.title || '',
    description: design?.description || '',
    creator: design?.creator || currentUser.id,
    projectId,
    designVersion: design?.designVersion || 'v1.0',
    isActive: design?.isActive || false,
    approvalStatus: design?.approvalStatus || 'draft',
    systemSpecs: {
      panelCount: design?.systemSpecs?.panelCount || 30,
      panelWattage: design?.systemSpecs?.panelWattage || 400,
      panelManufacturer: design?.systemSpecs?.panelManufacturer || 'SunPower',
      panelModel: design?.systemSpecs?.panelModel || 'Maxeon 3 415W',
      dcCapacity: design?.systemSpecs?.dcCapacity || 12,
      acCapacity: design?.systemSpecs?.acCapacity || 10,
      dcAcRatio: design?.systemSpecs?.dcAcRatio || 1.2,
      annualProduction: design?.systemSpecs?.annualProduction || 15000,
      specificYield: design?.systemSpecs?.specificYield || 1250,
      arrayTilt: design?.systemSpecs?.arrayTilt || 25,
      arrayAzimuth: design?.systemSpecs?.arrayAzimuth || 180,
      roofArea: design?.systemSpecs?.roofArea || 2000,
      moduleArea: design?.systemSpecs?.moduleArea || 660,
      systemCost: design?.systemSpecs?.systemCost || 36000,
      costPerWatt: design?.systemSpecs?.costPerWatt || 3.0,
      paybackPeriod: design?.systemSpecs?.paybackPeriod || 8,
      co2OffsetAnnual: design?.systemSpecs?.co2OffsetAnnual || 13800
    }
  }), [design, currentUser.id, projectId]);

  const {
    formData,
    validate,
    updateField,
    hasFieldError,
    getFieldError
  } = useEntityFormValidation(initialData, validateDesign);

  // Helper function to calculate derived values
  const calculateDerivedValues = React.useCallback((specs: any) => {
    const { panelCount, panelWattage, dcAcRatio, specificYield, costPerWatt } = specs;
    if (panelCount && panelWattage) {
      const dcCapacity = (panelCount * panelWattage) / 1000;
      const acCapacity = dcCapacity / dcAcRatio;
      const moduleArea = panelCount * 22; // ~22 sq ft per module
      const annualProduction = dcCapacity * specificYield;
      const systemCost = dcCapacity * 1000 * costPerWatt;
      const co2OffsetAnnual = annualProduction * 0.92;

      return {
        ...specs,
        dcCapacity: Math.round(dcCapacity * 100) / 100,
        acCapacity: Math.round(acCapacity * 100) / 100,
        moduleArea: Math.round(moduleArea),
        annualProduction: Math.round(annualProduction),
        systemCost: Math.round(systemCost),
        co2OffsetAnnual: Math.round(co2OffsetAnnual)
      };
    }
    return specs;
  }, []);

  // Handle system specs updates with auto-calculation
  const handleSystemSpecsUpdate = React.useCallback((updates: any) => {
    const newSpecs = { ...formData.systemSpecs, ...updates };
    const calculatedSpecs = calculateDerivedValues(newSpecs);
    updateField('systemSpecs', calculatedSpecs);
  }, [formData.systemSpecs, calculateDerivedValues, updateField]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSave({
        title: formData.title,
        description: formData.description,
        creator: formData.creator,
        projectId: formData.projectId,
        designVersion: formData.designVersion,
        isActive: formData.isActive,
        approvalStatus: formData.approvalStatus as 'draft' | 'pending' | 'approved' | 'rejected',
        systemSpecs: formData.systemSpecs
      });
    }
  };

  const isEditMode = Boolean(design);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Design' : 'Create New Design'}
      size="lg"
      type="form"
    >
      <form onSubmit={handleSubmit} className="form">
        {/* Basic Design Information */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#333' }}>Design Information</h3>

          <BaseInput
            label="Design Title"
            required
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={hasFieldError('title') ? getFieldError('title') : undefined}
            placeholder="Enter design title (e.g., Design Option A)"
          />

          <BaseInput
            label="Description"
            required
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            error={hasFieldError('description') ? getFieldError('description') : undefined}
            placeholder="Describe the design approach and features"
            style={{ minHeight: '60px' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <BaseInput
              label="Design Version"
              value={formData.designVersion}
              onChange={(e) => updateField('designVersion', e.target.value)}
              placeholder="v1.0"
            />

            <BaseSelect
              label="Approval Status"
              value={formData.approvalStatus}
              onChange={(e) => updateField('approvalStatus', e.target.value)}
              options={approvalStatusOptions}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => updateField('isActive', e.target.checked)}
            />
            <label htmlFor="isActive" style={{ fontSize: '0.9rem' }}>
              Set as active design (will deactivate other designs for this project)
            </label>
          </div>
        </div>

        {/* Panel Specifications */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#333' }}>Panel Specifications</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <BaseInput
              label="Panel Count"
              type="number"
              required
              value={formData.systemSpecs.panelCount}
              onChange={(e) => handleSystemSpecsUpdate({
                panelCount: parseInt(e.target.value) || 0
              })}
              error={hasFieldError('systemSpecs') ? getFieldError('systemSpecs') : undefined}
              min="1"
            />

            <BaseInput
              label="Panel Wattage (W)"
              type="number"
              required
              value={formData.systemSpecs.panelWattage}
              onChange={(e) => handleSystemSpecsUpdate({
                panelWattage: parseInt(e.target.value) || 0
              })}
              error={hasFieldError('systemSpecs') ? getFieldError('systemSpecs') : undefined}
              min="100"
              max="600"
            />

            <BaseSelect
              label="Manufacturer"
              required
              value={formData.systemSpecs.panelManufacturer}
              onChange={(e) => handleSystemSpecsUpdate({
                panelManufacturer: e.target.value
              })}
              error={hasFieldError('systemSpecs') ? getFieldError('systemSpecs') : undefined}
              options={manufacturerOptions}
            />

            <BaseInput
              label="Panel Model"
              value={formData.systemSpecs.panelModel}
              onChange={(e) => handleSystemSpecsUpdate({
                panelModel: e.target.value
              })}
              placeholder="Model number"
            />
          </div>
        </div>

        {/* System Configuration */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#333' }}>System Configuration</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <BaseInput
              label="DC Capacity (kW)"
              type="number"
              step="0.1"
              value={formData.systemSpecs.dcCapacity}
              readOnly
              helpText="Auto-calculated from panel count × wattage"
            />

            <BaseInput
              label="AC Capacity (kW)"
              type="number"
              step="0.1"
              value={formData.systemSpecs.acCapacity}
              readOnly
              helpText="Auto-calculated from DC/AC ratio"
            />

            <BaseInput
              label="DC/AC Ratio"
              type="number"
              step="0.01"
              value={formData.systemSpecs.dcAcRatio}
              onChange={(e) => handleSystemSpecsUpdate({
                dcAcRatio: parseFloat(e.target.value) || 1.0
              })}
              min="1.0"
              max="2.0"
            />

            <BaseInput
              label="Array Tilt (°)"
              type="number"
              value={formData.systemSpecs.arrayTilt}
              onChange={(e) => handleSystemSpecsUpdate({
                arrayTilt: parseInt(e.target.value) || 0
              })}
              min="0"
              max="60"
            />

            <BaseInput
              label="Array Azimuth (°)"
              type="number"
              value={formData.systemSpecs.arrayAzimuth}
              onChange={(e) => handleSystemSpecsUpdate({
                arrayAzimuth: parseInt(e.target.value) || 0
              })}
              min="0"
              max="360"
              helpText="180° = due south"
            />

            <BaseInput
              label="Specific Yield (kWh/kW/year)"
              type="number"
              value={formData.systemSpecs.specificYield}
              onChange={(e) => handleSystemSpecsUpdate({
                specificYield: parseInt(e.target.value) || 0
              })}
              min="800"
              max="2000"
            />
          </div>
        </div>

        {/* Financial Information */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#333' }}>Financial Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <BaseInput
              label="Cost per Watt ($/W)"
              type="number"
              step="0.01"
              value={formData.systemSpecs.costPerWatt}
              onChange={(e) => handleSystemSpecsUpdate({
                costPerWatt: parseFloat(e.target.value) || 0
              })}
              min="0.50"
              max="10.00"
            />

            <BaseInput
              label="System Cost ($)"
              type="number"
              value={formData.systemSpecs.systemCost}
              readOnly
              helpText="Auto-calculated"
            />

            <BaseInput
              label="Payback Period (years)"
              type="number"
              step="0.1"
              value={formData.systemSpecs.paybackPeriod}
              onChange={(e) => handleSystemSpecsUpdate({
                paybackPeriod: parseFloat(e.target.value) || 0
              })}
              min="3"
              max="25"
            />
          </div>
        </div>

        {/* Environmental & Production Data */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#333' }}>Production & Environmental</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <BaseInput
              label="Annual Production (kWh)"
              type="number"
              value={formData.systemSpecs.annualProduction}
              readOnly
              helpText="Auto-calculated"
            />

            <BaseInput
              label="CO₂ Offset (lbs/year)"
              type="number"
              value={formData.systemSpecs.co2OffsetAnnual}
              readOnly
              helpText="Auto-calculated"
            />

            <BaseInput
              label="Module Area (sq ft)"
              type="number"
              value={formData.systemSpecs.moduleArea}
              readOnly
              helpText="Auto-calculated"
            />
          </div>

          <BaseInput
            label="Roof Area (sq ft)"
            type="number"
            value={formData.systemSpecs.roofArea}
            onChange={(e) => handleSystemSpecsUpdate({
              roofArea: parseInt(e.target.value) || 0
            })}
            min="500"
            max="50000"
          />
        </div>

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
            {isEditMode ? 'Update Design' : 'Create Design'}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  );
};

export default DesignForm;