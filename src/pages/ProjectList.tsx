import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { projectOperations, statusOperations, userOperations } from '../data/dataAccess';
import type { Project, Status, User } from '../types';
import StatusChangeModal from '../components/StatusChangeModal';
import StatusHistory from '../components/StatusHistory';
import UserTaskList from '../components/UserTaskList';
import ProjectForm from '../components/ProjectForm';
import ActionMenu, { type ActionMenuOption } from '../components/ActionMenu';
import { AppContext } from '../context/AppContext';
import { formatDate } from '../utils/common';


const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusModalProject, setStatusModalProject] = useState<Project | undefined>(undefined);
  const [historyProject, setHistoryProject] = useState<Project | undefined>(undefined);
  const [taskModalProject, setTaskModalProject] = useState<Project | undefined>(undefined);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | undefined>(undefined);
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

  // Memoized helper functions
  const getWorkflowForProject = useCallback((project: Project) =>
    workflows.find((wf: any) => wf.id === project.workflowId), [workflows]);

  const statusMap = useMemo(() => {
    const map = new Map<string, Status>();
    statuses.forEach(status => map.set(status.id, status));
    return map;
  }, [statuses]);

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach(user => map.set(user.id, user));
    return map;
  }, [users]);

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    const searchLower = searchTerm.toLowerCase();
    return projects.filter(project =>
      project.title.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower)
    );
  }, [projects, searchTerm]);

  // Memoize project task calculations to avoid heavy computation on every render
  const projectTaskData = useMemo(() => {
    const dataMap = new Map<string, { requiredCount: number; completedCount: number }>();

    filteredProjects.forEach(project => {
      const workflow = workflows.find((wf: any) => wf.id === project.workflowId);
      const possibleTransitions = workflow
        ? workflow.transitions.filter((tr: any) => tr.fromStatusId === project.currentStatusId)
        : [];
      const relevantTransitionIds = possibleTransitions.map((t: any) => t.id);
      const projectTasks = tasks.filter((task: any) => relevantTransitionIds.includes(task.transitionId));
      const requiredCount = projectTasks.filter((t: any) => t.isRequired).length || projectTasks.length;
      const completedCount = projectTasks.filter((t: any) => t.isCompleted).length;

      dataMap.set(project.id, { requiredCount, completedCount });
    });

    return dataMap;
  }, [filteredProjects, workflows, tasks]);

  // Memoized event handlers
  const handleTaskModal = useCallback((project: Project) => {
    setTaskModalProject(project);
  }, []);

  const handleStatusModal = useCallback((project: Project) => {
    setStatusModalProject(project);
  }, []);

  const handleHistoryModal = useCallback((project: Project) => {
    setHistoryProject(project);
  }, []);

  // Handle navigating to project details
  const handleViewProject = useCallback((project: Project) => {
    navigate(`/projects/${project.id}`);
  }, [navigate]);

  // Handle creating new project
  const handleCreateProject = useCallback(() => {
    setProjectToEdit(undefined);
    setProjectFormOpen(true);
  }, []);

  // Handle editing existing project
  const handleEditProject = useCallback((project: Project) => {
    setProjectToEdit(project);
    setProjectFormOpen(true);
  }, []);

  // Handle saving project (create or update)
  const handleSaveProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'lastEditedAt' | 'statusHistory'>) => {
    if (projectToEdit) {
      // Update existing project
      const updated = projectOperations.update(projectToEdit.id, {
        ...projectData,
        lastEditedAt: new Date()
      });
      if (updated) {
        setProjects(projectOperations.getAll());
      }
    } else {
      // Create new project
      const newProject: Omit<Project, 'id'> = {
        ...projectData,
        createdAt: new Date(),
        lastEditedAt: new Date(),
        statusHistory: []
      };
      const created = projectOperations.create(newProject);
      if (created) {
        setProjects(projectOperations.getAll());
      }
    }
    setProjectFormOpen(false);
    setProjectToEdit(undefined);
  }, [projectToEdit]);

  // Handle closing project form
  const handleCloseProjectForm = useCallback(() => {
    setProjectFormOpen(false);
    setProjectToEdit(undefined);
  }, []);

  // Create action menu options for each project
  const createProjectActionMenu = useCallback((project: Project): ActionMenuOption[] => [
    {
      label: 'View Details',
      icon: '👁️',
      onClick: () => handleViewProject(project)
    },
    {
      label: 'Edit Project',
      icon: '✏️',
      onClick: () => handleEditProject(project)
    },
    {
      label: 'Change Status',
      icon: '🔄',
      onClick: () => handleStatusModal(project)
    },
    {
      label: 'View History',
      icon: '📋',
      onClick: () => handleHistoryModal(project)
    }
  ], [handleViewProject, handleEditProject, handleStatusModal, handleHistoryModal]);

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0 }}>Projects ({filteredProjects.length})</h2>
        <button
          onClick={handleCreateProject}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
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
          className="form-search"
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
            const status = statusMap.get(project.currentStatusId);
            const creator = userMap.get(project.creator);
            const taskData = projectTaskData.get(project.id) || { requiredCount: 0, completedCount: 0 };
            const { requiredCount, completedCount } = taskData;

            return (
              <div
                key={project.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textAlign: 'left',
                  transition: 'box-shadow 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                {/* Action Menu */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px'
                }}>
                  <ActionMenu
                    options={createProjectActionMenu(project)}
                    buttonStyle={{
                      fontSize: '18px',
                      padding: '6px 10px'
                    }}
                  />
                </div>

                {/* Project Title */}
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  color: '#333',
                  fontSize: '1.25rem',
                  paddingRight: '40px' // Add padding to avoid overlap with action menu
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
                  {(() => {
                    const hasTasks = requiredCount > 0;
                    const allDone = hasTasks && completedCount >= requiredCount;
                    const summaryColor = !hasTasks ? '#1976d2' : allDone ? '#388e3c' : '#d32f2f';
                    return (
                      <button
                        onClick={() => handleTaskModal(project)}
                        style={{ background: 'transparent', border: 'none', color: summaryColor, cursor: 'pointer', fontWeight: 700 }}
                      >
                        Completed tasks: {completedCount}/{requiredCount}
                      </button>
                    );
                  })()}
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

      {/* Project form modal */}
      <ProjectForm
        project={projectToEdit}
        isOpen={projectFormOpen}
        onClose={handleCloseProjectForm}
        onSave={handleSaveProject}
      />
    </div>
  );
};

export default ProjectList;