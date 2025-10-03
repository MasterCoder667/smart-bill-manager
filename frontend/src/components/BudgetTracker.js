import React, { useState } from 'react';

function BudgetTracker({ subscriptions }) {
  const [monthlyBudget, setMonthlyBudget] = useState(100);

  const calculateTotalMonthly = () => {
    return subscriptions.reduce((total, sub) => {
      let monthlyPrice = sub.price;
      if (sub.recurring_schedule === 'yearly') monthlyPrice = sub.price / 12;
      if (sub.recurring_schedule === 'quarterly') monthlyPrice = sub.price / 3;
      if (sub.recurring_schedule === 'weekly') monthlyPrice = sub.price * 4;
      return total + monthlyPrice;
    }, 0);
  };

  const totalMonthly = calculateTotalMonthly();
  const budgetUsage = (totalMonthly / monthlyBudget) * 100;
  const remainingBudget = monthlyBudget - totalMonthly;

  const getBudgetStatus = () => {
    if (budgetUsage >= 100) return { status: 'over-budget', color: '#e53e3e' };
    if (budgetUsage >= 80) return { status: 'warning', color: '#dd6b20' };
    return { status: 'within-budget', color: '#38a169' };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="card">
      <h3>💰 Monthly Budget Tracker</h3>
      
      <div className="budget-input">
        <label>Monthly Budget: £</label>
        <input
          type="number"
          value={monthlyBudget}
          onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
          min="0"
          step="10"
        />
      </div>

      <div className="budget-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.min(budgetUsage, 100)}%`,
              backgroundColor: budgetStatus.color
            }}
          ></div>
        </div>
        <div className="progress-text">
          <span>£{totalMonthly.toFixed(2)} / £{monthlyBudget}</span>
          <span>{budgetUsage.toFixed(1)}%</span>
        </div>
      </div>

      <div className="budget-stats">
        <div className={`budget-stat £{budgetStatus.status}`}>
          <strong>Remaining: £{Math.max(remainingBudget, 0).toFixed(2)}</strong>
        </div>
        {remainingBudget < 0 && (
          <div className="budget-stat over-budget">
            <strong>Over Budget: £{Math.abs(remainingBudget).toFixed(2)}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetTracker;