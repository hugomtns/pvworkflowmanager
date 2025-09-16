import type { Status, Workflow, Project, User, Transition, Task, Design } from '../types';

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

// Mock Tasks - New for Epic 7
export const createMockTasks = (): Task[] => [
  {
    id: 'task-1',
    name: 'Site Survey',
    description: 'Complete detailed site survey and measurements',
    assignedUserId: 'user-3', // Mike Technician
    deadline: new Date('2024-02-15'),
    isRequired: true,
    isCompleted: false,
    transitionId: 'trans-1', // Planning -> Design Review
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'task-2',
    name: 'Technical Drawing Review',
    description: 'Review and approve technical drawings and specifications',
    assignedUserId: 'user-4', // Emily Designer
    deadline: new Date('2024-02-20'),
    isRequired: true,
    isCompleted: false,
    transitionId: 'trans-2', // Design Review -> Customer Approval
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'task-3',
    name: 'Permit Documentation',
    description: 'Prepare and submit all required permit documentation',
    assignedUserId: 'user-2', // Sarah Manager
    deadline: new Date('2024-02-25'),
    isRequired: true,
    isCompleted: true,
    completedAt: new Date('2024-01-20'),
    completedBy: 'user-2',
    transitionId: 'trans-2', // Design Review -> Customer Approval
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'task-4',
    name: 'Equipment Procurement',
    description: 'Order and verify delivery of all installation equipment',
    assignedUserId: 'user-3', // Mike Technician
    deadline: new Date('2024-03-01'),
    isRequired: true,
    isCompleted: false,
    transitionId: 'trans-3', // Customer Approval -> Installation Ready
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'task-5',
    name: 'Final Quality Check',
    description: 'Perform comprehensive quality inspection and testing',
    assignedUserId: 'user-5', // Oliver Analyst
    deadline: new Date('2024-03-10'),
    isRequired: true,
    isCompleted: false,
    transitionId: 'trans-4', // Installation Ready -> Completed
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

// Mock Transitions - Updated to include tasks
export const createMockTransitions = (): Transition[] => [
  {
    id: 'trans-1',
    fromStatusId: 'status-1', // Planning
    toStatusId: 'status-2', // Design Review
    requiresApproval: false,
    approverRoles: [],
    approverUserIds: [],
    tasks: [], // Task will be linked via transitionId
    conditions: []
  },
  {
    id: 'trans-2',
    fromStatusId: 'status-2', // Design Review
    toStatusId: 'status-3', // Customer Approval
    requiresApproval: true,
    approverRoles: ['admin'],
    approverUserIds: [],
    tasks: [], // Tasks will be linked via transitionId
    conditions: []
  },
  {
    id: 'trans-3',
    fromStatusId: 'status-3', // Customer Approval
    toStatusId: 'status-4', // Installation Ready
    requiresApproval: false,
    approverRoles: [],
    approverUserIds: [],
    tasks: [], // Tasks will be linked via transitionId
    conditions: []
  },
  {
    id: 'trans-4',
    fromStatusId: 'status-4', // Installation Ready
    toStatusId: 'status-5', // Completed
    requiresApproval: true,
    approverRoles: ['admin'],
    approverUserIds: ['user-1'], // John Admin
    tasks: [], // Tasks will be linked via transitionId
    conditions: []
  }
];

// Mock Workflows
export const createMockWorkflows = (): Workflow[] => [
  {
    id: 'workflow-1',
    name: 'Standard PV Installation',
    description: 'Default workflow for photovoltaic system installations',
    entityType: 'project',
    statuses: ['status-1', 'status-2', 'status-3', 'status-4', 'status-5'],
    transitions: createMockTransitions(),
    isDefault: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    layout: {
      statusPositions: {
        'status-1': { x: 100, y: 80 },
        'status-2': { x: 300, y: 80 },
        'status-3': { x: 500, y: 80 },
        'status-4': { x: 700, y: 80 },
        'status-5': { x: 900, y: 80 }
      }
    }
  },
  {
    id: 'workflow-2',
    name: 'Express Installation',
    description: 'Simplified workflow for small residential installations',
    entityType: 'project',
    statuses: ['status-1', 'status-4', 'status-5'],
    transitions: [
      {
        id: 'trans-express-1',
        fromStatusId: 'status-1',
        toStatusId: 'status-4',
        requiresApproval: false,
        approverRoles: [],
        approverUserIds: [],
        tasks: [],
        conditions: []
      },
      {
        id: 'trans-express-2',
        fromStatusId: 'status-4',
        toStatusId: 'status-5',
        requiresApproval: true,
        approverRoles: ['admin'],
        approverUserIds: [],
        tasks: [],
        conditions: []
      }
    ],
    isDefault: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    layout: {
      statusPositions: {
        'status-1': { x: 100, y: 80 },
        'status-4': { x: 400, y: 80 },
        'status-5': { x: 700, y: 80 }
      }
    }
  }
];

// Mock Projects
export const createMockProjects = (): Project[] => [
  {
    id: 'project-1',
    title: 'Residential Solar - Smith House',
    description: '10kW rooftop solar installation for residential property',
    creator: 'user-2',
    createdAt: new Date('2024-01-20'),
    lastEditedAt: new Date('2024-01-25'),
    currentStatusId: 'status-2',
    workflowId: 'workflow-1',
    statusHistory: [
      {
        id: 'hist-1',
        toStatusId: 'status-1',
        userId: 'user-2',
        timestamp: new Date('2024-01-20'),
        comment: 'Project created',
        tasksCompleted: []
      },
      {
        id: 'hist-2',
        fromStatusId: 'status-1',
        toStatusId: 'status-2',
        userId: 'user-2',
        timestamp: new Date('2024-01-25'),
        comment: 'Planning completed, moved to design review',
        tasksCompleted: ['task-1'] // Site Survey was completed
      }
    ]
  },
  {
    id: 'project-2',
    title: 'Commercial Solar - Office Building',
    description: '50kW commercial solar installation with battery storage',
    creator: 'user-1',
    createdAt: new Date('2024-01-18'),
    lastEditedAt: new Date('2024-01-18'),
    currentStatusId: 'status-1',
    workflowId: 'workflow-1',
    statusHistory: [
      {
        id: 'hist-3',
        toStatusId: 'status-1',
        userId: 'user-1',
        timestamp: new Date('2024-01-18'),
        comment: 'Project created',
        tasksCompleted: []
      }
    ]
  },
  {
    id: 'project-3',
    title: 'Express Install - Johnson Residence',
    description: '5kW simple rooftop installation using express workflow',
    creator: 'user-3',
    createdAt: new Date('2024-01-22'),
    lastEditedAt: new Date('2024-01-28'),
    currentStatusId: 'status-4',
    workflowId: 'workflow-2',
    statusHistory: [
      {
        id: 'hist-4',
        toStatusId: 'status-1',
        userId: 'user-3',
        timestamp: new Date('2024-01-22'),
        comment: 'Project created',
        tasksCompleted: []
      },
      {
        id: 'hist-5',
        fromStatusId: 'status-1',
        toStatusId: 'status-4',
        userId: 'user-3',
        timestamp: new Date('2024-01-28'),
        comment: 'Express installation ready',
        tasksCompleted: []
      }
    ]
  },
  {
    id: 'project-4',
    title: 'Industrial Solar - Manufacturing Plant',
    description: '200kW industrial solar array with grid-tie system',
    creator: 'user-1',
    createdAt: new Date('2024-01-12'),
    lastEditedAt: new Date('2024-02-01'),
    currentStatusId: 'status-5',
    workflowId: 'workflow-1',
    statusHistory: [
      {
        id: 'hist-6',
        toStatusId: 'status-1',
        userId: 'user-1',
        timestamp: new Date('2024-01-12'),
        comment: 'Project created',
        tasksCompleted: []
      },
      {
        id: 'hist-7',
        fromStatusId: 'status-1',
        toStatusId: 'status-2',
        userId: 'user-1',
        timestamp: new Date('2024-01-15'),
        comment: 'Planning phase completed',
        tasksCompleted: []
      },
      {
        id: 'hist-8',
        fromStatusId: 'status-2',
        toStatusId: 'status-3',
        userId: 'user-4',
        timestamp: new Date('2024-01-20'),
        comment: 'Design approved, awaiting customer sign-off',
        tasksCompleted: []
      },
      {
        id: 'hist-9',
        fromStatusId: 'status-3',
        toStatusId: 'status-4',
        userId: 'user-2',
        timestamp: new Date('2024-01-25'),
        comment: 'Customer approval received',
        tasksCompleted: []
      },
      {
        id: 'hist-10',
        fromStatusId: 'status-4',
        toStatusId: 'status-5',
        userId: 'user-3',
        timestamp: new Date('2024-02-01'),
        comment: 'Installation completed successfully',
        tasksCompleted: []
      }
    ]
  },
  {
    id: 'project-5',
    title: 'Residential Solar - Davis Family',
    description: '8kW residential installation with battery backup',
    creator: 'user-4',
    createdAt: new Date('2024-01-25'),
    lastEditedAt: new Date('2024-01-30'),
    currentStatusId: 'status-3',
    workflowId: 'workflow-1',
    statusHistory: [
      {
        id: 'hist-11',
        toStatusId: 'status-1',
        userId: 'user-4',
        timestamp: new Date('2024-01-25'),
        comment: 'Project created',
        tasksCompleted: []
      },
      {
        id: 'hist-12',
        fromStatusId: 'status-1',
        toStatusId: 'status-2',
        userId: 'user-4',
        timestamp: new Date('2024-01-27'),
        comment: 'Initial planning complete',
        tasksCompleted: []
      },
      {
        id: 'hist-13',
        fromStatusId: 'status-2',
        toStatusId: 'status-3',
        userId: 'user-2',
        timestamp: new Date('2024-01-30'),
        comment: 'Design review passed, waiting for customer approval',
        tasksCompleted: []
      }
    ]
  },
  {
    id: 'project-6',
    title: 'Community Solar - Apartment Complex',
    description: '75kW shared solar system for multi-unit residential building',
    creator: 'user-5',
    createdAt: new Date('2024-01-30'),
    lastEditedAt: new Date('2024-01-30'),
    currentStatusId: 'status-1',
    workflowId: 'workflow-1',
    statusHistory: [
      {
        id: 'hist-14',
        toStatusId: 'status-1',
        userId: 'user-5',
        timestamp: new Date('2024-01-30'),
        comment: 'Project created',
        tasksCompleted: []
      }
    ]
  }
];

// Mock Designs - PV layout designs for projects
export const createMockDesigns = (projects: Project[]): Design[] => {
  const panelManufacturers = [
    'SunPower',
    'Tesla',
    'LG Solar',
    'Canadian Solar',
    'Jinko Solar',
    'REC Group',
    'Panasonic',
    'Q Cells'
  ];

  const panelModels = [
    'Maxeon 3 415W',
    'Solar Roof V3',
    'NeON H 375W',
    'HiKu CS3W-405MS',
    'Tiger Pro 540W',
    'Alpha Pure 405W',
    'HIT+ 330W',
    'Q.PEAK DUO L-G5.2 355W'
  ];

  const designs: Design[] = [];

  projects.forEach((project, projectIndex) => {
    // Create 2-4 designs per project
    const designCount = Math.floor(Math.random() * 3) + 2; // 2-4 designs

    for (let i = 0; i < designCount; i++) {
      const panelWattage = 350 + Math.floor(Math.random() * 200); // 350-550W panels
      const panelCount = Math.floor(Math.random() * 50) + 20; // 20-70 panels
      const dcCapacity = (panelCount * panelWattage) / 1000; // kW DC
      const dcAcRatio = 1.15 + Math.random() * 0.25; // 1.15-1.40
      const acCapacity = dcCapacity / dcAcRatio;
      const specificYield = 1200 + Math.random() * 400; // 1200-1600 kWh/kW/year
      const annualProduction = dcCapacity * specificYield;
      const costPerWatt = 2.5 + Math.random() * 1.0; // $2.50-$3.50/W
      const systemCost = dcCapacity * 1000 * costPerWatt;
      const roofArea = 1500 + Math.random() * 2000; // 1500-3500 sq ft
      const moduleArea = panelCount * 22; // ~22 sq ft per module
      const arrayTilt = Math.floor(Math.random() * 30) + 15; // 15-45 degrees
      const arrayAzimuth = 150 + Math.floor(Math.random() * 60); // 150-210 degrees
      const co2OffsetAnnual = annualProduction * 0.92; // ~0.92 lbs CO2/kWh

      const design: Design = {
        id: `design-${Date.now()}-${projectIndex}-${i}`,
        projectId: project.id,
        title: `Design Option ${String.fromCharCode(65 + i)}`, // A, B, C, D
        description: i === 0
          ? 'Standard layout design optimized for maximum production'
          : i === 1
          ? 'Alternative layout with improved aesthetics'
          : i === 2
          ? 'High-efficiency premium panel option'
          : 'Cost-optimized design with value panels',
        creator: project.creator,
        createdAt: new Date(project.createdAt.getTime() + (i * 24 * 60 * 60 * 1000)), // Stagger by days
        lastEditedAt: new Date(project.lastEditedAt.getTime() + (i * 24 * 60 * 60 * 1000)),
        systemSpecs: {
          // Panel specifications
          panelCount,
          panelWattage,
          panelManufacturer: panelManufacturers[Math.floor(Math.random() * panelManufacturers.length)],
          panelModel: panelModels[Math.floor(Math.random() * panelModels.length)],
          // System production data
          dcCapacity: Math.round(dcCapacity * 100) / 100,
          acCapacity: Math.round(acCapacity * 100) / 100,
          dcAcRatio: Math.round(dcAcRatio * 100) / 100,
          // Annual production estimates
          annualProduction: Math.round(annualProduction),
          specificYield: Math.round(specificYield),
          // System layout
          arrayTilt,
          arrayAzimuth,
          roofArea: Math.round(roofArea),
          moduleArea: Math.round(moduleArea),
          // Financial estimates
          systemCost: Math.round(systemCost),
          costPerWatt: Math.round(costPerWatt * 100) / 100,
          paybackPeriod: 6 + Math.random() * 4, // 6-10 years
          // Environmental impact
          co2OffsetAnnual: Math.round(co2OffsetAnnual)
        },
        // Design metadata
        designVersion: `v1.${i}`,
        isActive: i === 0, // First design is active by default
        approvalStatus: i === 0 ? 'approved' : i === 1 ? 'pending' : 'draft'
      };

      designs.push(design);
    }
  });

  return designs;
};