
import React, { useState, useMemo } from 'react';
import type { AppContextType, User, Task, Workflow, Transition } from '../types';
import { createMockUsers, createMockTasks, createMockWorkflows } from '../data/mockData';

export const AppContext = React.createContext<AppContextType>({} as AppContextType);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User state
  const [currentUser, setCurrentUser] = useState<User>(createMockUsers()[0]);
  const [userRole, setUserRole] = useState<'admin' | 'user'>(createMockUsers()[0].role);

  // Data state
  const [users, setUsers] = useState<User[]>(createMockUsers());
  const [tasks, setTasks] = useState<Task[]>(createMockTasks());
  const [workflows, setWorkflows] = useState<Workflow[]>(createMockWorkflows());
  // Flatten all transitions from all workflows
  const transitions = useMemo(() => workflows.flatMap(wf => wf.transitions), [workflows]);
  const setTransitions = (_: Transition[]) => {};

  // CRUD for tasks
  const addTask = (task: Task) => setTasks(prev => [...prev, task]);
  const updateTask = (task: Task) => setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  const deleteTask = (taskId: string) => setTasks(prev => prev.filter(t => t.id !== taskId));

  const isAdmin = currentUser.role === 'admin';

  // Keep currentUser in sync when userRole changes (pick the first user with that role)
  React.useEffect(() => {
    const match = users.find(u => u.role === userRole);
    if (match) setCurrentUser(match);
  }, [userRole, users]);

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    userRole,
    setUserRole,
    users,
    setUsers,
    tasks,
    setTasks,
    workflows,
    setWorkflows,
    transitions,
    setTransitions,
    addTask,
    updateTask,
    deleteTask,
    isAdmin,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


