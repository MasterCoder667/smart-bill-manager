import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setIsAuthenticated(false);
  };

  // Main App Layout for authenticated users
  const AppLayout = ({ children }) => (
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
      
      {children}
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/signup" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignUp />
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <AppLayout>
                <div className="container">
                  <div className="card">
                    <h2>Your Subscriptions</h2>
                    <p>We'll display your subscriptions here soon!</p>
                    <p>You're logged in as user ID: {localStorage.getItem('user_id')}</p>
                  </div>
                </div>
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Default route */}
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;