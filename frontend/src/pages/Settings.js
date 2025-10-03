import React, { useState, useEffect } from 'react';

function Settings() {
  const [settings, setSettings] = useState({
    currency: 'USD',
    budgetAlerts: true,
    emailReminders: false,
    theme: 'light',
    monthlyBudget: 100
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleExportAllData = () => {
    const userData = {
      settings,
      userId: localStorage.getItem('user_id'),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-bills-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all local data? This will reset your settings and preferences.')) {
      localStorage.removeItem('appSettings');
      setSettings({
        currency: 'USD',
        budgetAlerts: true,
        emailReminders: false,
        theme: 'light',
        monthlyBudget: 100
      });
      alert('Settings have been reset to defaults.');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>⚙️ Settings</h2>
        
        {/* Preferences Section */}
        <div className="settings-group">
          <h3>📋 Preferences</h3>
          
          <div className="setting-item">
            <label htmlFor="currency">Default Currency</label>
            <select 
              id="currency"
              value={settings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
            >
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <div className="setting-item">
            <label htmlFor="theme">Theme</label>
            <select 
              id="theme"
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          <div className="setting-item">
            <label htmlFor="monthlyBudget">Default Monthly Budget</label>
            <input
              type="number"
              id="monthlyBudget"
              value={settings.monthlyBudget}
              onChange={(e) => handleSettingChange('monthlyBudget', parseFloat(e.target.value) || 0)}
              min="0"
              step="10"
            />
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-group">
          <h3>🔔 Notifications</h3>
          
          <div className="setting-item checkbox">
            <label>
              <input 
                type="checkbox"
                checked={settings.budgetAlerts}
                onChange={(e) => handleSettingChange('budgetAlerts', e.target.checked)}
              />
              Budget alerts (warn when approaching budget limit)
            </label>
          </div>
          
          <div className="setting-item checkbox">
            <label>
              <input 
                type="checkbox"
                checked={settings.emailReminders}
                onChange={(e) => handleSettingChange('emailReminders', e.target.checked)}
              />
              Email reminders for due bills
            </label>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="settings-group">
          <h3>💾 Data Management</h3>
          
          <div className="setting-item">
            <p>Export your settings and preferences for backup.</p>
            <button onClick={handleExportAllData} className="btn btn-secondary">
              📤 Export Settings Backup
            </button>
          </div>

          <div className="setting-item">
            <p>Reset all settings to default values.</p>
            <button onClick={handleClearData} className="btn btn-warning">
              🗑️ Reset to Defaults
            </button>
          </div>
        </div>

        {/* Account Section */}
        <div className="settings-group">
          <h3>👤 Account</h3>
          
          <div className="setting-item">
            <p><strong>User ID:</strong> {localStorage.getItem('user_id') || 'Not available'}</p>
            <p><strong>Logged in since:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* App Info Section */}
        <div className="settings-group">
          <h3>ℹ️ About</h3>
          
          <div className="setting-item">
            <p><strong>Smart Bill Manager v1.0</strong></p>
            <p>Track and manage all your subscriptions in one place.</p>
            <p>Built with React & FastAPI</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;