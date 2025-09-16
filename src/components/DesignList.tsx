/**
 * DesignList Component
 * Displays and manages designs within a project
 */

import React, { useState, useMemo, useCallback } from 'react';
import type { Design } from '../types';
import { designOperations, userOperations } from '../data/dataAccess';
import DesignForm from './DesignForm';
import { formatDate } from '../utils/common';

export interface DesignListProps {
  /** Designs to display */
  designs: Design[];
  /** Project ID for creating new designs */
  projectId: string;
  /** Callback when designs are updated */
  onDesignUpdate: () => void;
}

const DesignList: React.FC<DesignListProps> = ({
  designs,
  projectId,
  onDesignUpdate
}) => {
  const [designFormOpen, setDesignFormOpen] = useState(false);
  const [designToEdit, setDesignToEdit] = useState<Design | undefined>(undefined);

  // Memoized user lookup
  const users = useMemo(() => {
    const allUsers = userOperations.getAll();
    const userMap = new Map<string, string>();
    allUsers.forEach(user => userMap.set(user.id, user.name));
    return userMap;
  }, []);

  // Handle creating new design
  const handleCreateDesign = useCallback(() => {
    setDesignToEdit(undefined);
    setDesignFormOpen(true);
  }, []);

  // Handle editing existing design
  const handleEditDesign = useCallback((design: Design) => {
    setDesignToEdit(design);
    setDesignFormOpen(true);
  }, []);

  // Handle saving design (create or update)
  const handleSaveDesign = useCallback((designData: Omit<Design, 'id' | 'createdAt' | 'lastEditedAt'>) => {
    if (designToEdit) {
      // Update existing design
      designOperations.update(designToEdit.id, {
        ...designData,
        lastEditedAt: new Date()
      });
    } else {
      // Create new design
      const newDesign: Omit<Design, 'id'> = {
        ...designData,
        projectId,
        createdAt: new Date(),
        lastEditedAt: new Date()
      };
      designOperations.create(newDesign);
    }
    setDesignFormOpen(false);
    setDesignToEdit(undefined);
    onDesignUpdate();
  }, [designToEdit, projectId, onDesignUpdate]);

  // Handle closing design form
  const handleCloseDesignForm = useCallback(() => {
    setDesignFormOpen(false);
    setDesignToEdit(undefined);
  }, []);

  // Handle setting active design
  const handleSetActive = useCallback((designId: string) => {
    designOperations.setActive(designId);
    onDesignUpdate();
  }, [onDesignUpdate]);

  // Handle deleting design
  const handleDeleteDesign = useCallback((designId: string) => {
    if (window.confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      designOperations.delete(designId);
      onDesignUpdate();
    }
  }, [onDesignUpdate]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Get approval status styling
  const getApprovalStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { backgroundColor: '#4caf50', color: 'white' };
      case 'pending':
        return { backgroundColor: '#ff9800', color: 'white' };
      case 'rejected':
        return { backgroundColor: '#f44336', color: 'white' };
      default:
        return { backgroundColor: '#9e9e9e', color: 'white' };
    }
  };

  if (designs.length === 0) {
    return (
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div>
            <p style={{ margin: 0, color: '#666' }}>No designs created yet.</p>
          </div>
          <button
            onClick={handleCreateDesign}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Create First Design
          </button>
        </div>

        {/* Design form modal */}
        <DesignForm
          design={designToEdit}
          projectId={projectId}
          isOpen={designFormOpen}
          onClose={handleCloseDesignForm}
          onSave={handleSaveDesign}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header with create button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <p style={{ margin: 0, color: '#666' }}>
          {designs.length} design{designs.length !== 1 ? 's' : ''} available
        </p>
        <button
          onClick={handleCreateDesign}
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Create New Design
        </button>
      </div>

      {/* Design cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '1.5rem'
      }}>
        {designs.map(design => {
          const creator = users.get(design.creator);
          const approvalStyle = getApprovalStatusStyle(design.approvalStatus);

          return (
            <div
              key={design.id}
              style={{
                backgroundColor: 'white',
                border: design.isActive ? '2px solid #4caf50' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
            >
              {/* Active badge */}
              {design.isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-1px',
                  right: '1rem',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0 0 4px 4px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  ACTIVE
                </div>
              )}

              {/* Design Header */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>{design.title}</h3>
                  <div
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                      ...approvalStyle
                    }}
                  >
                    {design.approvalStatus}
                  </div>
                </div>
                <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                  {design.description}
                </p>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                  Version {design.designVersion} • Created by {creator || 'Unknown'} on {formatDate(design.createdAt)}
                </div>
              </div>

              {/* System Specifications Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '1rem'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#333' }}>System Size</h4>
                  <div style={{ fontSize: '0.8rem' }}>
                    <div><strong>{design.systemSpecs.dcCapacity} kW DC</strong></div>
                    <div>{design.systemSpecs.acCapacity} kW AC</div>
                    <div>DC/AC Ratio: {design.systemSpecs.dcAcRatio}</div>
                    <div>{design.systemSpecs.panelCount} panels × {design.systemSpecs.panelWattage}W</div>
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#333' }}>Production & Cost</h4>
                  <div style={{ fontSize: '0.8rem' }}>
                    <div><strong>{formatNumber(design.systemSpecs.annualProduction)} kWh/year</strong></div>
                    <div>{formatCurrency(design.systemSpecs.systemCost)} total</div>
                    <div>${design.systemSpecs.costPerWatt}/W</div>
                    <div>{Math.round(design.systemSpecs.specificYield)} kWh/kW/year</div>
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#333' }}>Panel Details</h4>
                  <div style={{ fontSize: '0.8rem' }}>
                    <div><strong>{design.systemSpecs.panelManufacturer}</strong></div>
                    <div>{design.systemSpecs.panelModel}</div>
                    <div>{design.systemSpecs.arrayTilt}° tilt</div>
                    <div>{design.systemSpecs.arrayAzimuth}° azimuth</div>
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#333' }}>Environmental</h4>
                  <div style={{ fontSize: '0.8rem' }}>
                    <div><strong>{formatNumber(design.systemSpecs.co2OffsetAnnual)} lbs CO₂/year</strong></div>
                    <div>{formatNumber(design.systemSpecs.moduleArea)} sq ft panels</div>
                    <div>{formatNumber(design.systemSpecs.roofArea)} sq ft roof</div>
                    {design.systemSpecs.paybackPeriod && (
                      <div>{Math.round(design.systemSpecs.paybackPeriod)} year payback</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {!design.isActive && (
                    <button
                      onClick={() => handleSetActive(design.id)}
                      style={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => handleEditDesign(design)}
                    style={{
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteDesign(design.id)}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Design form modal */}
      <DesignForm
        design={designToEdit}
        projectId={projectId}
        isOpen={designFormOpen}
        onClose={handleCloseDesignForm}
        onSave={handleSaveDesign}
      />
    </div>
  );
};

export default DesignList;