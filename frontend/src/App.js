import React, { useState, useEffect } from 'react';
import './styles/App.css';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setIsAuthenticated(false);
    setCurrentView('login');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>Smart Bill Manager</h1>
          <p>Track and manage all your subscriptions in one place</p>
        </div>
      </header>

      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">Smart Bills</div>
          <div className="nav-links">
            <span>Welcome! User #{localStorage.getItem('user_id')}</span>
            <button 
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ marginLeft: '1rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="container">
        <div className="card">
          <h2>Your Subscriptions</h2>
          <p>We'll display your subscriptions here soon!</p>
          <p>You're logged in as user ID: {localStorage.getItem('user_id')}</p>
        </div>
      </div>
    </div>
  );
}

export default App;