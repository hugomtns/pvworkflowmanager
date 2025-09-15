import type { Status, Workflow, Project, User, Task } from '../types';
import { saveToStorage, loadFromStorage, STORAGE_KEYS, clearAllData } from '../utils/localStorage';
import { 
  createMockUsers, 
  createMockStatuses, 
  createMockWorkflows, 
  createMockProjects,
  createMockTasks // New for Epic 7
} from './mockData';

// Versioned data initialization so we can reseed when structure/content changes
const DATA_VERSION_KEY = 'pvworkflow_data_version';
const CURRENT_DATA_VERSION = '3'; // Updated for Epic 7

// Initialize data if localStorage is empty or version changed
export const initializeData = (): void => {
  try {
    const version = localStorage.getItem(DATA_VERSION_KEY);
    const existingStatuses = loadFromStorage<Status>(STORAGE_KEYS.STATUSES);

    if (version !== CURRENT_DATA_VERSION || existingStatuses.length === 0) {
      clearAllData();
      saveToStorage(STORAGE_KEYS.USERS, createMockUsers());
      saveToStorage(STORAGE_KEYS.STATUSES, createMockStatuses());
      saveToStorage(STORAGE_KEYS.WORKFLOWS, createMockWorkflows());
      saveToStorage(STORAGE_KEYS.PROJECTS, createMockProjects());
      saveToStorage(STORAGE_KEYS.TASKS, createMockTasks()); // New for Epic 7
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
      console.log('Data reseeded to localStorage (version', CURRENT_DATA_VERSION, ')');
    } else {
      console.log('Data already up-to-date in localStorage (version', version, ')');
    }
  } catch (e) {
    console.warn('Failed versioned init, falling back to basic init', e);
    const existingStatuses = loadFromStorage<Status>(STORAGE_KEYS.STATUSES);
    if (existingStatuses.length === 0) {
      saveToStorage(STORAGE_KEYS.USERS, createMockUsers());
      saveToStorage(STORAGE_KEYS.STATUSES, createMockStatuses());
      saveToStorage(STORAGE_KEYS.WORKFLOWS, createMockWorkflows());
      saveToStorage(STORAGE_KEYS.PROJECTS, createMockProjects());
      saveToStorage(STORAGE_KEYS.TASKS, createMockTasks()); // New for Epic 7
    }
  }
};

export const reseedData = (): void => {
  clearAllData();
  saveToStorage(STORAGE_KEYS.USERS, createMockUsers());
  saveToStorage(STORAGE_KEYS.STATUSES, createMockStatuses());
  saveToStorage(STORAGE_KEYS.WORKFLOWS, createMockWorkflows());
  saveToStorage(STORAGE_KEYS.PROJECTS, createMockProjects());
  saveToStorage(STORAGE_KEYS.TASKS, createMockTasks()); // New for Epic 7
  localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
  console.log('Data manually reseeded');
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
  },

  create: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Workflow => {
    const workflows = loadFromStorage<Workflow>(STORAGE_KEYS.WORKFLOWS);
    
    // If this is set as default, remove default from other workflows of same entity type
    if (workflow.isDefault) {
      workflows.forEach(w => {
        if (w.entityType === workflow.entityType && w.isDefault) {
          w.isDefault = false;
        }
      });
    }
    
    const newWorkflow: Workflow = {
      ...workflow,
      id: `workflow-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    workflows.push(newWorkflow);
    saveToStorage(STORAGE_KEYS.WORKFLOWS, workflows);
    return newWorkflow;
  },
  
  update: (id: string, updates: Partial<Workflow>): Workflow | null => {
    const workflows = loadFromStorage<Workflow>(STORAGE_KEYS.WORKFLOWS);
    const index = workflows.findIndex(workflow => workflow.id === id);
    
    if (index === -1) return null;
    
    // If this is being set as default, remove default from other workflows of same entity type
    if (updates.isDefault) {
      workflows.forEach(w => {
        if (w.entityType === (updates.entityType || workflows[index].entityType) && w.isDefault && w.id !== id) {
          w.isDefault = false;
        }
      });
    }
    
    workflows[index] = {
      ...workflows[index],
      ...updates,
      updatedAt: new Date()
    };
    
    saveToStorage(STORAGE_KEYS.WORKFLOWS, workflows);
    return workflows[index];
  },
  
  delete: (id: string): boolean => {
    const workflows = loadFromStorage<Workflow>(STORAGE_KEYS.WORKFLOWS);
    const filteredWorkflows = workflows.filter(workflow => workflow.id !== id);
    
    if (filteredWorkflows.length === workflows.length) return false;
    
    saveToStorage(STORAGE_KEYS.WORKFLOWS, filteredWorkflows);
    return true;
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

// Task CRUD operations - New for Epic 7
export const taskOperations = {
  getAll: (): Task[] => loadFromStorage<Task>(STORAGE_KEYS.TASKS),
  
  getById: (id: string): Task | undefined => {
    const tasks = loadFromStorage<Task>(STORAGE_KEYS.TASKS);
    return tasks.find(task => task.id === id);
  },
  
  getByTransitionId: (transitionId: string): Task[] => {
    const tasks = loadFromStorage<Task>(STORAGE_KEYS.TASKS);
    return tasks.filter(task => task.transitionId === transitionId);
  },
  
  getByAssignedUser: (userId: string): Task[] => {
    const tasks = loadFromStorage<Task>(STORAGE_KEYS.TASKS);
    return tasks.filter(task => task.assignedUserId === userId);
  },
  
  getIncompleteByTransitionId: (transitionId: string): Task[] => {
    const tasks = loadFromStorage<Task>(STORAGE_KEYS.TASKS);
    return tasks.filter(task => task.transitionId === transitionId && !task.isCompleted);
  },
  
  create: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const tasks = loadFromStorage<Task>(STORAGE_KEYS.TASKS);
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    tasks.push(newTask);
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  },
  
  update: (id: string, updates: Partial<Task>): Task | null => {
    const tasks = loadFromStorage<Task>(STORAGE_KEYS.TASKS);
    const index = tasks.findIndex(task => task.id === id);
    
    if (index === -1) return null;
    
    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date()
    };
    
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  },
  
  delete: (id: string): boolean => {
    const tasks = loadFromStorage<Task>(STORAGE_KEYS.TASKS);
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === tasks.length) return false;
    
    saveToStorage(STORAGE_KEYS.TASKS, filteredTasks);
    return true;
  },
  
  markCompleted: (id: string, completedByUserId: string): Task | null => {
    const tasks = loadFromStorage<Task>(STORAGE_KEYS.TASKS);
    const index = tasks.findIndex(task => task.id === id);
    
    if (index === -1) return null;
    
    tasks[index] = {
      ...tasks[index],
      isCompleted: true,
      completedAt: new Date(),
      completedBy: completedByUserId,
      updatedAt: new Date()
    };
    
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  },
  
  markIncomplete: (id: string): Task | null => {
    const tasks = loadFromStorage<Task>(STORAGE_KEYS.TASKS);
    const index = tasks.findIndex(task => task.id === id);
    
    if (index === -1) return null;
    
    tasks[index] = {
      ...tasks[index],
      isCompleted: false,
      completedAt: undefined,
      completedBy: undefined,
      updatedAt: new Date()
    };
    
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  }
};