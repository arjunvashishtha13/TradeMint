import { useState, useEffect } from 'react';
import { BarChart3, PieChart as PieIcon, Activity, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';

const COLORS = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
};

export default function AnalyticsPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await api.get('/analytics/dashboard');
        setPortfolio(response.data);
      } catch (error) {
        console.error('Failed to fetch portfolio', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading Dashboard...</div>;
  }

  const { portfolio: port, analytics } = portfolio || {};
  const profitLoss = (port?.currentValue || 0) - (port?.totalInvestment || 0);
  const isProfit = profitLoss >= 0;

  // Use mock data if real data is empty for visual demonstration
  const performanceData = port?.performanceHistory?.length > 0 ? port.performanceHistory.map(h => ({
    month: new Date(h.date).toLocaleString('default', { month: 'short' }),
    value: h.value
  })) : [
    { month: 'Jan', value: 100000 },
    { month: 'Feb', value: 102000 }
  ];

  const sectorData = analytics?.sectorDistribution?.length > 0 ? analytics.sectorDistribution : [
    { name: 'No Data', value: 100 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Portfolio Overview</h1>
        <p className="text-[var(--text-muted)] text-sm">Analyze your allocation and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="clean-card p-5 border-l-4 border-l-[var(--color-brand-primary)]">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Value</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-brand-primary)]">
            {formatCurrency(port?.totalPortfolioValue)}
          </p>
        </div>

        <div className="clean-card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Available Cash</span>
          </div>
          <p className="text-3xl font-bold text-blue-500">
            {formatCurrency(port?.balance)}
          </p>
        </div>

        <div className="clean-card p-5 border-l-4 border-l-[var(--color-profit)]">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Invested</span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-main)]">
            {formatCurrency(port?.totalInvestment)}
          </p>
        </div>

        <div className={`clean-card p-5 border-l-4 ${isProfit ? 'border-l-[var(--color-profit)]' : 'border-l-[var(--color-loss)]'}`}>
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Profit / Loss</span>
          </div>
          <p className={`text-3xl font-bold ${isProfit ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
            {isProfit ? '+' : '-'}{formatCurrency(Math.abs(profitLoss))}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="clean-card p-6">
            <h3 className="text-lg font-bold mb-6">Historical Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-[var(--border-color)]" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'currentColor' }} className="text-[var(--text-muted)] text-xs" axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'currentColor' }} className="text-[var(--text-muted)] text-xs" axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-main)' }}
                  formatter={(value) => [`$${value}`, 'Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* New Investment Insights Row */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="clean-card p-4">
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Best Performing</h4>
              <p className="text-xl font-bold">{analytics?.insights?.bestStock?.symbol || 'N/A'}</p>
              {analytics?.insights?.bestStock && (
                <p className="text-sm text-[var(--color-profit)]">+{analytics.insights.bestStock.returnPct.toFixed(2)}%</p>
              )}
            </div>
            <div className="clean-card p-4">
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Worst Performing</h4>
              <p className="text-xl font-bold">{analytics?.insights?.worstStock?.symbol || 'N/A'}</p>
              {analytics?.insights?.worstStock && (
                <p className="text-sm text-[var(--color-loss)]">{analytics.insights.worstStock.returnPct.toFixed(2)}%</p>
              )}
            </div>
            <div className="clean-card p-4">
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Largest Holding</h4>
              <p className="text-xl font-bold">{analytics?.insights?.largestHolding?.symbol || 'N/A'}</p>
              {analytics?.insights?.largestHolding && (
                <p className="text-sm text-[var(--text-muted)]">{formatCurrency(analytics.insights.largestHolding.value)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="clean-card p-6">
            <h3 className="text-lg font-bold mb-6">Sector Allocation</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sectorData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-main)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {sectorData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-[var(--text-muted)]">{entry.name}</span>
                  </div>
                  <span className="font-semibold">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="clean-card p-6 text-center">
            <h3 className="text-lg font-bold mb-4">Diversification Score</h3>
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center rounded-full border-8" style={{ borderColor: analytics?.riskTier === 'Excellent' ? 'var(--color-profit)' : analytics?.riskTier === 'Good' ? '#3b82f6' : analytics?.riskTier === 'Moderate' ? '#f59e0b' : 'var(--color-loss)' }}>
              <div>
                <p className="text-3xl font-bold">{analytics?.diversificationScore || 0}</p>
                <p className="text-xs text-[var(--text-muted)]">/ 100</p>
              </div>
            </div>
            <p className={`mt-4 font-semibold ${analytics?.riskTier === 'Excellent' ? 'text-[var(--color-profit)]' : analytics?.riskTier === 'Good' ? 'text-blue-500' : analytics?.riskTier === 'Moderate' ? 'text-yellow-500' : 'text-[var(--color-loss)]'}`}>
              Risk Tier: {analytics?.riskTier || 'High Risk'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
