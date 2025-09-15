import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { projectOperations, statusOperations, userOperations } from '../data/dataAccess';
import type { Project, Status, User } from '../types';
import StatusChangeModal from '../components/StatusChangeModal';
import StatusHistory from '../components/StatusHistory';
import UserTaskList from '../components/UserTaskList';
import { AppContext } from '../context/AppContext';


const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusModalProject, setStatusModalProject] = useState<Project | undefined>(undefined);
  const [historyProject, setHistoryProject] = useState<Project | undefined>(undefined);
  const [taskModalProject, setTaskModalProject] = useState<Project | undefined>(undefined);
  const { currentUser, workflows, tasks } = useContext(AppContext);

  // Load data when component mounts

  useEffect(() => {
    setProjects(projectOperations.getAll());
    setStatuses(statusOperations.getAll());
    setUsers(userOperations.getAll());
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTaskModalProject(undefined);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [taskModalProject]);

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
            // workflow intentionally not used here; UserTaskList will compute relevant transitions
            // Compute completed/required counts for compact summary
            const workflow = workflows.find((wf: any) => wf.id === project.workflowId);
            const possibleTransitions = workflow ? workflow.transitions.filter((tr: any) => tr.fromStatusId === project.currentStatusId) : [];
            const relevantTransitionIds = possibleTransitions.map((t: any) => t.id);
            const projectTasks = tasks.filter((task: any) => relevantTransitionIds.includes(task.transitionId));
            const requiredCount = projectTasks.filter((t: any) => t.isRequired).length || projectTasks.length;
            const completedCount = projectTasks.filter((t: any) => t.isCompleted).length;

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

                {/* Compact tasks summary - click to open modal with details */}
                <div style={{ margin: '0.6rem 0' }}>
                  <button
                    onClick={() => setTaskModalProject(project)}
                    style={{ background: 'transparent', border: 'none', color: '#1976d2', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Completed tasks: {completedCount}/{requiredCount}
                  </button>
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
      {/* Task details modal (portal) */}
      {taskModalProject && createPortal(
        <div className="modal" data-portal="task-list" onClick={(e) => { if (e.target === e.currentTarget) setTaskModalProject(undefined); }}>
          <div className="task-form wide" role="dialog" aria-modal="true">
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Pending Tasks for {taskModalProject.title}</h2>
            <UserTaskList project={taskModalProject} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={() => setTaskModalProject(undefined)} style={{ background: '#fff', color: '#1976d2', border: '1px solid #1976d2', borderRadius: 4, padding: '0.5rem 0.9rem', cursor: 'pointer', fontWeight: 600 }}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProjectList;