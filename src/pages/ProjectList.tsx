import React, { useState, useEffect } from 'react';
import { projectOperations, statusOperations, userOperations } from '../data/dataAccess';
import type { Project, Status, User } from '../types';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data when component mounts
  useEffect(() => {
    setProjects(projectOperations.getAll());
    setStatuses(statusOperations.getAll());
    setUsers(userOperations.getAll());
  }, []);

  // Helper function to get status by ID
  const getStatusById = (statusId: string): Status | undefined => {
    return statuses.find(status => status.id === statusId);
  };

  // Helper function to get user by ID
  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0 }}>Projects ({filteredProjects.length})</h2>
        <button style={{
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Create New Project
        </button>
      </div>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search projects..."
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

      {/* Project Cards */}
      {filteredProjects.length === 0 ? (
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p>No projects found.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredProjects.map(project => {
            const status = getStatusById(project.currentStatusId);
            const creator = getUserById(project.creator);
            
            return (
              <div
                key={project.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                {/* Project Title */}
                <h3 style={{ 
                  margin: '0 0 0.5rem 0',
                  color: '#333',
                  fontSize: '1.25rem'
                }}>
                  {project.title}
                </h3>
                
                {/* Project Description */}
                <p style={{ 
                  margin: '0 0 1rem 0',
                  color: '#666',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {project.description}
                </p>
                
                {/* Status Badge */}
                <div style={{
                  display: 'inline-block',
                  backgroundColor: status?.color || '#999',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  {status?.name || 'Unknown Status'}
                </div>
                
                {/* Project Metadata */}
                <div style={{ 
                  fontSize: '0.8rem',
                  color: '#888',
                  borderTop: '1px solid #eee',
                  paddingTop: '1rem'
                }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>Created:</strong> {formatDate(project.createdAt)}
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>Last Updated:</strong> {formatDate(project.lastEditedAt)}
                  </div>
                  <div>
                    <strong>Creator:</strong> {creator?.name || 'Unknown User'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectList;