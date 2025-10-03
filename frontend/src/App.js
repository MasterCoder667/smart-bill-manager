import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
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
          <Link to="/dashboard" className="nav-brand">
            💰 Smart Bills
          </Link>
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">
              📊 Dashboard
            </Link>
            <Link to="/settings" className="nav-link">
              ⚙️ Settings
            </Link>
            <span className="user-welcome">
              👤 User #{localStorage.getItem('user_id')}
            </span>
            <button 
              onClick={handleLogout}
              className="btn btn-outline"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Smart Bill Manager. Built with React & FastAPI.</p>
        </div>
      </footer>
    </div>
  );

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-spinner"></div>
        <p>Loading Smart Bill Manager...</p>
      </div>
    );
  }

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
                <Dashboard />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/settings" 
          element={
            isAuthenticated ? (
              <AppLayout>
                <Settings />
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

        {/* 404 page */}
        <Route 
          path="*" 
          element={
            <div className="container">
              <div className="card text-center">
                <h2>404 - Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <Link to="/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;