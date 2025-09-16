/**
 * User helper utilities for PV Workflow Manager
 * Consolidated user lookup and management functions
 */

import type { User } from '../types';

/**
 * User lookup utilities
 */

/**
 * Find a user by ID from a list of users
 */
export const getUserById = (users: User[], userId: string): User | undefined => {
  return users.find(user => user.id === userId);
};

/**
 * Get a user's name by ID, with fallback options
 */
export const getUserName = (
  users: User[],
  userId: string,
  fallback: string = userId
): string => {
  const user = getUserById(users, userId);
  return user?.name || fallback;
};

/**
 * Get a user's email by ID, with fallback options
 */
export const getUserEmail = (
  users: User[],
  userId: string,
  fallback: string = ''
): string => {
  const user = getUserById(users, userId);
  return user?.email || fallback;
};

/**
 * Create a memoized user lookup map for efficient name resolution
 * Useful when doing many user lookups in a single component
 */
export const createUserNameMap = (users: User[]): Record<string, string> => {
  const map: Record<string, string> = {};
  users.forEach(user => {
    map[user.id] = user.name;
  });
  return map;
};

/**
 * Create a memoized user lookup map for efficient user object resolution
 */
export const createUserMap = (users: User[]): Record<string, User> => {
  const map: Record<string, User> = {};
  users.forEach(user => {
    map[user.id] = user;
  });
  return map;
};

/**
 * User filtering and search utilities
 */

/**
 * Filter users by role
 */
export const getUsersByRole = (users: User[], role: 'admin' | 'user'): User[] => {
  return users.filter(user => user.role === role);
};

/**
 * Get all admin users
 */
export const getAdminUsers = (users: User[]): User[] => {
  return getUsersByRole(users, 'admin');
};

/**
 * Get all regular users (non-admin)
 */
export const getRegularUsers = (users: User[]): User[] => {
  return getUsersByRole(users, 'user');
};

/**
 * Search users by name or email
 */
export const searchUsers = (
  users: User[],
  searchTerm: string,
  caseSensitive: boolean = false
): User[] => {
  if (!searchTerm.trim()) return users;

  const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

  return users.filter(user => {
    const name = caseSensitive ? user.name : user.name.toLowerCase();
    const email = caseSensitive ? user.email : user.email.toLowerCase();

    return name.includes(term) || email.includes(term);
  });
};

/**
 * User validation utilities
 */

/**
 * Check if a user ID exists in the user list
 */
export const userExists = (users: User[], userId: string): boolean => {
  return users.some(user => user.id === userId);
};

/**
 * Check if a user has admin role
 */
export const isAdmin = (users: User[], userId: string): boolean => {
  const user = getUserById(users, userId);
  return user?.role === 'admin';
};

/**
 * Check if a user has regular user role
 */
export const isRegularUser = (users: User[], userId: string): boolean => {
  const user = getUserById(users, userId);
  return user?.role === 'user';
};

/**
 * User assignment utilities for tasks and workflows
 */

/**
 * Get users who can be assigned to a task (excludes any specific filtering logic)
 */
export const getAssignableUsers = (users: User[]): User[] => {
  return users; // Currently all users can be assigned, but this can be extended
};

/**
 * Get users who can approve transitions (admin users)
 */
export const getApprovalUsers = (users: User[]): User[] => {
  return getAdminUsers(users);
};

/**
 * Check if multiple user IDs exist in the user list
 */
export const validateUserIds = (users: User[], userIds: string[]): {
  valid: string[];
  invalid: string[];
} => {
  const valid: string[] = [];
  const invalid: string[] = [];

  userIds.forEach(userId => {
    if (userExists(users, userId)) {
      valid.push(userId);
    } else {
      invalid.push(userId);
    }
  });

  return { valid, invalid };
};

/**
 * User display utilities
 */

/**
 * Format user display name (e.g., "John Doe (Admin)")
 */
export const formatUserDisplay = (
  users: User[],
  userId: string,
  includeRole: boolean = false,
  fallback: string = 'Unknown User'
): string => {
  const user = getUserById(users, userId);

  if (!user) return fallback;

  if (includeRole) {
    return `${user.name} (${user.role === 'admin' ? 'Admin' : 'User'})`;
  }

  return user.name;
};

/**
 * Format user initials (e.g., "John Doe" -> "JD")
 */
export const getUserInitials = (
  users: User[],
  userId: string,
  fallback: string = '??'
): string => {
  const user = getUserById(users, userId);

  if (!user) return fallback;

  const nameParts = user.name.trim().split(' ');

  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Sort users by name, role, or other criteria
 */
export const sortUsers = (
  users: User[],
  sortBy: 'name' | 'email' | 'role' = 'name',
  ascending: boolean = true
): User[] => {
  const sorted = [...users].sort((a, b) => {
    let aValue: string;
    let bValue: string;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'email':
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case 'role':
        // Admin first, then user
        aValue = a.role === 'admin' ? '0' : '1';
        bValue = b.role === 'admin' ? '0' : '1';
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) return ascending ? -1 : 1;
    if (aValue > bValue) return ascending ? 1 : -1;
    return 0;
  });

  return sorted;
};

/**
 * Group users by role
 */
export const groupUsersByRole = (users: User[]): {
  admin: User[];
  user: User[];
} => {
  return {
    admin: getAdminUsers(users),
    user: getRegularUsers(users)
  };
};