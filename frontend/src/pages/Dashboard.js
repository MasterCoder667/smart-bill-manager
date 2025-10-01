import React from 'react';

function Dashboard() {
  return (
    <div className="container">
      <div className="card">
        <h2>Dashboard</h2>
        <p>Welcome to your Smart Bill Manager dashboard!</p>
        <p>You're logged in as user ID: {localStorage.getItem('user_id')}</p>
      </div>
    </div>
  );
}

export default Dashboard;