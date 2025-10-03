import React, { useState, useEffect } from 'react';
import AddSubscription from '../components/AddSubscription';
import EditSubscription from '../components/EditSubscription';
import { subscriptionsAPI } from '../services/api';

function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch subscriptions when component loads
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsAPI.getAll();
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAdded = (newSubscription) => {
    setSubscriptions(prev => [newSubscription, ...prev]);
  };

  const handleEditSubscription = (subscription) => {
    setEditingSubscription(subscription);
  };

  const handleUpdateSubscription = (updatedSubscription) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === updatedSubscription.id ? updatedSubscription : sub
      )
    );
    setEditingSubscription(null);
  };

  const handleDeleteSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      await subscriptionsAPI.delete(id);
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setError('Failed to delete subscription');
    }
  };

  const calculateTotalMonthly = () => {
    return subscriptions.reduce((total, sub) => {
      let monthlyPrice = sub.price;
      if (sub.recurring_schedule === 'yearly') {
        monthlyPrice = sub.price / 12;
      } else if (sub.recurring_schedule === 'quarterly') {
        monthlyPrice = sub.price / 3;
      } else if (sub.recurring_schedule === 'weekly') {
        monthlyPrice = sub.price * 4;
      }
      return total + monthlyPrice;
    }, 0);
  };

  const getUpcomingBills = () => {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);
    
    return subscriptions.filter(sub => {
      const dueDate = new Date(sub.due_date);
      return dueDate >= today && dueDate <= next30Days;
    }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  };

  const getCategoryBreakdown = () => {
    return subscriptions.reduce((acc, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + sub.price;
      return acc;
    }, {});
  };

  const filteredSubscriptions = selectedCategory === 'all' 
    ? subscriptions 
    : subscriptions.filter(sub => sub.category === selectedCategory);

  const categories = ['all', ...new Set(subscriptions.map(sub => sub.category))];

  const upcomingBills = getUpcomingBills();
  const categoryBreakdown = getCategoryBreakdown();

  if (editingSubscription) {
    return (
      <EditSubscription
        subscription={editingSubscription}
        onUpdate={handleUpdateSubscription}
        onCancel={() => setEditingSubscription(null)}
      />
    );
  }

  return (
    <div className="container">
      {/* Summary Cards */}
      <div className="card mb-4">
        <h2>Subscription Summary</h2>
        <div className="flex justify-between">
          <div>
            <h3>Total Subscriptions</h3>
            <p className="subscription-count">{subscriptions.length}</p>
          </div>
          <div>
            <h3>Monthly Cost</h3>
            <p className="subscription-price">${calculateTotalMonthly().toFixed(2)}</p>
          </div>
          <div>
            <h3>Upcoming Bills</h3>
            <p className="subscription-count">{upcomingBills.length}</p>
          </div>
        </div>
      </div>

      {/* Upcoming Bills Section */}
      {upcomingBills.length > 0 && (
        <div className="card mb-4">
          <h2>📅 Upcoming Bills (Next 30 Days)</h2>
          <div className="upcoming-bills">
            {upcomingBills.map((bill) => (
              <div key={bill.id} className="upcoming-bill-item">
                <div className="bill-info">
                  <h4>{bill.name}</h4>
                  <p>Due: {new Date(bill.due_date).toLocaleDateString()}</p>
                </div>
                <div className="bill-amount">
                  ${bill.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="card mb-4">
          <h2>📊 Spending by Category</h2>
          <div className="category-breakdown">
            {Object.entries(categoryBreakdown).map(([category, amount]) => (
              <div key={category} className="category-item">
                <span className="category-name">{category}</span>
                <span className="category-amount">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Subscription Form */}
      <AddSubscription onSubscriptionAdded={handleSubscriptionAdded} />

      {/* Subscriptions List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2>Your Subscriptions</h2>
          
          {/* Category Filter */}
          {categories.length > 1 && (
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          )}
        </div>
        
        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            Loading subscriptions...
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {!loading && filteredSubscriptions.length === 0 && (
          <div className="text-center">
            <p>No subscriptions found. {selectedCategory !== 'all' ? 'Try changing the filter.' : 'Add your first subscription above!'}</p>
          </div>
        )}

        {!loading && filteredSubscriptions.length > 0 && (
          <div className="subscription-list">
            {filteredSubscriptions.map((subscription) => (
              <div key={subscription.id} className="subscription-item">
                <div className="subscription-info">
                  <h3>{subscription.name}</h3>
                  <div className="subscription-meta">
                    <span>${subscription.price} {subscription.currency} • </span>
                    <span>{subscription.recurring_schedule} • </span>
                    <span className={`category-tag category-${subscription.category}`}>
                      {subscription.category}
                    </span>
                    {subscription.due_date && (
                      <span> • Due: {new Date(subscription.due_date).toLocaleDateString()}</span>
                    )}
                  </div>
                  {subscription.notes && (
                    <p className="subscription-notes">{subscription.notes}</p>
                  )}
                </div>
                <div className="subscription-actions">
                  <div className="subscription-price">
                    ${subscription.price}
                  </div>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEditSubscription(subscription)}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteSubscription(subscription.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;