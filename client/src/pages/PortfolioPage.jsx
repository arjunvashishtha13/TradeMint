import { useState, useEffect } from 'react';
import { Briefcase, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import api from '../services/api';
import TradeModal from '../components/TradeModal';

export default function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Trade Modal State
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradePrice, setTradePrice] = useState(0);

  const fetchPortfolioData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setPortfolioData(response.data);
    } catch (error) {
      console.error('Failed to fetch portfolio data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading Portfolio...</div>;
  }

  const holdings = portfolioData?.portfolio?.holdings || [];

  const handleOpenTrade = (symbol, currentPrice) => {
    setTradeSymbol(symbol);
    setTradePrice(currentPrice);
    setShowTradeModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Portfolio</h1>
          <p className="text-[var(--text-muted)] text-sm">Manage your current stock holdings</p>
        </div>
        <button onClick={() => fetchPortfolioData()} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="clean-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                <th className="p-4 font-semibold text-sm">Asset</th>
                <th className="p-4 font-semibold text-sm text-right">Quantity</th>
                <th className="p-4 font-semibold text-sm text-right">Avg Price</th>
                <th className="p-4 font-semibold text-sm text-right">Current Price</th>
                <th className="p-4 font-semibold text-sm text-right">Current Value</th>
                <th className="p-4 font-semibold text-sm text-right">P&L</th>
                <th className="p-4 font-semibold text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => {
                const isProfit = holding.returnPct >= 0;

                return (
                  <tr key={holding.symbol} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-pink-500/10 text-[var(--color-brand-primary)] flex items-center justify-center font-bold text-sm">
                          {holding.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold">{holding.symbol}</p>
                          <p className="text-xs text-[var(--text-muted)]">{holding.name || holding.sector}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium">{holding.quantity}</td>
                    <td className="p-4 text-right font-medium">${holding.averagePrice.toFixed(2)}</td>
                    <td className="p-4 text-right font-medium">${holding.currentPrice.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold">${holding.currentValue.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <div className={`flex flex-col items-end ${isProfit ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                        <span className="font-bold flex items-center gap-1">
                          {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          ${Math.abs(holding.currentValue - holding.invested).toFixed(2)}
                        </span>
                        <span className="text-xs font-semibold">{isProfit ? '+' : ''}{holding.returnPct.toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleOpenTrade(holding.symbol, holding.currentPrice)}
                        className="btn-secondary py-1 px-4 text-xs font-bold text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)] hover:text-white"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {holdings.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
              <p className="text-[var(--text-muted)]">No active holdings. Go to the Market Dashboard to start trading!</p>
            </div>
          )}
        </div>
      </div>

      {showTradeModal && (
        <TradeModal 
          isOpen={showTradeModal} 
          onClose={() => setShowTradeModal(false)} 
          symbol={tradeSymbol} 
          currentPrice={tradePrice}
          onSuccess={fetchPortfolioData}
        />
      )}
    </div>
  );
}
