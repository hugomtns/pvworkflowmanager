import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { reseedData } from '../data/dataAccess';
import { AppContext } from '../context/AppContext';

const Layout: React.FC = () => {
  const { userRole, setUserRole } = useContext(AppContext);
  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">
          PV Workflow Manager
        </h1>

        {/* Role Switcher */}
        <div className="app-header-controls">
          <span>Role:</span>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as 'admin' | 'user')}
            className="app-header-select"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={() => { reseedData(); window.location.reload(); }}
            className="btn btn-header-action"
          >
            Reset Data
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        <div className="app-nav-links">
          <Link to="/" className="app-nav-link">
            Projects
          </Link>

          {userRole === 'admin' && (
            <>
              <Link to="/admin/statuses" className="app-nav-link">
                Manage Statuses
              </Link>
              <Link to="/admin/workflows" className="app-nav-link">
                Manage Workflows
              </Link>
              <Link to="/admin/tasks" className="app-nav-link">
                Task Management
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;