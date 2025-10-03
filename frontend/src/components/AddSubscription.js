import React, { useState } from 'react';
import { subscriptionsAPI } from '../services/api';

function AddSubscription({ onSubscriptionAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    due_date: '',  // ← Changed from payment_date
    category: 'entertainment',
    recurring_schedule: 'monthly',  // ← Changed from billing_cycle
    notes: ''  // ← Changed from description
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      const token = localStorage.getItem('token');
      console.log('🔐 Current token:', token);

      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.price || !formData.due_date) {
        setError('Subscription name, price, and due date are required');
        setLoading(false);
        return;
      }

      // Convert price to number and prepare data for backend
      const subscriptionData = {
        name: formData.name,
        price: parseFloat(formData.price),
        due_date: formData.due_date,
        category: formData.category,
        recurring_schedule: formData.recurring_schedule,
        notes: formData.notes || null
      };

      console.log('📤 Adding subscription:', subscriptionData);
      
      const response = await subscriptionsAPI.create(subscriptionData);
      console.log('✅ Subscription added:', response);
      
      // Reset form
      setFormData({
        name: '',
        price: '',
        due_date: '',
        category: 'entertainment',
        recurring_schedule: 'monthly',
        notes: ''
      });
      
      setShowForm(false);
      
      // Notify parent component
      if (onSubscriptionAdded) {
        onSubscriptionAdded(response.data);
      }
      
    } catch (error) {
      console.error('❌ Error adding subscription:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.data?.detail) {
        setError(`Error: ${error.response.data.detail}`);
      } else {
        setError('Failed to add subscription. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="text-center mb-4">
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          + Add New Subscription
        </button>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <h3>Add New Subscription</h3>
      
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
            placeholder="Netflix, Spotify, Gym Membership..."
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
            placeholder="15.99"
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
            onClick={() => setShowForm(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Subscription'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddSubscription;