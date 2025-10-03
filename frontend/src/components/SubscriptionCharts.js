import React from 'react';

function SubscriptionCharts({ subscriptions }) {
  const getCategoryData = () => {
    const categoryTotals = subscriptions.reduce((acc, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + sub.price;
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  };

  const getMonthlyCostByCategory = () => {
    const monthlyCosts = subscriptions.reduce((acc, sub) => {
      let monthlyPrice = sub.price;
      if (sub.recurring_schedule === 'yearly') monthlyPrice = sub.price / 12;
      if (sub.recurring_schedule === 'quarterly') monthlyPrice = sub.price / 3;
      if (sub.recurring_schedule === 'weekly') monthlyPrice = sub.price * 4;
      
      acc[sub.category] = (acc[sub.category] || 0) + monthlyPrice;
      return acc;
    }, {});

    return Object.entries(monthlyCosts).map(([category, cost]) => ({
      category,
      cost: parseFloat(cost.toFixed(2))
    }));
  };

  const categoryData = getCategoryData();
  const monthlyData = getMonthlyCostByCategory();

  return (
    <div className="charts-container">
      {/* Category Spending Pie Chart (Visual) */}
      <div className="card">
        <h3>📊 Spending by Category</h3>
        <div className="chart-grid">
          {categoryData.map((item, index) => (
            <div key={item.name} className="chart-item">
              <div className="chart-bar" style={{width: `${(item.value / Math.max(...categoryData.map(d => d.value))) * 100}%`}}></div>
              <div className="chart-info">
                <span className="chart-label">{item.name}</span>
                <span className="chart-value">${item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Cost Breakdown */}
      <div className="card">
        <h3>💰 Monthly Costs</h3>
        <div className="monthly-breakdown">
          {monthlyData.map((item) => (
            <div key={item.category} className="monthly-item">
              <span className="monthly-category">{item.category}</span>
              <span className="monthly-cost">${item.cost}/mo</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SubscriptionCharts;