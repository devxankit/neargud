import { useState, useEffect } from 'react';
import { FiDollarSign, FiEye, FiEyeOff, FiArrowLeft, FiPlus, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../../../store/walletStore';
import { format } from 'date-fns';

const Wallet = () => {
  const { wallet, transactions, addMoney, fetchWallet, fetchTransactions, isLoading } = useWalletStore();
  const [addAmount, setAddAmount] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  const quickAmounts = [100, 200, 500, 1000];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-4 pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 py-4 sticky top-0 bg-green-50 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white shadow active:scale-95 transition"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">My Wallet</h1>
      </div>

      {/* Wallet Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-green-700 rounded-3xl p-6 shadow-xl text-white mt-4">

        {/* Decorative Blur */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />

        {/* Title Row */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <FiDollarSign className="text-2xl" />
            <h2 className="text-lg font-semibold tracking-wide">Wallet Balance</h2>
          </div>

          <button
            onClick={() => setShowBalance(!showBalance)}
            className="bg-white/20 p-2 rounded-full active:scale-95 transition"
          >
            {showBalance ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>

        {/* Balance */}
        <div className="text-4xl font-extrabold tracking-wide mb-6 relative z-10">
          {showBalance ? `₹${(wallet?.balance || 0).toFixed(2)}` : "₹ ••••••"}
        </div>

        {/* Add Money Section */}
        <div className="bg-white rounded-2xl p-4 relative z-10">
          {/* Input */}
          <input
            type="number"
            min="1"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-gray-700 font-medium mb-3"
            placeholder="Enter Amount"
          />

          {/* Add Button */}
          <button
            onClick={async () => {
              try {
                await addMoney(Number(addAmount));
                setAddAmount('');
                fetchTransactions();
              } catch { }
            }}
            disabled={isLoading || !addAmount}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all active:scale-95 mb-3"
          >
            {isLoading ? 'Adding...' : 'Add Money'}
          </button>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAddAmount(amt)}
                className="py-2 rounded-xl bg-green-50 text-green-700 font-semibold border border-green-200 active:scale-95 transition"
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-lg font-bold text-gray-800">Transaction History</h3>
          <div className="flex gap-2">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Total Added</span>
              <span className="text-sm font-bold text-green-600">₹{wallet?.totalCredit?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="w-px h-8 bg-gray-200 mx-1"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Total Used</span>
              <span className="text-sm font-bold text-red-500">₹{wallet?.totalDebit?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {!transactions?.length ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
              <FiClock className="mx-auto text-gray-300 mb-2" size={24} />
              <p className="text-sm text-gray-500 font-medium">No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center border border-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    <FiClock size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{tx.description}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {format(new Date(tx.date), 'MMM dd, yyyy • hh:mm a')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toFixed(2)}
                  </p>
                  <div className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-50 text-[8px] font-bold text-gray-400 border border-gray-100 uppercase tracking-tighter">
                    {tx.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Wallet;
