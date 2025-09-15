import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProjectList from './pages/ProjectList';
import StatusManagement from './pages/StatusManagement';
import WorkflowManagement from './pages/WorkflowManagement';
import { initializeData } from './data/dataAccess';
import type { UserRole } from './types';

function App() {
  const [userRole, setUserRole] = useState<UserRole>('user');

  // Initialize data on app start
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <Router>
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
    </Router>
  );
}

export default App;