import React from 'react';

function ExportData({ subscriptions }) {
  const exportToCSV = () => {
    const headers = ['Name', 'Price', 'Currency', 'Due Date', 'Category', 'Schedule', 'Notes'];
    const csvData = subscriptions.map(sub => [
      sub.name,
      sub.price,
      sub.currency,
      sub.due_date,
      sub.category,
      sub.recurring_schedule,
      sub.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const totalMonthly = subscriptions.reduce((total, sub) => {
      let monthlyPrice = sub.price;
      if (sub.recurring_schedule === 'yearly') monthlyPrice = sub.price / 12;
      if (sub.recurring_schedule === 'quarterly') monthlyPrice = sub.price / 3;
      if (sub.recurring_schedule === 'weekly') monthlyPrice = sub.price * 4;
      return total + monthlyPrice;
    }, 0);

    const report = `
      SUBSCRIPTION REPORT
      Generated: ${new Date().toLocaleDateString()}
      
      Total Subscriptions: ${subscriptions.length}
      Monthly Cost: $${totalMonthly.toFixed(2)}
      Yearly Cost: $${(totalMonthly * 12).toFixed(2)}
      
      SUBSCRIPTIONS:
      ${subscriptions.map(sub => `
      - ${sub.name}: $${sub.price} (${sub.recurring_schedule})
        Due: ${sub.due_date} | Category: ${sub.category}
        ${sub.notes ? `Notes: ${sub.notes}` : ''}
      `).join('')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscription-report-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <h3>📤 Export Data</h3>
      <div className="export-buttons">
        <button onClick={exportToCSV} className="btn btn-secondary">
          📄 Export to CSV
        </button>
        <button onClick={generateReport} className="btn btn-secondary">
          📊 Generate Report
        </button>
      </div>
    </div>
  );
}

export default ExportData;