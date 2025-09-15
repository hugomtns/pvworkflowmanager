import type { Status, Workflow, Project, User, Transition } from '../types';

// Generate unique IDs
// const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
  },
  {
    id: 'user-4',
    name: 'Emily Designer',
    email: 'emily@pvcompany.com',
    role: 'user'
  },
  {
    id: 'user-5',
    name: 'Oliver Analyst',
    email: 'oliver@pvcompany.com',
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
  },
  {
    id: 'project-4',
    title: 'Industrial Solar - North Plant',
    description: '75kW industrial solar installation for North Plant facility',
    creator: 'user-4',
    createdAt: new Date('2024-02-12'),
    lastEditedAt: new Date('2024-02-14'),
    currentStatusId: 'status-3',
    workflowId: 'workflow-1',
    statusHistory: [
      {
        id: 'hist-5',
        toStatusId: 'status-1',
        userId: 'user-4',
        timestamp: new Date('2024-02-12'),
        comment: 'Project created for industrial site',
        tasksCompleted: []
      },
      {
        id: 'hist-6',
        fromStatusId: 'status-1',
        toStatusId: 'status-2',
        userId: 'user-4',
        timestamp: new Date('2024-02-13'),
        comment: 'Planning to design review',
        tasksCompleted: []
      },
      {
        id: 'hist-7',
        fromStatusId: 'status-2',
        toStatusId: 'status-3',
        userId: 'user-4',
        timestamp: new Date('2024-02-14'),
        comment: 'Design approved, awaiting customer approval',
        tasksCompleted: []
      }
    ]
  },
  {
    id: 'project-5',
    title: 'Retail Chain - City Center',
    description: '30kW solar installation for retail chain roof',
    creator: 'user-5',
    createdAt: new Date('2024-03-01'),
    lastEditedAt: new Date('2024-03-03'),
    currentStatusId: 'status-2',
    workflowId: 'workflow-1',
    statusHistory: [
      {
        id: 'hist-8',
        toStatusId: 'status-1',
        userId: 'user-5',
        timestamp: new Date('2024-03-01'),
        comment: 'Kickoff meeting completed',
        tasksCompleted: []
      },
      {
        id: 'hist-9',
        fromStatusId: 'status-1',
        toStatusId: 'status-2',
        userId: 'user-5',
        timestamp: new Date('2024-03-03'),
        comment: 'Moving to design review',
        tasksCompleted: []
      }
    ]
  },
  {
    id: 'project-6',
    title: 'Municipal Building - West Side',
    description: '40kW installation for municipal building',
    creator: 'user-2',
    createdAt: new Date('2024-02-18'),
    lastEditedAt: new Date('2024-02-20'),
    currentStatusId: 'status-5',
    workflowId: 'workflow-1',
    statusHistory: [
      {
        id: 'hist-10',
        toStatusId: 'status-1',
        userId: 'user-2',
        timestamp: new Date('2024-02-18'),
        comment: 'Project created',
        tasksCompleted: []
      },
      {
        id: 'hist-11',
        fromStatusId: 'status-1',
        toStatusId: 'status-2',
        userId: 'user-2',
        timestamp: new Date('2024-02-18'),
        tasksCompleted: []
      },
      {
        id: 'hist-12',
        fromStatusId: 'status-2',
        toStatusId: 'status-3',
        userId: 'user-2',
        timestamp: new Date('2024-02-19'),
        tasksCompleted: []
      },
      {
        id: 'hist-13',
        fromStatusId: 'status-3',
        toStatusId: 'status-4',
        userId: 'user-2',
        timestamp: new Date('2024-02-19'),
        tasksCompleted: []
      },
      {
        id: 'hist-14',
        fromStatusId: 'status-4',
        toStatusId: 'status-5',
        userId: 'user-2',
        timestamp: new Date('2024-02-20'),
        tasksCompleted: []
      }
    ]
  }
];