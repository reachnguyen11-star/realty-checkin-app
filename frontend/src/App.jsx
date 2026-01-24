import React, { useState, useEffect } from 'react';
import CheckInForm from './components/CheckInForm';
import History from './components/History';
import Reports from './components/Reports';
import Admin from './components/Admin';
import EmployeeLogin from './components/EmployeeLogin';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('checkin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const userAuth = localStorage.getItem('userAuth');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    const loginTime = localStorage.getItem('loginTime');

    if (userAuth === 'true' && userName && loginTime) {
      const login = new Date(loginTime);
      const now = new Date();
      const daysDiff = (now - login) / (1000 * 60 * 60 * 24);

      // Session expires after 7 days
      if (daysDiff < 7) {
        setIsAuthenticated(true);
        setCurrentUser({
          name: userName,
          role: userRole || 'employee'
        });
      } else {
        handleLogout();
      }
    }
  };

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('userAuth');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginTime');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <EmployeeLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-secondary to-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="Nam An Realty Logo"
                className="h-12 w-12 object-contain flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <h1 className="text-lg sm:text-2xl font-bold leading-tight">
                <span className="text-gold whitespace-nowrap">Nam An Realty</span>
                <span className="text-gray-300 text-sm sm:text-lg ml-1 sm:ml-2 whitespace-nowrap">- Check-in System</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-300">Xin chào,</div>
                <div className="font-bold text-gold">{currentUser?.name}</div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm px-3 py-2"
              >
                🚪 Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 sm:gap-4">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                activeTab === 'checkin'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📝 Check-in
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📜 Lịch sử
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 Thống kê
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                  activeTab === 'admin'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                🔧 Admin
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'checkin' && (
          <CheckInForm
            currentUser={currentUser}
            onSuccess={() => {
              // Auto switch to history after successful check-in
              setTimeout(() => setActiveTab('history'), 1500);
            }}
          />
        )}
        {activeTab === 'history' && <History />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'admin' && <Admin />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>&copy; 2026 Nam An Realty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
