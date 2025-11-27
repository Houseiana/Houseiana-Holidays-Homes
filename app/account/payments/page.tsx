'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Globe, Menu, ChevronLeft, ChevronRight, CreditCard, Building2, Plus, MoreHorizontal, Gift, Receipt, DollarSign, AlertCircle, Check, X } from 'lucide-react';

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('payments');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showAddPayoutModal, setShowAddPayoutModal] = useState(false);

  const user = {
    name: 'Mohamed',
    avatar: 'M',
  };

  const paymentMethods = [
    {
      id: 1,
      type: 'visa',
      last4: '4242',
      expiry: '12/26',
      isDefault: true,
    },
    {
      id: 2,
      type: 'mastercard',
      last4: '8888',
      expiry: '03/25',
      isDefault: false,
    },
  ];

  const payoutMethods = [
    {
      id: 1,
      type: 'bank',
      bankName: 'Qatar National Bank',
      last4: '7890',
      currency: 'QAR',
      isDefault: true,
      status: 'ready',
    },
  ];

  const recentPayments = [
    {
      id: 1,
      property: 'Modern Downtown Apartment',
      date: 'Oct 15, 2024',
      amount: 1280.00,
      status: 'completed',
    },
    {
      id: 2,
      property: 'Cozy Beach House',
      date: 'Sep 28, 2024',
      amount: 945.00,
      status: 'completed',
    },
    {
      id: 3,
      property: 'Luxury Villa with Pool',
      date: 'Aug 10, 2024',
      amount: 2150.00,
      status: 'refunded',
    },
  ];

  const recentPayouts = [
    {
      id: 1,
      date: 'Oct 20, 2024',
      amount: 850.00,
      status: 'completed',
      method: 'Qatar National Bank ••••7890',
    },
    {
      id: 2,
      date: 'Oct 5, 2024',
      amount: 1240.00,
      status: 'completed',
      method: 'Qatar National Bank ••••7890',
    },
    {
      id: 3,
      date: 'Sep 20, 2024',
      amount: 620.00,
      status: 'pending',
      method: 'Qatar National Bank ••••7890',
    },
  ];

  const CardIcon = ({ type }: { type: string }) => {
    if (type === 'visa') {
      return (
        <div className="w-10 h-7 bg-[#1A1F71] rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold italic">VISA</span>
        </div>
      );
    }
    if (type === 'mastercard') {
      return (
        <div className="w-10 h-7 bg-gray-900 rounded flex items-center justify-center">
          <div className="flex -space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          </div>
        </div>
      );
    }
    return <CreditCard className="w-6 h-6 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">houseiana</span>
            </a>

            {/* Right Menu */}
            <div className="flex items-center gap-2">
              <button className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-3 rounded-full transition-colors">
                List your home
              </button>
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <Globe className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 border border-gray-300 rounded-full p-1 pl-3 hover:shadow-md transition-shadow"
                >
                  <Menu className="w-4 h-4 text-gray-600" />
                  <div className="bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{user.avatar}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/client-dashboard?tab=account" className="text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Account
          </Link>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Payments & payouts</h1>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'payments'
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-500 border-transparent hover:text-gray-900'
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'payouts'
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-500 border-transparent hover:text-gray-900'
            }`}
          >
            Payouts
          </button>
        </div>

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-12">
            {/* Payment Methods Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payment methods</h2>
                  <p className="text-gray-500 text-sm mt-1">Add and manage your payment methods using our secure payment system.</p>
                </div>
              </div>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <CardIcon type={method.type} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {method.type === 'visa' ? 'Visa' : 'Mastercard'} ••••{method.last4}
                          {method.isDefault && (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">Expiry {method.expiry}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => setShowAddPaymentModal(true)}
                  className="flex items-center gap-3 p-4 border border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors w-full"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">Add payment method</span>
                </button>
              </div>
            </section>

            {/* Your Payments Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your payments</h2>
                <button className="text-sm font-medium text-teal-600 hover:underline">
                  Manage payments
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Description</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Amount</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900">{payment.property}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-500">{payment.date}</td>
                        <td className="px-4 py-4 font-medium text-gray-900">${payment.amount.toFixed(2)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'completed'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {payment.status === 'completed' && <Check className="w-3 h-3" />}
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="mt-4 text-sm font-medium text-gray-900 hover:underline flex items-center gap-1">
                View all payments
                <ChevronRight className="w-4 h-4" />
              </button>
            </section>

            {/* Credits & Coupons Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Credits & coupons</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 border border-gray-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Gift className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Gift cards</h3>
                      <p className="text-sm text-gray-500 mb-3">Redeem a gift card to add credit to your account</p>
                      <button className="text-sm font-medium text-teal-600 hover:underline">
                        Add gift card
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-gray-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Coupons</h3>
                      <p className="text-sm text-gray-500 mb-3">Add a coupon code to get a discount on your booking</p>
                      <button className="text-sm font-medium text-teal-600 hover:underline">
                        Add coupon
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Balance */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Your credit balance</p>
                  <p className="text-2xl font-bold text-gray-900">$0.00</p>
                </div>
                <DollarSign className="w-8 h-8 text-gray-300" />
              </div>
            </section>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <div className="space-y-12">
            {/* How you'll get paid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">How you'll get paid</h2>
                  <p className="text-gray-500 text-sm mt-1">Add at least one payout method so we know where to send your money.</p>
                </div>
              </div>

              <div className="space-y-4">
                {payoutMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {method.bankName} ••••{method.last4}
                          {method.isDefault && (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{method.currency} · Bank account</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        method.status === 'ready'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {method.status === 'ready' && <Check className="w-3 h-3" />}
                        {method.status === 'ready' ? 'Ready' : 'Pending'}
                      </span>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowAddPayoutModal(true)}
                  className="flex items-center gap-3 p-4 border border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors w-full"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">Add payout method</span>
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">When will I get my payout?</p>
                  <p>Payouts are typically released 24 hours after your guest's scheduled check-in time. The time it takes for the payout to arrive depends on your payout method.</p>
                </div>
              </div>
            </section>

            {/* Transaction History */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Transaction history</h2>
                <button className="text-sm font-medium text-teal-600 hover:underline">
                  Download CSV
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Amount</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Payout method</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-gray-900">{payout.date}</td>
                        <td className="px-4 py-4 font-medium text-gray-900">${payout.amount.toFixed(2)}</td>
                        <td className="px-4 py-4 text-gray-500">{payout.method}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            payout.status === 'completed'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {payout.status === 'completed' && <Check className="w-3 h-3" />}
                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="mt-4 text-sm font-medium text-gray-900 hover:underline flex items-center gap-1">
                View all transactions
                <ChevronRight className="w-4 h-4" />
              </button>
            </section>

            {/* Taxes */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Taxes</h2>
              <p className="text-gray-500 text-sm mb-6">Taxpayer information is required for hosts. This information is used to file tax documents.</p>

              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Add taxpayer information
              </button>
            </section>
          </div>
        )}
      </main>

      {/* Add Payment Method Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddPaymentModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Add payment method</h2>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Billing address</label>
                <input
                  type="text"
                  placeholder="Street address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Postal code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                <span className="text-sm text-gray-700">Set as default payment method</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-3 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition-colors">
                Add card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payout Method Modal */}
      {showAddPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddPayoutModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Add payout method</h2>
              <button
                onClick={() => setShowAddPayoutModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Billing country/region</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white">
                  <option>Qatar</option>
                  <option>United Arab Emirates</option>
                  <option>Saudi Arabia</option>
                  <option>United States</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Payout method</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-teal-500 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                    <input type="radio" name="payout" className="w-5 h-5 text-teal-500" defaultChecked />
                    <Building2 className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Bank account</p>
                      <p className="text-sm text-gray-500">3-5 business days</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-teal-500 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                    <input type="radio" name="payout" className="w-5 h-5 text-teal-500" />
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">PayPal</p>
                      <p className="text-sm text-gray-500">Within minutes</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account holder name</label>
                <input
                  type="text"
                  placeholder="Full name on account"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                <input
                  type="text"
                  placeholder="QA00 0000 0000 0000 0000 0000 0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddPayoutModal(false)}
                className="px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-3 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition-colors">
                Add payout method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>© 2024 Houseiana, Inc.</span>
              <span>·</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:underline">Terms</a>
            </div>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-sm font-medium hover:underline">
                <Globe className="w-4 h-4" />
                English (US)
              </button>
              <span className="text-sm font-medium">$ USD</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
