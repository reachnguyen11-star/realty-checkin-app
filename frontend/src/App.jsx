import { useState, useEffect } from 'react';
import { ClipboardList, History as HistoryIcon, BarChart3, Settings, LogOut } from 'lucide-react';
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
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-2">
            {/* Top row: Logo and Title */}
            <div className="flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="Nam An Realty Logo"
                className="h-10 w-10 object-contain flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <h1 className="text-base sm:text-2xl font-bold leading-tight flex-1">
                <span className="text-gold">Nam An Realty</span>
                <span className="text-gray-300 text-xs sm:text-lg ml-1 sm:ml-2 block sm:inline">Check-in System</span>
              </h1>
            </div>
            {/* Bottom row: User info and Logout */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-300">Xin chào,</span>
                <span className="text-sm sm:text-base font-bold text-gold">{currentUser?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-xs sm:text-sm px-3 py-1.5 flex items-center gap-1.5"
                aria-label="Đăng xuất"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Đăng xuất</span>
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
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'checkin'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
              aria-label="Trang Check-in"
            >
              <ClipboardList size={20} />
              <span>Check-in</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
              aria-label="Trang lịch sử"
            >
              <HistoryIcon size={20} />
              <span>Lịch sử</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'reports'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
              aria-label="Trang thống kê"
            >
              <BarChart3 size={20} />
              <span>Thống kê</span>
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'admin'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
                aria-label="Trang quản trị"
              >
                <Settings size={20} />
                <span>Admin</span>
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
