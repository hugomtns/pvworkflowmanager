import type { Status, Workflow, Project, User } from '../types';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/localStorage';
import { 
  createMockUsers, 
  createMockStatuses, 
  createMockWorkflows, 
  createMockProjects 
} from './mockData';

// Initialize data if localStorage is empty
export const initializeData = (): void => {
  // Check if data already exists
  const existingStatuses = loadFromStorage<Status>(STORAGE_KEYS.STATUSES);
  
  if (existingStatuses.length === 0) {
    // Seed initial data
    saveToStorage(STORAGE_KEYS.USERS, createMockUsers());
    saveToStorage(STORAGE_KEYS.STATUSES, createMockStatuses());
    saveToStorage(STORAGE_KEYS.WORKFLOWS, createMockWorkflows());
    saveToStorage(STORAGE_KEYS.PROJECTS, createMockProjects());
    
    console.log('Initial data seeded to localStorage');
  } else {
    console.log('Data already exists in localStorage');
  }
};

// Status CRUD operations
export const statusOperations = {
  getAll: (): Status[] => loadFromStorage<Status>(STORAGE_KEYS.STATUSES),
  
  getById: (id: string): Status | undefined => {
    const statuses = loadFromStorage<Status>(STORAGE_KEYS.STATUSES);
    return statuses.find(status => status.id === id);
  },
  
  create: (status: Omit<Status, 'id' | 'createdAt' | 'updatedAt'>): Status => {
    const statuses = loadFromStorage<Status>(STORAGE_KEYS.STATUSES);
    const newStatus: Status = {
      ...status,
      id: `status-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    statuses.push(newStatus);
    saveToStorage(STORAGE_KEYS.STATUSES, statuses);
    return newStatus;
  },
  
  update: (id: string, updates: Partial<Status>): Status | null => {
    const statuses = loadFromStorage<Status>(STORAGE_KEYS.STATUSES);
    const index = statuses.findIndex(status => status.id === id);
    
    if (index === -1) return null;
    
    statuses[index] = {
      ...statuses[index],
      ...updates,
      updatedAt: new Date()
    };
    
    saveToStorage(STORAGE_KEYS.STATUSES, statuses);
    return statuses[index];
  },
  
  delete: (id: string): boolean => {
    const statuses = loadFromStorage<Status>(STORAGE_KEYS.STATUSES);
    const filteredStatuses = statuses.filter(status => status.id !== id);
    
    if (filteredStatuses.length === statuses.length) return false;
    
    saveToStorage(STORAGE_KEYS.STATUSES, filteredStatuses);
    return true;
  }
};

// Project CRUD operations
export const projectOperations = {
  getAll: (): Project[] => loadFromStorage<Project>(STORAGE_KEYS.PROJECTS),
  
  getById: (id: string): Project | undefined => {
    const projects = loadFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    return projects.find(project => project.id === id);
  },
  
  create: (project: Omit<Project, 'id' | 'createdAt' | 'lastEditedAt' | 'statusHistory'>): Project => {
    const projects = loadFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date(),
      lastEditedAt: new Date(),
      statusHistory: [{
        id: `hist-${Date.now()}`,
        toStatusId: project.currentStatusId,
        userId: project.creator,
        timestamp: new Date(),
        comment: 'Project created',
        tasksCompleted: []
      }]
    };
    projects.push(newProject);
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  },
  
  update: (id: string, updates: Partial<Project>): Project | null => {
    const projects = loadFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const index = projects.findIndex(project => project.id === id);
    
    if (index === -1) return null;
    
    projects[index] = {
      ...projects[index],
      ...updates,
      lastEditedAt: new Date()
    };
    
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    return projects[index];
  },
  
  delete: (id: string): boolean => {
    const projects = loadFromStorage<Project>(STORAGE_KEYS.PROJECTS);
    const filteredProjects = projects.filter(project => project.id !== id);
    
    if (filteredProjects.length === projects.length) return false;
    
    saveToStorage(STORAGE_KEYS.PROJECTS, filteredProjects);
    return true;
  }
};

// Workflow CRUD operations
export const workflowOperations = {
  getAll: (): Workflow[] => loadFromStorage<Workflow>(STORAGE_KEYS.WORKFLOWS),
  
  getById: (id: string): Workflow | undefined => {
    const workflows = loadFromStorage<Workflow>(STORAGE_KEYS.WORKFLOWS);
    return workflows.find(workflow => workflow.id === id);
  }
};

// User operations
export const userOperations = {
  getAll: (): User[] => loadFromStorage<User>(STORAGE_KEYS.USERS),
  
  getById: (id: string): User | undefined => {
    const users = loadFromStorage<User>(STORAGE_KEYS.USERS);
    return users.find(user => user.id === id);
  }
};