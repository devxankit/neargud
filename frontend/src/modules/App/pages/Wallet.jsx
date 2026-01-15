import { useState } from 'react';
import { FiDollarSign, FiEye, FiEyeOff, FiArrowLeft, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../../../store/walletStore';

const Wallet = () => {
  const { wallet, addMoney, isLoading } = useWalletStore();
  const [addAmount, setAddAmount] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();

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
      } catch {}
    }}
    disabled={isLoading || !addAmount}
    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all active:scale-95 mb-3"
  >
    {isLoading ? 'Adding...' : 'Add Money'}
  </button>

  {/* Quick Amount Buttons */}
  <div className="grid grid-cols-4 gap-2">
    {[100, 200, 500, 1000].map((amt) => (
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

      {/* Info */}
      <p className="text-sm text-gray-500 text-center mt-6">
        Your wallet transactions will appear here.
      </p>

    </div>
  );
};

export default Wallet;
