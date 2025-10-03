import React, { useState } from 'react';
import { subscriptionsAPI } from '../services/api';

function EditSubscription({ subscription, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    name: subscription.name,
    price: subscription.price,
    due_date: subscription.due_date,
    category: subscription.category,
    recurring_schedule: subscription.recurring_schedule,
    notes: subscription.notes || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

      const response = await subscriptionsAPI.update(subscription.id, subscriptionData);
      onUpdate(response.data);
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Edit Subscription</h2>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

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
            <label htmlFor="price">Price *</label>
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