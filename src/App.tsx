import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AppContextProvider } from './context/AppContext';
import ProjectList from './pages/ProjectList';
import StatusManagement from './pages/StatusManagement';
import WorkflowManagement from './pages/WorkflowManagement';
import TaskManagement from './pages/TaskManagement';
import { initializeData } from './data/dataAccess';

function App() {
  // Initialize data on app start
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <Router>
      <AppContextProvider>
        <Routes>
          <Route 
            path="/" 
            element={<Layout />}
          >
            <Route index element={<ProjectList />} />
            <Route path="admin/statuses" element={<StatusManagement />} />
            <Route path="admin/workflows" element={<WorkflowManagement />} />
            <Route path="admin/tasks" element={<TaskManagement />} />
          </Route>
        </Routes>
      </AppContextProvider>
    </Router>
  );
}

export default App;