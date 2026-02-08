
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import NotificationBell from './NotificationBell';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminRole = async () => {
      const token = localStorage.getItem('luxe_token') || localStorage.getItem('access_token');
      if (!token) {
        // Save intended destination for redirect after login
        // Remove leading hash if present (HashRouter adds hash)
        let currentPath = window.location.hash.replace('#', '') || '/admin';
        // Remove any additional leading slashes/ hashes
        currentPath = currentPath.replace(/^\/+/, '/').replace(/^#+/, '');
        if (currentPath !== '/admin' && currentPath !== '/login') {
          sessionStorage.setItem('admin_intended_path', currentPath);
        }
        navigate('/login?access=systems');
        return;
      }

      try {
        const profile = await ApiService.getMe();
        if (profile.is_staff) {
          setIsAdmin(true);
          // Check for intended path after admin verification
          const intendedPath = sessionStorage.getItem('admin_intended_path');
          if (intendedPath) {
            sessionStorage.removeItem('admin_intended_path');
            // Remove any leading hashes from intended path
            const cleanPath = intendedPath.replace(/^#+/, '');
            navigate(cleanPath, { replace: true });
          }
        } else {
          // User is logged in but not admin
          navigate('/account');
        }
      } catch (error) {
        // Token is invalid
        localStorage.clear();
        navigate('/login?access=systems');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminRole();

    // Listen for storage changes (logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'luxe_token' || e.key === 'access_token' || e.key === 'luxe_is_auth' || e.key === 'luxe_user_role') {
        const token = localStorage.getItem('luxe_token') || localStorage.getItem('access_token');
        if (!token) {
          navigate('/login?access=systems');
        } else {
          verifyAdminRole();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const handleExitToCustomer = () => {
    // Exit admin panel but keep logged in - go to fleet page
    navigate('/fleet');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Fleet Management', path: '/admin/fleet', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Bookings', path: '/admin/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Customers', path: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Finance', path: '/admin/finance', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 flex admin-scope">
      {/* Sidebar */}
      <aside className={`bg-[#2c3e50] text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full z-50`}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className={`font-bold tracking-widest gold-text serif ${!isSidebarOpen && 'hidden'}`}>LUXEDRIVE</Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-grow mt-6">
          {menuItems.map(item => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex items-center p-4 transition-all ${
                location.pathname === item.path ? 'bg-[#3498db] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-6 h-6 mr-4 min-w-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <button 
            onClick={handleExitToCustomer}
            className="flex items-center text-xs text-gray-400 hover:text-white uppercase tracking-widest font-bold w-full text-left"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            {isSidebarOpen && "Exit to Customer View"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-gray-800">Administrator Console</h1>
          </div>
          <div className="flex items-center space-x-6">
            <NotificationBell />
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-bold">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
      <style>{`
        .admin-scope input, .admin-scope select, .admin-scope textarea {
          color: #1f2937 !important;
          background-color: white !important;
        }
        .admin-scope ::placeholder {
          color: #9ca3af !important;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
