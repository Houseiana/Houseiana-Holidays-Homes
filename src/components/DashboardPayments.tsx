'use client';

import { CreditCard, Plus, DollarSign, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function DashboardPayments() {
  // Mock Data
  const transactions = [
    {
      id: '1',
      description: 'Booking: Modern Downtown Apartment',
      date: 'Nov 01, 2024',
      amount: -1250.00,
      status: 'completed',
      type: 'payment'
    },
    {
      id: '2',
      description: 'Refund: Security Deposit',
      date: 'Oct 28, 2024',
      amount: 500.00,
      status: 'completed',
      type: 'refund'
    },
    {
      id: '3',
      description: 'Booking: Cozy Beach House',
      date: 'Oct 15, 2024',
      amount: -850.00,
      status: 'completed',
      type: 'payment'
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments & Payouts</h1>
        <p className="text-gray-500">Manage your payment methods and view transaction history</p>
      </div>

      {/* Payment Methods */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-orange-600" size={24} />
            Payment Methods
          </h2>
          <button className="flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700">
            <Plus size={16} />
            Add Method
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-8 bg-white/20 rounded-md backdrop-blur-sm"></div>
                <span className="px-2 py-1 bg-orange-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">Primary</span>
              </div>
              <div className="mb-6">
                <p className="font-mono text-xl tracking-widest text-gray-300">•••• •••• •••• 4242</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Card Holder</p>
                  <p className="font-bold tracking-wide">JOHN DOE</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Expires</p>
                  <p className="font-bold tracking-wide">12/25</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm text-gray-900 relative overflow-hidden group cursor-pointer hover:border-gray-300 transition-colors">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-8 bg-gray-200 rounded-md"></div>
            </div>
            <div className="mb-6">
              <p className="font-mono text-xl tracking-widest text-gray-500">•••• •••• •••• 8888</p>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Card Holder</p>
                <p className="font-bold tracking-wide text-gray-700">JOHN DOE</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Expires</p>
                <p className="font-bold tracking-wide text-gray-700">09/24</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction History */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <DollarSign className="text-green-600" size={24} />
          Transaction History
        </h2>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${transaction.type === 'payment' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                          {transaction.type === 'payment' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                        </div>
                        <span className="font-medium text-gray-900">{transaction.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{transaction.date}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} USD
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold capitalize">
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-900 transition-colors">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
