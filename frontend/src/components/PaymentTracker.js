import React, { useState } from 'react';

function PaymentTracker({ subscriptions, onPaymentUpdate }) {
  const [paidSubscriptions, setPaidSubscriptions] = useState({});

  const markAsPaid = (subscriptionId) => {
    const updated = { ...paidSubscriptions, [subscriptionId]: true };
    setPaidSubscriptions(updated);
    onPaymentUpdate?.(updated);
  };

  const markAsUnpaid = (subscriptionId) => {
    const updated = { ...paidSubscriptions };
    delete updated[subscriptionId];
    setPaidSubscriptions(updated);
    onPaymentUpdate?.(updated);
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

  const upcomingBills = getUpcomingBills();
  const totalDue = upcomingBills.reduce((sum, bill) => sum + bill.price, 0);
  const paidAmount = upcomingBills.reduce((sum, bill) => 
    paidSubscriptions[bill.id] ? sum + bill.price : sum, 0
  );

  return (
    <div className="card">
      <h3>💳 Payment Tracking</h3>
      
      <div className="payment-summary">
        <div className="payment-stat">
          <span>Total Due: £{totalDue.toFixed(2)}</span>
          <span>Paid: £{paidAmount.toFixed(2)}</span>
          <span>Remaining: £{(totalDue - paidAmount).toFixed(2)}</span>
        </div>
      </div>

      <div className="payment-list">
        {upcomingBills.map(bill => (
          <div key={bill.id} className={`payment-item ${paidSubscriptions[bill.id] ? 'paid' : 'unpaid'}`}>
            <div className="payment-info">
              <h4>{bill.name}</h4>
              <p>Due: {new Date(bill.due_date).toLocaleDateString()} • ${bill.price}</p>
            </div>
            <div className="payment-actions">
              {paidSubscriptions[bill.id] ? (
                <button 
                  onClick={() => markAsUnpaid(bill.id)}
                  className="btn btn-warning btn-sm"
                >
                  Mark Unpaid
                </button>
              ) : (
                <button 
                  onClick={() => markAsPaid(bill.id)}
                  className="btn btn-success btn-sm"
                >
                  Mark Paid
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentTracker;