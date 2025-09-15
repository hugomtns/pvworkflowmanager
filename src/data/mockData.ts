import type { Status, Workflow, Project, User, Transition, StatusHistoryEntry } from '../types';

// Generate unique IDs
const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock Users
export const createMockUsers = (): User[] => [
  {
    id: 'user-1',
    name: 'John Admin',
    email: 'john@pvcompany.com',
    role: 'admin'
  },
  {
    id: 'user-2',
    name: 'Sarah Manager',
    email: 'sarah@pvcompany.com',
    role: 'user'
  },
  {
    id: 'user-3',
    name: 'Mike Technician',
    email: 'mike@pvcompany.com',
    role: 'user'
  }
];

// Mock Statuses
export const createMockStatuses = (): Status[] => [
  {
    id: 'status-1',
    name: 'Planning',
    color: '#2196f3',
    description: 'Initial project planning phase',
    entityTypes: ['project'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'status-2',
    name: 'Design Review',
    color: '#ff9800',
    description: 'Technical design review and approval',
    entityTypes: ['project'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'status-3',
    name: 'Customer Approval',
    color: '#9c27b0',
    description: 'Waiting for customer approval',
    entityTypes: ['project'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'status-4',
    name: 'Installation Ready',
    color: '#4caf50',
    description: 'Ready for installation',
    entityTypes: ['project'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'status-5',
    name: 'Completed',
    color: '#8bc34a',
    description: 'Project completed successfully',
    entityTypes: ['project'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

// Mock Transitions
export const createMockTransitions = (): Transition[] => [
  {
    id: 'trans-1',
    fromStatusId: 'status-1',
    toStatusId: 'status-2',
    requiresApproval: false,
    approverRoles: [],
    approverUserIds: [],
    tasks: [],
    conditions: []
  },
  {
    id: 'trans-2',
    fromStatusId: 'status-2',
    toStatusId: 'status-3',
    requiresApproval: true,
    approverRoles: ['admin'],
    approverUserIds: [],
    tasks: [],
    conditions: []
  },
  {
    id: 'trans-3',
    fromStatusId: 'status-3',
    toStatusId: 'status-4',
    requiresApproval: false,
    approverRoles: [],
    approverUserIds: [],
    tasks: [],
    conditions: []
  },
  {
    id: 'trans-4',
    fromStatusId: 'status-4',
    toStatusId: 'status-5',
    requiresApproval: false,
    approverRoles: [],
    approverUserIds: [],
    tasks: [],
    conditions: []
  }
];

// Mock Workflows
export const createMockWorkflows = (): Workflow[] => [
  {
    id: 'workflow-1',
    name: 'Standard PV Project Workflow',
    description: 'Default workflow for photovoltaic installation projects',
    entityType: 'project',
    statuses: ['status-1', 'status-2', 'status-3', 'status-4', 'status-5'],
    transitions: createMockTransitions(),
    isDefault: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

// Mock Projects
export const createMockProjects = (): Project[] => [
  {
    id: 'project-1',
    title: 'Residential Solar - Johnson Family',
    description: '15kW residential solar installation for Johnson family home',
    creator: 'user-2',
    createdAt: new Date('2024-02-01'),
    lastEditedAt: new Date('2024-02-05'),
    currentStatusId: 'status-2',
    workflowId: 'workflow-1',
    statusHistory: [
      {
        id: 'hist-1',
        toStatusId: 'status-1',
        userId: 'user-2',
        timestamp: new Date('2024-02-01'),
        comment: 'Project initiated',
        tasksCompleted: []
      },
      {
        id: 'hist-2',
        fromStatusId: 'status-1',
        toStatusId: 'status-2',
        userId: 'user-2',
        timestamp: new Date('2024-02-05'),
        comment: 'Planning completed, moving to design review',
        tasksCompleted: []
      }
    ]
  },
  {
    id: 'project-2',
    title: 'Commercial Solar - ABC Manufacturing',
    description: '50kW commercial solar installation for manufacturing facility',
    creator: 'user-3',
    createdAt: new Date('2024-01-20'),
    lastEditedAt: new Date('2024-02-10'),
    currentStatusId: 'status-4',
    workflowId: 'workflow-1',
    statusHistory: [
      {
        id: 'hist-3',
        toStatusId: 'status-1',
        userId: 'user-3',
        timestamp: new Date('2024-01-20'),
        comment: 'Commercial project started',
        tasksCompleted: []
      }
    ]
  },
  {
    id: 'project-3',
    title: 'Community Solar - Green Valley',
    description: '100kW community solar project for Green Valley neighborhood',
    creator: 'user-1',
    createdAt: new Date('2024-01-10'),
    lastEditedAt: new Date('2024-01-15'),
    currentStatusId: 'status-1',
    workflowId: 'workflow-1',
    statusHistory: [
      {
        id: 'hist-4',
        toStatusId: 'status-1',
        userId: 'user-1',
        timestamp: new Date('2024-01-10'),
        comment: 'Large community project in planning phase',
        tasksCompleted: []
      }
    ]
  }
];