import React from 'react';

const AdminFinance: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-3">Financial Control</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Advanced financial analytics, revenue tracking, and transaction auditing features are currently under development.
      </p>
      <div className="px-6 py-2 bg-yellow-50 border border-yellow-100 rounded-full">
        <span className="text-sm font-bold text-yellow-700 uppercase tracking-widest">Coming Soon</span>
      </div>
    </div>
  );
};

export default AdminFinance;
