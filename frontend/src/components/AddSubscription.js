import React, { useState } from 'react';
import { subscriptionsAPI } from '../services/api';

function AddSubscription({ onSubscriptionAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    billing_cycle: 'monthly',
    category: 'entertainment',
    payment_date: '',
    description: ''
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
      // Convert price to number
      const subscriptionData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      console.log('Adding subscription:', subscriptionData);
      const response = await subscriptionsAPI.create(subscriptionData);
      console.log('Subscription added:', response);
      
      // Reset form
      setFormData({
        name: '',
        price: '',
        billing_cycle: 'monthly',
        category: 'entertainment',
        payment_date: '',
        description: ''
      });
      
      setShowForm(false);
      
      // Notify parent component
      if (onSubscriptionAdded) {
        onSubscriptionAdded(response.data);
      }
      
    } catch (error) {
      console.error('Error adding subscription:', error);
      setError(error.response?.data?.detail || 'Failed to add subscription. Please try again.');
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
          <label htmlFor="price">Monthly Price (£) *</label>
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
          <label htmlFor="billing_cycle">Billing Cycle</label>
          <select
            id="billing_cycle"
            name="billing_cycle"
            value={formData.billing_cycle}
            onChange={handleChange}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="weekly">Weekly</option>
            <option value="quarterly">Quarterly</option>
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
          <label htmlFor="payment_date">Next Payment Date</label>
          <input
            type="date"
            id="payment_date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
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