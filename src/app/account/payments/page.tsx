'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {

  AccountFooter,
  AccountBreadcrumb,
  PaymentsTabs,
  PaymentMethodItem,
  AddPaymentMethodButton,
  PayoutMethodItem,
  AddPayoutMethodButton,
  PaymentsTable,
  PayoutsTable,
  PayoutInfoBox,
  TaxesSection,
  AddPaymentModal,
  AddPayoutModal,
  SecuritySection,
  ConfirmModal,
  type PaymentMethod,
  type PayoutMethod,
  type PaymentRecord,
  type PayoutRecord,
  type PaymentFormData,
  type PayoutFormData,
} from '@/features/auth/components';
import { AccountAPI } from '@/lib/backend-api';
import { Gift, Receipt, DollarSign, X } from 'lucide-react';

export default function PaymentsPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  // Tab state
  const [activeTab, setActiveTab] = useState<'payments' | 'payouts'>('payments');

  // Modal states
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showAddPayoutModal, setShowAddPayoutModal] = useState(false);
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false);
  const [showDeletePayoutModal, setShowDeletePayoutModal] = useState(false);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isAddingPayout, setIsAddingPayout] = useState(false);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [isDeletingPayout, setIsDeletingPayout] = useState(false);
  const [isRedeemingCode, setIsRedeemingCode] = useState(false);

  // Selected items for deletion
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);

  // Data states
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditCurrency, setCreditCurrency] = useState('SAR');

  // Code input states
  const [giftCardCode, setGiftCardCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch all data in parallel
      const [
        paymentMethodsRes,
        payoutMethodsRes,
        paymentsRes,
        payoutsRes,
        creditsRes,
      ] = await Promise.all([
        AccountAPI.getPaymentMethods(),
        AccountAPI.getPayoutMethods(),
        AccountAPI.getPayments(),
        AccountAPI.getPayouts(),
        AccountAPI.getCredits(),
      ]);

      if (paymentMethodsRes.success && paymentMethodsRes.data) {
        setPaymentMethods(paymentMethodsRes.data as PaymentMethod[]);
      }

      if (payoutMethodsRes.success && payoutMethodsRes.data) {
        setPayoutMethods(payoutMethodsRes.data as PayoutMethod[]);
      }

      if (paymentsRes.success && paymentsRes.data) {
        const paymentsData = paymentsRes.data.data || [];
        setPayments(
          paymentsData.map((p: any) => ({
            id: p.id,
            property: p.property,
            date: new Date(p.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            amount: p.amount,
            status: p.status,
            currency: p.currency,
          }))
        );
      }

      if (payoutsRes.success && payoutsRes.data) {
        const payoutsData = payoutsRes.data.data || [];
        setPayouts(
          payoutsData.map((p: any) => ({
            id: p.id,
            date: new Date(p.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            amount: p.amount,
            status: p.status,
            method: p.method,
            currency: p.currency,
          }))
        );
      }

      if (creditsRes.success && creditsRes.data) {
        setCreditBalance(creditsRes.data.balance);
        setCreditCurrency(creditsRes.data.currency);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Redirect if not signed in
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  // Fetch data on mount
  useEffect(() => {
    if (isSignedIn) {
      fetchData();
    }
  }, [isSignedIn, fetchData]);

  // Add payment method handler
  const handleAddPayment = async (data: PaymentFormData) => {
    setIsAddingPayment(true);
    try {
      const response = await AccountAPI.addPaymentMethod({
        cardNumber: data.cardNumber,
        expiry: data.expiry,
        cardholderName: data.cardNumber, // Use card number holder
        billingAddress: {
          street: data.street,
          city: data.city,
          postalCode: data.postalCode,
          country: 'SA',
        },
        isDefault: data.isDefault,
      });

      if (response.success) {
        await fetchData();
        setShowAddPaymentModal(false);
      } else {
        console.error('Failed to add payment method:', response.error);
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setIsAddingPayment(false);
    }
  };

  // Add payout method handler
  const handleAddPayout = async (data: PayoutFormData) => {
    setIsAddingPayout(true);
    try {
      const response = await AccountAPI.addPayoutMethod({
        payoutType: data.payoutType,
        country: data.country,
        accountHolderName: data.accountHolderName,
        iban: data.iban,
        paypalEmail: data.paypalEmail,
        isDefault: data.isDefault,
      });

      if (response.success) {
        await fetchData();
        setShowAddPayoutModal(false);
      } else {
        console.error('Failed to add payout method:', response.error);
      }
    } catch (error) {
      console.error('Error adding payout method:', error);
    } finally {
      setIsAddingPayout(false);
    }
  };

  // Manage payment method (delete or set default)
  const handleManagePaymentMethod = (id: string | number) => {
    setSelectedPaymentId(String(id));
    setShowDeletePaymentModal(true);
  };

  // Manage payout method (delete or set default)
  const handleManagePayoutMethod = (id: string | number) => {
    setSelectedPayoutId(String(id));
    setShowDeletePayoutModal(true);
  };

  // Delete payment method
  const handleDeletePaymentMethod = async () => {
    if (!selectedPaymentId) return;

    setIsDeletingPayment(true);
    try {
      const response = await AccountAPI.deletePaymentMethod(selectedPaymentId);
      if (response.success) {
        await fetchData();
        setShowDeletePaymentModal(false);
        setSelectedPaymentId(null);
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
    } finally {
      setIsDeletingPayment(false);
    }
  };

  // Delete payout method
  const handleDeletePayoutMethod = async () => {
    if (!selectedPayoutId) return;

    setIsDeletingPayout(true);
    try {
      const response = await AccountAPI.deletePayoutMethod(selectedPayoutId);
      if (response.success) {
        await fetchData();
        setShowDeletePayoutModal(false);
        setSelectedPayoutId(null);
      }
    } catch (error) {
      console.error('Error deleting payout method:', error);
    } finally {
      setIsDeletingPayout(false);
    }
  };

  // Redeem gift card
  const handleRedeemGiftCard = async () => {
    if (!giftCardCode.trim()) {
      setCodeError('Please enter a gift card code');
      return;
    }

    setIsRedeemingCode(true);
    setCodeError('');
    setCodeSuccess('');

    try {
      const response = await AccountAPI.redeemGiftCard(giftCardCode);
      if (response.success) {
        setCodeSuccess(response.message || 'Gift card redeemed successfully!');
        setGiftCardCode('');
        await fetchData();
        setTimeout(() => {
          setShowGiftCardModal(false);
          setCodeSuccess('');
        }, 2000);
      } else {
        setCodeError(response.error || 'Invalid gift card code');
      }
    } catch (error) {
      setCodeError('Failed to redeem gift card');
    } finally {
      setIsRedeemingCode(false);
    }
  };

  // Add coupon
  const handleAddCoupon = async () => {
    if (!couponCode.trim()) {
      setCodeError('Please enter a coupon code');
      return;
    }

    setIsRedeemingCode(true);
    setCodeError('');
    setCodeSuccess('');

    try {
      const response = await AccountAPI.addCoupon(couponCode);
      if (response.success) {
        setCodeSuccess(response.message || 'Coupon added successfully!');
        setCouponCode('');
        await fetchData();
        setTimeout(() => {
          setShowCouponModal(false);
          setCodeSuccess('');
        }, 2000);
      } else {
        setCodeError(response.error || 'Invalid coupon code');
      }
    } catch (error) {
      setCodeError('Failed to add coupon');
    } finally {
      setIsRedeemingCode(false);
    }
  };

  // Export payouts as CSV
  const handleDownloadCSV = async () => {
    try {
      const response = await AccountAPI.exportPayouts('csv');
      if (response.success && response.data) {
        const blob = response.data as Blob;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payouts_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userAvatar =
    user.firstName?.charAt(0).toUpperCase() ||
    user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase() ||
    'U';

  return (
    <div className="min-h-screen bg-white">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <AccountBreadcrumb />

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Payments & payouts</h1>

        {/* Tabs */}
        <PaymentsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your payment information...</p>
          </div>
        ) : (
          <>
            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-12">
                {/* Payment Methods Section */}
                <SecuritySection title="Payment methods">
                  <div className="space-y-4">
                    {paymentMethods.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4">No payment methods added yet.</p>
                    ) : (
                      paymentMethods.map((method) => (
                        <PaymentMethodItem
                          key={method.id}
                          method={method}
                          onManage={handleManagePaymentMethod}
                        />
                      ))
                    )}
                    <AddPaymentMethodButton onClick={() => setShowAddPaymentModal(true)} />
                  </div>
                </SecuritySection>

                {/* Your Payments Section */}
                <SecuritySection
                  title="Your payments"
                  headerAction={
                    <button className="text-sm font-medium text-teal-600 hover:underline">
                      Manage payments
                    </button>
                  }
                >
                  <PaymentsTable
                    payments={payments}
                    currency={creditCurrency}
                    onViewAll={() => router.push('/account/payments/history')}
                  />
                </SecuritySection>

                {/* Credits & Coupons Section */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Credits & coupons</h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Gift Cards */}
                    <div className="p-6 border border-gray-200 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Gift className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Gift cards</h3>
                          <p className="text-sm text-gray-500 mb-3">
                            Redeem a gift card to add credit to your account
                          </p>
                          <button
                            onClick={() => {
                              setCodeError('');
                              setCodeSuccess('');
                              setShowGiftCardModal(true);
                            }}
                            className="text-sm font-medium text-teal-600 hover:underline"
                          >
                            Add gift card
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Coupons */}
                    <div className="p-6 border border-gray-200 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Receipt className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Coupons</h3>
                          <p className="text-sm text-gray-500 mb-3">
                            Add a coupon code to get a discount on your booking
                          </p>
                          <button
                            onClick={() => {
                              setCodeError('');
                              setCodeSuccess('');
                              setShowCouponModal(true);
                            }}
                            className="text-sm font-medium text-teal-600 hover:underline"
                          >
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
                      <p className="text-2xl font-bold text-gray-900">
                        {creditBalance.toFixed(2)} {creditCurrency}
                      </p>
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
                <SecuritySection title="How you'll get paid">
                  <p className="text-gray-500 text-sm mb-4">
                    Add at least one payout method so we know where to send your money.
                  </p>
                  <div className="space-y-4">
                    {payoutMethods.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4">No payout methods added yet.</p>
                    ) : (
                      payoutMethods.map((method) => (
                        <PayoutMethodItem
                          key={method.id}
                          method={method}
                          onManage={handleManagePayoutMethod}
                        />
                      ))
                    )}
                    <AddPayoutMethodButton onClick={() => setShowAddPayoutModal(true)} />
                  </div>

                  <div className="mt-6">
                    <PayoutInfoBox />
                  </div>
                </SecuritySection>

                {/* Transaction History */}
                <SecuritySection
                  title="Transaction history"
                  headerAction={
                    <button
                      onClick={handleDownloadCSV}
                      className="text-sm font-medium text-teal-600 hover:underline"
                    >
                      Download CSV
                    </button>
                  }
                >
                  <PayoutsTable
                    payouts={payouts}
                    currency={creditCurrency}
                    onViewAll={() => router.push('/account/payouts/history')}
                  />
                </SecuritySection>

                {/* Taxes */}
                <TaxesSection onAddTaxInfo={() => console.log('Add tax info')} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onSubmit={handleAddPayment}
        isLoading={isAddingPayment}
      />

      {/* Add Payout Modal */}
      <AddPayoutModal
        isOpen={showAddPayoutModal}
        onClose={() => setShowAddPayoutModal(false)}
        onSubmit={handleAddPayout}
        isLoading={isAddingPayout}
      />

      {/* Delete Payment Method Modal */}
      <ConfirmModal
        isOpen={showDeletePaymentModal}
        onClose={() => {
          setShowDeletePaymentModal(false);
          setSelectedPaymentId(null);
        }}
        onConfirm={handleDeletePaymentMethod}
        title="Remove payment method?"
        description="This payment method will be removed from your account. Any active subscriptions using this method will need a new payment method."
        confirmText={isDeletingPayment ? 'Removing...' : 'Remove'}
        variant="danger"
      />

      {/* Delete Payout Method Modal */}
      <ConfirmModal
        isOpen={showDeletePayoutModal}
        onClose={() => {
          setShowDeletePayoutModal(false);
          setSelectedPayoutId(null);
        }}
        onConfirm={handleDeletePayoutMethod}
        title="Remove payout method?"
        description="This payout method will be removed from your account. Make sure you have another payout method set up to receive payments."
        confirmText={isDeletingPayout ? 'Removing...' : 'Remove'}
        variant="danger"
      />

      {/* Gift Card Modal */}
      {showGiftCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowGiftCardModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Redeem gift card</h2>
              <button onClick={() => setShowGiftCardModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-sm mb-4">Enter your gift card code to add credit to your account.</p>
              <input
                type="text"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                placeholder="Enter gift card code"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
              {codeError && <p className="mt-2 text-sm text-red-600">{codeError}</p>}
              {codeSuccess && <p className="mt-2 text-sm text-green-600">{codeSuccess}</p>}
              <p className="mt-3 text-xs text-gray-400">Try: GIFT100, GIFT200, GIFT500, WELCOME50</p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowGiftCardModal(false)}
                className="px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeemGiftCard}
                disabled={isRedeemingCode}
                className="px-6 py-3 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition-colors disabled:opacity-50"
              >
                {isRedeemingCode ? 'Redeeming...' : 'Redeem'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCouponModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Add coupon</h2>
              <button onClick={() => setShowCouponModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-sm mb-4">Enter your coupon code to save on your next booking.</p>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
              {codeError && <p className="mt-2 text-sm text-red-600">{codeError}</p>}
              {codeSuccess && <p className="mt-2 text-sm text-green-600">{codeSuccess}</p>}
              <p className="mt-3 text-xs text-gray-400">Try: SAVE10, SAVE20, FLAT50, FLAT100, NEWUSER</p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCouponModal(false)}
                className="px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCoupon}
                disabled={isRedeemingCode}
                className="px-6 py-3 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition-colors disabled:opacity-50"
              >
                {isRedeemingCode ? 'Adding...' : 'Add coupon'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AccountFooter />
    </div>
  );
}
