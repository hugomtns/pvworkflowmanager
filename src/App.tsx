import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AppContext } from './context/AppContext';
import { userOperations } from './data/dataAccess';
import ProjectList from './pages/ProjectList';
import StatusManagement from './pages/StatusManagement';
import WorkflowManagement from './pages/WorkflowManagement';
import { initializeData } from './data/dataAccess';
import type { UserRole } from './types';

function App() {
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [currentUser, setCurrentUser] = useState(userOperations.getAll()[0]);

  // Initialize data on app start
  useEffect(() => {
    initializeData();
    const first = userOperations.getAll()[0];
    if (first) setCurrentUser(first);
  }, []);

  useEffect(() => {
    const users = userOperations.getAll();
    const byRole = users.find(u => u.role === userRole);
    if (byRole) setCurrentUser(byRole);
  }, [userRole]);

  return (
    <Router>
      <AppContext.Provider value={{ currentUser, setCurrentUser, userRole, setUserRole }}>
      <Routes>
        <Route 
          path="/" 
          element={
            <Layout 
              userRole={userRole} 
              onRoleChange={setUserRole} 
            />
          }
        >
          <Route index element={<ProjectList />} />
          <Route path="admin/statuses" element={<StatusManagement />} />
          <Route path="admin/workflows" element={<WorkflowManagement />} />
        </Route>
      </Routes>
      </AppContext.Provider>
    </Router>
  );
}

export default App;