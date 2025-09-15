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
  
  // Task Definition
  export interface Task {
    id: string;
    name: string;
    description: string;
    assignedToRole?: string;
    assignedToUserId?: string;
    deadline?: Date;
    isRequired: boolean;
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
  }