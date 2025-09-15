import React from 'react';
import { Link, Outlet } from 'react-router-dom';

interface LayoutProps {
  userRole: 'admin' | 'user';
  onRoleChange: (role: 'admin' | 'user') => void;
}

const Layout: React.FC<LayoutProps> = ({ userRole, onRoleChange }) => {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1976d2',
        color: 'white',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          PV Workflow Manager
        </h1>
        
        {/* Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Role:</span>
          <select 
            value={userRole} 
            onChange={(e) => onRoleChange(e.target.value as 'admin' | 'user')}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: 'none'
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        backgroundColor: '#f5f5f5',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: '#1976d2',
              fontWeight: 'bold'
            }}
          >
            Projects
          </Link>
          
          {userRole === 'admin' && (
            <>
              <Link 
                to="/admin/statuses" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#1976d2',
                  fontWeight: 'bold'
                }}
              >
                Manage Statuses
              </Link>
              <Link 
                to="/admin/workflows" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#1976d2',
                  fontWeight: 'bold'
                }}
              >
                Manage Workflows
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ 
        padding: '2rem',
        flex: 1,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;