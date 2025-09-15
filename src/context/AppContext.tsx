import React from 'react';
import type { AppContextType, User } from '../types';

export const AppContext = React.createContext<AppContextType>({
  currentUser: { id: '', name: '', email: '', role: 'user' },
  setCurrentUser: (_user: User) => {},
  userRole: 'user',
  setUserRole: (_role: 'admin' | 'user') => {}
});


