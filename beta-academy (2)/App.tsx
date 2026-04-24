
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LoginPortal } from './components/LoginPortal';
import { Dashboard } from './components/Dashboard';
import { View, User, UserRole } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (role: UserRole, name: string, email: string) => {
    setUser({ role, name, email });
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
      case 'login':
        return (
          <div className="min-h-screen flex items-center justify-center bg-[#0a192f]">
            <LoginPortal onLogin={handleLogin} onBack={() => setCurrentView('login')} />
          </div>
        );
      case 'dashboard':
        return user ? (
          <div className="min-h-screen">
             <Dashboard user={user} onLogout={handleLogout} />
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-[#0a192f]">
            <LoginPortal onLogin={handleLogin} onBack={() => setCurrentView('login')} />
          </div>
        );
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-[#0a192f]">
            <LoginPortal onLogin={handleLogin} onBack={() => setCurrentView('login')} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a192f]">
      {currentView !== 'dashboard' && (
        <Navbar 
          currentView={currentView} 
          onNavigate={setCurrentView} 
          user={user} 
          onLogout={handleLogout} 
        />
      )}
      <main className="flex-grow">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
