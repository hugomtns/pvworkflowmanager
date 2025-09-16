// Core Entity Interfaces for HubWorkflow System

// Status Definition
export interface Status {
    id: string;
    name: string;
    color: string;
    description: string;
    entityTypes: string[]; // ['project', 'campaign', 'design']
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Workflow Definition
  export interface Workflow {
    id: string;
    name: string;
    description: string;
    entityType: string;
    statuses: string[]; // status IDs in order
    transitions: Transition[];
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
    // Optional persisted layout for canvas-based editor
    layout?: {
      statusPositions: { [statusId: string]: { x: number; y: number } };
    };
  }
  
  // Transition Definition
  export interface Transition {
    id: string;
    fromStatusId: string;
    toStatusId: string;
    requiresApproval: boolean;
    approverRoles: string[]; // ['admin', 'user']
    approverUserIds: string[]; // specific users
    tasks: Task[];
    conditions: string[]; // future use
  }
  
  // Task Definition - Updated for Epic 7
  export interface Task {
    id: string;
    name: string;
    description: string; // This will serve as the "goal" field
    assignedUserId: string; // Required - specific user assignment
    deadline?: Date;
    isRequired: boolean;
    isCompleted: boolean; // New field
    completedAt?: Date; // New field
    completedBy?: string; // New field - user ID who marked it done
    transitionId: string; // New field - which transition this task belongs to
    createdAt: Date; // New field
    updatedAt: Date; // New field
  }
  
  // Project Entity
  export interface Project {
    id: string;
    title: string;
    description: string;
    creator: string;
    createdAt: Date;
    lastEditedAt: Date;
    currentStatusId: string;
    workflowId: string;
    statusHistory: StatusHistoryEntry[];
  }

  // Design Entity - PV layout designs within projects
  export interface Design {
    id: string;
    projectId: string; // Reference to parent project
    title: string;
    description: string;
    creator: string;
    createdAt: Date;
    lastEditedAt: Date;
    // PV System Specifications
    systemSpecs: {
      // Panel specifications
      panelCount: number;
      panelWattage: number; // Watts per panel
      panelManufacturer: string;
      panelModel: string;
      // System production data
      dcCapacity: number; // kW DC
      acCapacity: number; // kW AC
      dcAcRatio: number; // DC/AC ratio
      // Annual production estimates
      annualProduction: number; // kWh/year
      specificYield: number; // kWh/kW/year
      // System layout
      arrayTilt: number; // degrees
      arrayAzimuth: number; // degrees (180 = south)
      roofArea: number; // sq ft
      moduleArea: number; // sq ft
      // Financial estimates
      systemCost: number; // USD
      costPerWatt: number; // USD/W
      paybackPeriod?: number; // years
      // Environmental impact
      co2OffsetAnnual: number; // lbs CO2/year
    };
    // Design metadata
    designVersion: string; // e.g., "v1.0", "v2.1"
    isActive: boolean; // Only one active design per project
    approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';
    // File attachments (future use)
    attachments?: {
      id: string;
      filename: string;
      url: string;
      type: 'layout' | 'spec_sheet' | 'permit' | 'photo';
    }[];
  }
  
  // Status History
  export interface StatusHistoryEntry {
    id: string;
    fromStatusId?: string;
    toStatusId: string;
    userId: string;
    timestamp: Date;
    comment?: string;
    tasksCompleted: string[]; // task IDs
    approvedBy?: string;
  }
  
  // User
  export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
  }
  
  // UI-specific types
  export type UserRole = 'admin' | 'user';
  
  export interface AppContextType {
    currentUser: User;
    setCurrentUser: (user: User) => void;
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;

    // Task Management additions
    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Task) => void;
    updateTask: (task: Task) => void;
    deleteTask: (taskId: string) => void;

    workflows: Workflow[];
    setWorkflows: (workflows: Workflow[]) => void;
    transitions: Transition[];
    setTransitions: (transitions: Transition[]) => void;
    users: User[];
    setUsers: (users: User[]) => void;

    // Design Management additions
    designs: Design[];
    setDesigns: (designs: Design[]) => void;
    addDesign: (design: Design) => void;
    updateDesign: (design: Design) => void;
    deleteDesign: (designId: string) => void;

    isAdmin: boolean;
  }