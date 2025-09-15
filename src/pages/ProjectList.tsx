import React, { useState, useEffect, useContext } from 'react';
import { projectOperations, statusOperations, userOperations } from '../data/dataAccess';
import type { Project, Status, User } from '../types';
import StatusChangeModal from '../components/StatusChangeModal';
import StatusHistory from '../components/StatusHistory';
import { AppContext } from '../context/AppContext';


const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusModalProject, setStatusModalProject] = useState<Project | undefined>(undefined);
  const [historyProject, setHistoryProject] = useState<Project | undefined>(undefined);
  const { currentUser, tasks, updateTask, isAdmin, workflows } = useContext(AppContext);

  // Load data when component mounts

  useEffect(() => {
    setProjects(projectOperations.getAll());
    setStatuses(statusOperations.getAll());
    setUsers(userOperations.getAll());
  }, []);

  // Helper functions
  const getWorkflowForProject = (project: Project) => workflows.find((wf: any) => wf.id === project.workflowId);
  const getStatusById = (statusId: string) => statuses.find(status => status.id === statusId);
  const getUserById = (userId: string) => users.find(user => user.id === userId);
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
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
            const workflow = workflows.find((wf: any) => wf.id === project.workflowId);
            // Find transitions from current status
            const possibleTransitions = workflow ? workflow.transitions.filter((tr: any) => tr.fromStatusId === project.currentStatusId) : [];
            // Tasks for current status transitions (pending)
            const pendingTasks = tasks.filter((task: any) =>
              possibleTransitions.some((tr: any) => tr.id === task.transitionId) &&
              !task.isCompleted &&
              (task.assignedUserId === currentUser.id || isAdmin)
            );

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

                {/* Pending Tasks Section */}
                {pendingTasks.length > 0 && (
                  <div style={{ margin: '1.2rem 0 0.5rem 0', background: '#f5fafd', borderRadius: 6, padding: '1rem', border: '1px solid #e3f2fd' }}>
                    <div style={{ fontWeight: 600, color: '#1976d2', marginBottom: 8 }}>Pending Tasks for Next Transitions</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'none' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Task</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Goal</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Deadline</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingTasks.map((task: any) => (
                          <tr key={task.id} style={{ borderBottom: '1px solid #e3e3e3' }}>
                            <td style={{ padding: '0.5rem' }}>{task.name}</td>
                            <td style={{ padding: '0.5rem' }}>{task.description}</td>
                            <td style={{ padding: '0.5rem' }}>{task.deadline ? (task.deadline instanceof Date ? task.deadline.toLocaleDateString() : new Date(task.deadline).toLocaleDateString()) : '-'}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              <button
                                onClick={() => updateTask({ ...task, isCompleted: true, completedAt: new Date(), completedBy: currentUser.id })}
                                style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 4, padding: '0.35rem 1.1rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 1px 4px #388e3c22', transition: 'background 0.15s' }}
                                onMouseOver={e => (e.currentTarget.style.background = '#256029')}
                                onMouseOut={e => (e.currentTarget.style.background = '#388e3c')}
                              >
                                Mark as Done
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

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
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setStatusModalProject(project)}
                      style={{ backgroundColor: '#6a1b9a', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Change Status
                    </button>
                    <button
                      onClick={() => setHistoryProject(project)}
                      style={{ backgroundColor: '#2196f3', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      View History
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {statusModalProject && (
        <StatusChangeModal
          project={statusModalProject}
          workflow={getWorkflowForProject(statusModalProject)}
          statuses={statuses}
          currentUser={currentUser}
          onCancel={() => setStatusModalProject(undefined)}
          onConfirm={(transition) => {
            const project = statusModalProject;
            if (!project) return;
            const updated = projectOperations.update(project.id, {
              currentStatusId: transition.toStatusId,
              lastEditedAt: new Date()
            });
            if (updated) {
              // Append history entry
              const historyEntry = {
                id: `hist-${Date.now()}`,
                fromStatusId: project.currentStatusId,
                toStatusId: transition.toStatusId,
                userId: currentUser?.id || 'user-unknown',
                timestamp: new Date(),
                comment: undefined,
                tasksCompleted: [],
                approvedBy: transition.requiresApproval ? (currentUser?.id || 'user-unknown') : undefined
              };
              const nextHistory = [...(updated.statusHistory || []), historyEntry];
              projectOperations.update(project.id, { statusHistory: nextHistory });
              setProjects(projectOperations.getAll());
            } else {
              alert('Failed to update project status.');
            }
            setStatusModalProject(undefined);
          }}
        />
      )}
      {historyProject && (
        <StatusHistory
          project={historyProject}
          statuses={statuses}
          users={users}
          onClose={() => setHistoryProject(undefined)}
        />
      )}
    </div>
  );
};

export default ProjectList;