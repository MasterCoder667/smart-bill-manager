import React, { useState, useEffect } from 'react';
import AddSubscription from '../components/AddSubscription';
import { subscriptionsAPI } from '../services/api';

function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    // Add new subscription to the list
    setSubscriptions(prev => [newSubscription, ...prev]);
  };

  const calculateTotalMonthly = () => {
    return subscriptions.reduce((total, sub) => {
      // Convert billing cycles to monthly equivalent
      let monthlyPrice = sub.price;
      if (sub.billing_cycle === 'yearly') {
        monthlyPrice = sub.price / 12;
      } else if (sub.billing_cycle === 'quarterly') {
        monthlyPrice = sub.price / 3;
      } else if (sub.billing_cycle === 'weekly') {
        monthlyPrice = sub.price * 4;
      }
      return total + monthlyPrice;
    }, 0);
  };

  return (
    <div className="container">
      {/* Summary Card */}
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
        </div>
      </div>

      {/* Add Subscription Form */}
      <AddSubscription onSubscriptionAdded={handleSubscriptionAdded} />

      {/* Subscriptions List */}
      <div className="card">
        <h2>Your Subscriptions</h2>
        
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

        {!loading && subscriptions.length === 0 && (
          <div className="text-center">
            <p>No subscriptions yet. Add your first subscription above!</p>
          </div>
        )}

        {!loading && subscriptions.length > 0 && (
          <div className="subscription-list">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="subscription-item">
                <div className="subscription-info">
                  <h3>{subscription.name}</h3>
                  <div className="subscription-meta">
                    <span>${subscription.price} • </span>
                    <span>{subscription.billing_cycle} • </span>
                    <span>{subscription.category}</span>
                    {subscription.payment_date && (
                      <span> • Next: {new Date(subscription.payment_date).toLocaleDateString()}</span>
                    )}
                  </div>
                  {subscription.description && (
                    <p>{subscription.description}</p>
                  )}
                </div>
                <div className="subscription-price">
                  ${subscription.price}
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