import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function TradeModal({ isOpen, onClose, symbol, currentPrice, onSuccess }) {
  const [type, setType] = useState('BUY');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [portfolioBalance, setPortfolioBalance] = useState(0);
  const [ownedShares, setOwnedShares] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setType('BUY');
      fetchUserData();
    }
  }, [isOpen, symbol]);

  const fetchUserData = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      if (res.data && res.data.portfolio) {
        setPortfolioBalance(res.data.portfolio.balance || 0);
        
        // Find if user already owns this stock
        const holding = res.data.portfolio.holdings?.find(h => h.symbol === symbol);
        setOwnedShares(holding ? holding.quantity : 0);
      }
    } catch (error) {
      console.error("Failed to fetch user data for trade modal", error);
    }
  };

  const executeTrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/transactions/trade', {
        symbol,
        type,
        quantity: Number(quantity)
      });
      
      toast.success(`${type} order for ${quantity} shares of ${symbol} executed!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to execute trade');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const estimatedTotal = currentPrice * quantity;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-main)]">
          <div>
            <h2 className="text-2xl font-bold">Trade {symbol}</h2>
            <p className="text-3xl font-mono mt-1">${currentPrice?.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-white transition-colors bg-[var(--bg-secondary)] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={executeTrade} className="p-6 space-y-6">
          
          {/* User Status */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--border-color)]">
            <div>
              <p className="text-[var(--text-muted)] flex items-center gap-1"><DollarSign className="w-4 h-4"/> Available Cash</p>
              <p className="font-bold text-lg">${portfolioBalance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] flex items-center gap-1"><Briefcase className="w-4 h-4"/> Owned Shares</p>
              <p className="font-bold text-lg">{ownedShares}</p>
            </div>
          </div>

          {/* Trade Type Toggle */}
          <div className="flex p-1 bg-[var(--bg-main)] rounded-lg border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`flex-1 py-2 font-bold rounded-md transition-colors ${
                type === 'BUY' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`flex-1 py-2 font-bold rounded-md transition-colors ${
                type === 'SELL' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              SELL
            </button>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2 font-semibold">Shares to {type}</label>
            <input
              type="number"
              min="1"
              step="1"
              required
              className="input-field text-xl font-bold py-3"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Summary */}
          <div className="flex justify-between items-center py-4 border-t border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] font-semibold">Estimated Total</span>
            <span className="text-2xl font-bold font-mono">${estimatedTotal.toFixed(2)}</span>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || quantity < 1 || (type === 'BUY' && estimatedTotal > portfolioBalance) || (type === 'SELL' && quantity > ownedShares)}
            className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-transform active:scale-[0.98] ${
              type === 'BUY' 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-emerald-500/30' 
                : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/30'
            }`}
          >
            {loading ? 'Processing...' : `Confirm ${type} Order`}
          </button>
        </form>
      </div>
    </div>
  );
}
