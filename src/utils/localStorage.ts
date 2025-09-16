// localStorage utilities for PV Workflow Manager

const STORAGE_KEYS = {
    STATUSES: 'pvworkflow_statuses',
    WORKFLOWS: 'pvworkflow_workflows',
    PROJECTS: 'pvworkflow_projects',
    USERS: 'pvworkflow_users',
    TRANSITIONS: 'pvworkflow_transitions',
    TASKS: 'pvworkflow_tasks' // New for Epic 7
  } as const;
  
  // Generic save function
  export const saveToStorage = <T>(key: string, data: T[]): void => {
    try {
      const serializedData = JSON.stringify(data, (_ , value) => {
        // Convert Date objects to ISO strings
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  };
  
  // Generic load function
  export const loadFromStorage = <T>(key: string): T[] => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return [];
      
      return JSON.parse(data, (_, value) => {
        // Convert ISO strings back to Date objects
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value);
        }
        return value;
      });
    } catch (error) {
      console.error(`Error loading from localStorage:`, error);
      return [];
    }
  };
  
  // Clear all application data
  export const clearAllData = (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  };
  
  // Export storage keys for use in other files
  export { STORAGE_KEYS };