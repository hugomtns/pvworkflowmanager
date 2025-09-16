/**
 * ProjectDetail Page - Individual project view with design listings
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectOperations, designOperations, statusOperations, userOperations } from '../data/dataAccess';
import type { Project, Design, Status, User } from '../types';
import DesignList from '../components/DesignList';
import { formatDate } from '../utils/common';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Load project and related data
  useEffect(() => {
    const loadData = async () => {
      if (!projectId) {
        navigate('/');
        return;
      }

      try {
        const projectData = projectOperations.getById(projectId);
        if (!projectData) {
          navigate('/');
          return;
        }

        const designData = designOperations.getByProjectId(projectId);
        const statusData = statusOperations.getAll();
        const userData = userOperations.getAll();

        setProject(projectData);
        setDesigns(designData);
        setStatuses(statusData);
        setUsers(userData);
      } catch (error) {
        console.error('Error loading project data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, navigate]);

  // Memoized helper functions
  const currentStatus = useMemo(() => {
    return statuses.find(status => status.id === project?.currentStatusId);
  }, [statuses, project?.currentStatusId]);

  const creator = useMemo(() => {
    return users.find(user => user.id === project?.creator);
  }, [users, project?.creator]);

  const activeDesign = useMemo(() => {
    return designs.find(design => design.isActive);
  }, [designs]);

  const designStats = useMemo(() => {
    const total = designs.length;
    const approved = designs.filter(d => d.approvalStatus === 'approved').length;
    const pending = designs.filter(d => d.approvalStatus === 'pending').length;
    const draft = designs.filter(d => d.approvalStatus === 'draft').length;
    return { total, approved, pending, draft };
  }, [designs]);

  // Handle design updates
  const handleDesignUpdate = () => {
    if (projectId) {
      const updatedDesigns = designOperations.getByProjectId(projectId);
      setDesigns(updatedDesigns);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '1.1rem',
        color: '#666'
      }}>
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
      }}>
        <h2>Project Not Found</h2>
        <p>The requested project could not be found.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with back button and project title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '0.5rem'
            }}
          >
            ← Back to Projects
          </button>
          <h1 style={{ margin: '0.5rem 0 0 0' }}>{project.title}</h1>
        </div>
      </div>

      {/* Project Overview Card */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Project Overview</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div>
            <p style={{ margin: '0 0 1rem 0', lineHeight: '1.5' }}>
              <strong>Description:</strong> {project.description}
            </p>

            {activeDesign && (
              <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Active Design: {activeDesign.title}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                  <div>
                    <strong>System Size:</strong> {activeDesign.systemSpecs.dcCapacity} kW DC
                  </div>
                  <div>
                    <strong>Annual Production:</strong> {activeDesign.systemSpecs.annualProduction.toLocaleString()} kWh
                  </div>
                  <div>
                    <strong>System Cost:</strong> ${activeDesign.systemSpecs.systemCost.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            {/* Status Badge */}
            <div style={{
              display: 'inline-block',
              backgroundColor: currentStatus?.color || '#999',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              {currentStatus?.name || 'Unknown Status'}
            </div>

            {/* Project Metadata */}
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Created:</strong> {formatDate(project.createdAt)}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Last Updated:</strong> {formatDate(project.lastEditedAt)}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Creator:</strong> {creator?.name || 'Unknown User'}
              </div>
            </div>

            {/* Design Statistics */}
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Design Summary</h4>
              <div style={{ fontSize: '0.9rem' }}>
                <div>Total Designs: <strong>{designStats.total}</strong></div>
                <div>Approved: <strong style={{ color: '#4caf50' }}>{designStats.approved}</strong></div>
                <div>Pending: <strong style={{ color: '#ff9800' }}>{designStats.pending}</strong></div>
                <div>Draft: <strong style={{ color: '#666' }}>{designStats.draft}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Designs Section */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>PV Layout Designs</h2>
        <DesignList
          designs={designs}
          projectId={project.id}
          onDesignUpdate={handleDesignUpdate}
        />
      </div>
    </div>
  );
};

export default ProjectDetail;