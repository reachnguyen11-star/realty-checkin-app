import React, { useState } from 'react';
import CheckInForm from './components/CheckInForm';
import History from './components/History';
import Reports from './components/Reports';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('checkin');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-secondary to-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Nam An Realty Logo"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h1 className="text-2xl font-bold">
              <span className="text-gold">Nam An Realty</span>
              <span className="text-gray-300 text-lg ml-2">- Check-in System</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'checkin'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📝 Check-in
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📜 Lịch sử
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 Thống kê
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'checkin' && (
          <CheckInForm
            onSuccess={() => {
              // Auto switch to history after successful check-in
              setTimeout(() => setActiveTab('history'), 1500);
            }}
          />
        )}
        {activeTab === 'history' && <History />}
        {activeTab === 'reports' && <Reports />}
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
