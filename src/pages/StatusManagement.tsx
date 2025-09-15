import React, { useState, useEffect } from 'react';
import { statusOperations, projectOperations } from '../data/dataAccess';
import type { Status } from '../types';
import StatusForm from '../components/StatusForm';

const StatusManagement: React.FC = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | undefined>(undefined);

  // Load statuses when component mounts
  useEffect(() => {
    setStatuses(statusOperations.getAll());
  }, []);

  // Filter statuses based on search term
  const filteredStatuses = statuses.filter(status =>
    status.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    status.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
  };

  // Get project count for a status
  const getProjectCount = (statusId: string): number => {
    const projects = projectOperations.getAll();
    return projects.filter(project => project.currentStatusId === statusId).length;
  };

  // Handlers for Create/Edit/Delete and Form actions
  const handleCreateClick = (): void => {
    setEditingStatus(undefined);
    setShowForm(true);
  };

  const handleEditClick = (status: Status): void => {
    setEditingStatus(status);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string): void => {
    // Check if status is in use by any projects
    const projects = projectOperations.getAll();
    const projectsUsingStatus = projects.filter(project => 
      project.currentStatusId === id ||
      project.statusHistory.some(entry => 
        entry.toStatusId === id || entry.fromStatusId === id
      )
    );

    if (projectsUsingStatus.length > 0) {
      alert(`Cannot delete this status. It is currently used by ${projectsUsingStatus.length} project(s): ${projectsUsingStatus.map(p => p.title).join(', ')}`);
      return;
    }

    const confirmed = window.confirm('Delete this status? This action cannot be undone.');
    if (!confirmed) return;

    const success = statusOperations.delete(id);
    if (success) {
      setStatuses(statusOperations.getAll());
    } else {
      alert('Failed to delete status.');
    }
  };

  const handleSaveStatus = (statusData: Omit<Status, 'id' | 'createdAt' | 'updatedAt'>): void => {
    if (editingStatus) {
      // Update existing
      const updated = statusOperations.update(editingStatus.id, statusData);
      if (!updated) {
        alert('Failed to update status.');
        return;
      }
    } else {
      // Create new
      statusOperations.create(statusData);
    }

    setStatuses(statusOperations.getAll());
    setShowForm(false);
    setEditingStatus(undefined);
  };

  const handleCancelForm = (): void => {
    setShowForm(false);
    setEditingStatus(undefined);
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0 }}>Manage Statuses ({filteredStatuses.length})</h2>
        <button onClick={handleCreateClick} style={{
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Create New Status
        </button>
      </div>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search statuses..."
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

      {/* Status Table */}
      {filteredStatuses.length === 0 ? (
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p>No statuses found.</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 120px 1fr 150px 120px 80px 100px',
            backgroundColor: '#f5f5f5',
            padding: '1rem',
            fontWeight: 'bold',
            borderBottom: '1px solid #ddd'
          }}>
            <div>Color</div>
            <div>Name</div>
            <div>Entity Types</div>
            <div>Description</div>
            <div>Created</div>
            <div>Updated</div>
            <div>Projects</div>
            <div>Actions</div>
          </div>

          {/* Table Rows */}
          {filteredStatuses.map((status, index) => (
            <div
              key={status.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 120px 1fr 150px 120px 80px 100px',
                padding: '1rem',
                borderBottom: index < filteredStatuses.length - 1 ? '1px solid #eee' : 'none',
                backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
              }}
            >
              {/* Color Indicator */}
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: status.color,
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 0 0 1px #ddd'
              }} />

              {/* Status Name */}
              <div style={{
                fontWeight: 'bold',
                color: '#333'
              }}>
                {status.name}
              </div>

              {/* Entity Types */}
              <div>
                {status.entityTypes.map(type => (
                  <span
                    key={type}
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      marginRight: '0.25rem',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div style={{
                color: '#666',
                fontSize: '0.9rem'
              }}>
                {status.description}
              </div>

              {/* Created Date */}
              <div style={{
                fontSize: '0.8rem',
                color: '#888'
              }}>
                {formatDate(status.createdAt)}
              </div>

              {/* Updated Date */}
              <div style={{
                fontSize: '0.8rem',
                color: '#888'
              }}>
                {formatDate(status.updatedAt)}
              </div>

              {/* Project Count */}
              <div style={{
                fontSize: '0.8rem',
                color: '#666',
                textAlign: 'center'
              }}>
                <span style={{
                  backgroundColor: getProjectCount(status.id) > 0 ? '#e8f5e8' : '#f5f5f5',
                  color: getProjectCount(status.id) > 0 ? '#2e7d32' : '#666',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  {getProjectCount(status.id)}
                </span>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button
                  onClick={() => handleEditClick(status)}
                  style={{
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(status.id)}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage Information */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#e8f5e8',
        borderRadius: '8px',
        border: '1px solid #4caf50'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2e7d32' }}>
          Status Usage Summary
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {statuses.map(status => {
            const projectCount = getProjectCount(status.id);
            return (
              <div key={status.id} style={{
                backgroundColor: 'white',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: status.color,
                    borderRadius: '50%'
                  }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{status.name}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  {projectCount} project{projectCount !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Form Modal */}
      {showForm && (
        <StatusForm
          status={editingStatus}
          onSave={handleSaveStatus}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
};

export default StatusManagement;