import React, { useState, useEffect } from 'react';
import { subscriptionsAPI } from '../services/api';

function EditSubscription({ subscription, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    due_date: '',
    category: 'entertainment',
    recurring_schedule: 'monthly',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update form when subscription changes
  useEffect(() => {
    if (subscription) {
      console.log('🔧 Setting form data from subscription:', subscription);
      setFormData({
        name: subscription.name || '',
        price: subscription.price || '',
        due_date: subscription.due_date || '',
        category: subscription.category || 'entertainment',
        recurring_schedule: subscription.recurring_schedule || 'monthly',
        notes: subscription.notes || ''
      });
    }
  }, [subscription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Input change - ${name}:`, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const subscriptionData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      console.log('🔧 Submitting update:', subscriptionData);
      const response = await subscriptionsAPI.update(subscription.id, subscriptionData);
      onUpdate(response.data);
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  // Show loading if no subscription data
  if (!subscription) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading subscription data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Edit Subscription</h2>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div style={{ fontSize: '12px', color: '#666', marginBottom: '1rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px' }}>
          <strong>Debug:</strong> name="{formData.name}" price="{formData.price}" date="{formData.due_date}"
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Subscription Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (GBP) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Due Date *</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="recurring_schedule">Billing Schedule</label>
            <select
              id="recurring_schedule"
              name="recurring_schedule"
              value={formData.recurring_schedule}
              onChange={handleChange}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="weekly">Weekly</option>
              <option value="quarterly">Quarterly</option>
              <option value="one-time">One Time</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="entertainment">Entertainment</option>
              <option value="productivity">Productivity</option>
              <option value="utilities">Utilities</option>
              <option value="health">Health & Fitness</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any notes about this subscription..."
            />
          </div>

          <div className="flex justify-between">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSubscription;