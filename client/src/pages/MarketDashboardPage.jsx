import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, Globe, Search, X, 
  BarChart2, PieChart, Clock, RefreshCw, Bookmark, BookmarkCheck,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';
import api from '../services/api';
import TradeModal from '../components/TradeModal';
import { PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#ef4444', '#6b7280']; // Green, Red, Gray
const SECTOR_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function MarketDashboardPage() {
  const [marketData, setMarketData] = useState({ allQuotes: [], topGainers: [], topDecliners: [], mostActive: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [watchlistSymbols, setWatchlistSymbols] = useState(new Set());
  const [activeWatchlistId, setActiveWatchlistId] = useState('');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Table State
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'change', direction: 'desc' });
  const [tableSearch, setTableSearch] = useState('');
  const itemsPerPage = 10;
  
  // Modal state
  const [selectedStock, setSelectedStock] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/watchlist');
      if (res.data && res.data.length > 0) {
        const mainWatchlist = res.data[0];
        setActiveWatchlistId(mainWatchlist._id);
        const symbols = new Set(mainWatchlist.symbols.map(item => item.symbol));
        setWatchlistSymbols(symbols);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist", error);
    }
  };

  const fetchMarketData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const popularTickers = [
        'AAPL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'GOOGL', 'NFLX', 
        'AMD', 'INTC', 'BA', 'DIS', 'V', 'JPM', 'WMT', 'JNJ', 'PG', 'UNH', 'HD', 'MA'
      ];
      
      const quotes = await Promise.all(
        popularTickers.map(async (sym) => {
          try {
            const res = await api.get(`/market/quote/${sym}`);
            const prof = await api.get(`/market/profile/${sym}`);
            
            // Generate a rough sector mapping for dummy sector chart data since Finnhub doesn't guarantee it in basic profile
            const sectorMap = {
              'AAPL': 'Technology', 'MSFT': 'Technology', 'NVDA': 'Technology', 'AMD': 'Technology', 'INTC': 'Technology',
              'JPM': 'Finance', 'V': 'Finance', 'MA': 'Finance',
              'JNJ': 'Healthcare', 'UNH': 'Healthcare',
              'AMZN': 'Consumer', 'HD': 'Consumer', 'WMT': 'Consumer', 'DIS': 'Consumer',
              'TSLA': 'Auto', 'META': 'Communications', 'GOOGL': 'Communications', 'NFLX': 'Communications',
              'BA': 'Industrials', 'PG': 'Consumer'
            };

            return {
              symbol: sym,
              name: prof.data.name || `${sym} Inc`,
              price: res.data.price,
              change: res.data.changePercent,
              changeValue: res.data.change,
              volume: Math.floor(Math.random() * 10000000) + 5000000,
              sector: sectorMap[sym] || 'Other'
            };
          } catch {
            return null;
          }
        })
      );
      
      const validQuotes = quotes.filter(q => q !== null);
      
      const sortedByChange = [...validQuotes].sort((a, b) => b.change - a.change);
      const sortedByVolume = [...validQuotes].sort((a, b) => b.volume - a.volume);
      
      setMarketData({
        allQuotes: validQuotes,
        topGainers: sortedByChange.slice(0, 5),
        topDecliners: sortedByChange.slice().reverse().slice(0, 5),
        mostActive: sortedByVolume.slice(0, 5)
      });
      
    } catch (error) {
      console.error('Failed to fetch market data', error);
      toast.error('Failed to load market data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    fetchWatchlist();
  }, []);

  // Debounced Global Search
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await api.get(`/market/search?q=${searchQuery}`);
          setSearchResults(res.data.slice(0, 5));
        } catch (error) {
          console.error("Search failed", error);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectStock = async (symbol) => {
    setSearchResults([]);
    setSearchQuery('');
    setSelectedStock({ symbol, loading: true });
    
    try {
      const quoteRes = await api.get(`/market/quote/${symbol}`);
      const profRes = await api.get(`/market/profile/${symbol}`);
      setSelectedStock({
        symbol,
        price: quoteRes.data.price,
        change: quoteRes.data.changePercent,
        name: profRes.data.name || `${symbol} Inc`,
        high: quoteRes.data.high,
        low: quoteRes.data.low,
        open: quoteRes.data.open,
        previousClose: quoteRes.data.previousClose,
        loading: false
      });
    } catch (error) {
      toast.error("Failed to fetch quote details");
      setSelectedStock(null);
    }
  };

  const toggleWatchlist = async (symbol) => {
    if (!activeWatchlistId) {
      toast.error("No active watchlist found");
      return;
    }
    try {
      if (watchlistSymbols.has(symbol)) {
        await api.delete(`/watchlist/${activeWatchlistId}/${symbol}`);
        setWatchlistSymbols(prev => {
          const next = new Set(prev);
          next.delete(symbol);
          return next;
        });
        toast.success(`Removed ${symbol} from watchlist`);
      } else {
        await api.post(`/watchlist/${activeWatchlistId}`, { symbol, name: `${symbol} Corp` });
        setWatchlistSymbols(prev => {
          const next = new Set(prev);
          next.add(symbol);
          return next;
        });
        toast.success(`Added ${symbol} to watchlist`);
      }
    } catch (error) {
      toast.error("Failed to update watchlist");
    }
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Table Data Processing
  const filteredTableData = useMemo(() => {
    return marketData.allQuotes.filter(q => 
      q.symbol.toLowerCase().includes(tableSearch.toLowerCase()) || 
      q.name.toLowerCase().includes(tableSearch.toLowerCase())
    );
  }, [marketData.allQuotes, tableSearch]);

  const sortedTableData = useMemo(() => {
    const sorted = [...filteredTableData];
    sorted.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredTableData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return sortedTableData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTableData, page]);

  const totalPages = Math.ceil(sortedTableData.length / itemsPerPage);

  // Chart Data Processing
  const sentimentData = useMemo(() => {
    let pos = 0, neg = 0, neu = 0;
    marketData.allQuotes.forEach(q => {
      if (q.change > 0.1) pos++;
      else if (q.change < -0.1) neg++;
      else neu++;
    });
    return [
      { name: 'Positive', value: pos },
      { name: 'Negative', value: neg },
      { name: 'Neutral', value: neu }
    ];
  }, [marketData.allQuotes]);

  const sectorData = useMemo(() => {
    const counts = {};
    marketData.allQuotes.forEach(q => {
      counts[q.sector] = (counts[q.sector] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  }, [marketData.allQuotes]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 bg-[var(--bg-secondary)] rounded-xl"></div>
        <div className="grid grid-cols-4 gap-4"><div className="h-24 bg-[var(--bg-secondary)] rounded-xl"></div><div className="h-24 bg-[var(--bg-secondary)] rounded-xl"></div><div className="h-24 bg-[var(--bg-secondary)] rounded-xl"></div><div className="h-24 bg-[var(--bg-secondary)] rounded-xl"></div></div>
        <div className="h-96 bg-[var(--bg-secondary)] rounded-xl"></div>
      </div>
    );
  }

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-1" /> : <ArrowDown className="w-3 h-3 inline ml-1" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      
      {/* Header & Global Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Globe className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Market Dashboard</h1>
            <p className="text-[var(--text-muted)] text-sm">Real-time market insights and trends</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search symbols..." 
              className="input-field pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 overflow-hidden">
                {searchResults.map(result => (
                  <div 
                    key={result.symbol} 
                    onClick={() => handleSelectStock(result.symbol)}
                    className="p-3 border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-main)] cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">{result.symbol}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">{result.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => fetchMarketData(true)} 
            disabled={refreshing}
            className="btn-secondary p-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. Top Row Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="clean-card p-4 flex flex-col justify-center">
          <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider mb-1">Tracked Assets</p>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold">{marketData.allQuotes.length}</span>
          </div>
        </div>
        <div className="clean-card p-4 flex flex-col justify-center">
          <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider mb-1">Market Status</p>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            <span className="text-xl font-bold text-emerald-500">OPEN</span>
          </div>
        </div>
        <div className="clean-card p-4 flex flex-col justify-center cursor-pointer hover:border-[var(--color-profit)] transition-colors" onClick={() => handleSelectStock(marketData.topGainers[0]?.symbol)}>
          <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider mb-1">Top Gainer</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">{marketData.topGainers[0]?.symbol || '-'}</span>
            <span className="text-sm text-[var(--color-profit)] font-semibold">+{marketData.topGainers[0]?.change?.toFixed(2)}%</span>
          </div>
        </div>
        <div className="clean-card p-4 flex flex-col justify-center cursor-pointer hover:border-[var(--color-loss)] transition-colors" onClick={() => handleSelectStock(marketData.topDecliners[0]?.symbol)}>
          <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider mb-1">Top Decliner</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">{marketData.topDecliners[0]?.symbol || '-'}</span>
            <span className="text-sm text-[var(--color-loss)] font-semibold">{marketData.topDecliners[0]?.change?.toFixed(2)}%</span>
          </div>
        </div>
        <div className="clean-card p-4 flex flex-col justify-center cursor-pointer hover:border-blue-500 transition-colors" onClick={() => handleSelectStock(marketData.mostActive[0]?.symbol)}>
          <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider mb-1">Most Active</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">{marketData.mostActive[0]?.symbol || '-'}</span>
            <span className="text-xs text-[var(--text-muted)]">{(marketData.mostActive[0]?.volume / 1000000).toFixed(1)}M Vol</span>
          </div>
        </div>
      </div>

      {/* 2. Market Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="clean-card p-6 flex flex-col h-[350px]">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-emerald-500" /> Market Sentiment
          </h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={sentimentData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {sentimentData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm font-semibold">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        <div className="clean-card p-6 flex flex-col h-[350px]">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-blue-500" /> Sector Distribution
          </h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'var(--bg-main)'}} contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Trending Stocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gainers */}
        <div className="clean-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[var(--color-profit)]" />
            <h2 className="text-lg font-bold">Top Gainers</h2>
          </div>
          <div className="space-y-4">
            {marketData.topGainers.map(stock => (
              <div key={stock.symbol} onClick={() => handleSelectStock(stock.symbol)} className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-[var(--bg-main)] -mx-2 px-2 rounded transition-colors">
                <div>
                  <h3 className="font-bold">{stock.symbol}</h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-[100px] truncate">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${stock.price.toFixed(2)}</p>
                  <p className="text-sm text-[var(--color-profit)] font-bold">+{stock.change.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decliners */}
        <div className="clean-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-[var(--color-loss)]" />
            <h2 className="text-lg font-bold">Top Decliners</h2>
          </div>
          <div className="space-y-4">
            {marketData.topDecliners.map(stock => (
              <div key={stock.symbol} onClick={() => handleSelectStock(stock.symbol)} className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-[var(--bg-main)] -mx-2 px-2 rounded transition-colors">
                <div>
                  <h3 className="font-bold">{stock.symbol}</h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-[100px] truncate">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${stock.price.toFixed(2)}</p>
                  <p className="text-sm text-[var(--color-loss)] font-bold">{stock.change.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active */}
        <div className="clean-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold">Most Active</h2>
          </div>
          <div className="space-y-4">
            {marketData.mostActive.map(stock => (
              <div key={stock.symbol} onClick={() => handleSelectStock(stock.symbol)} className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-[var(--bg-main)] -mx-2 px-2 rounded transition-colors">
                <div>
                  <h3 className="font-bold">{stock.symbol}</h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-[100px] truncate">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${stock.price.toFixed(2)}</p>
                  <p className="text-xs text-[var(--text-muted)] font-semibold">{(stock.volume / 1000000).toFixed(1)}M Vol</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Live Market Data Table */}
      <div className="clean-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-main)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" /> Live Market Data
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Filter table..." 
              className="input-field pl-9 py-1.5 text-sm"
              value={tableSearch}
              onChange={(e) => { setTableSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
                <th className="p-4 font-bold cursor-pointer hover:text-white" onClick={() => handleSort('symbol')}>Symbol <SortIcon column="symbol" /></th>
                <th className="p-4 font-bold cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Company <SortIcon column="name" /></th>
                <th className="p-4 font-bold cursor-pointer hover:text-white text-right" onClick={() => handleSort('price')}>Price <SortIcon column="price" /></th>
                <th className="p-4 font-bold cursor-pointer hover:text-white text-right" onClick={() => handleSort('changeValue')}>Change <SortIcon column="changeValue" /></th>
                <th className="p-4 font-bold cursor-pointer hover:text-white text-right" onClick={() => handleSort('change')}>Change % <SortIcon column="change" /></th>
                <th className="p-4 font-bold cursor-pointer hover:text-white text-right" onClick={() => handleSort('volume')}>Volume <SortIcon column="volume" /></th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((stock) => {
                const isPositive = stock.change >= 0;
                return (
                  <tr key={stock.symbol} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-colors text-sm">
                    <td className="p-4 font-bold">{stock.symbol}</td>
                    <td className="p-4 text-[var(--text-muted)] max-w-[150px] truncate">{stock.name}</td>
                    <td className="p-4 font-semibold text-right font-mono">${stock.price.toFixed(2)}</td>
                    <td className={`p-4 text-right font-semibold ${isPositive ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                      {isPositive ? '+' : ''}{stock.changeValue?.toFixed(2)}
                    </td>
                    <td className={`p-4 text-right font-bold ${isPositive ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}`}>
                      {isPositive ? '+' : ''}{stock.change?.toFixed(2)}%
                    </td>
                    <td className="p-4 text-right text-[var(--text-muted)]">{(stock.volume / 1000000).toFixed(2)}M</td>
                    <td className="p-4 text-center">
                      <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded text-xs font-bold">OPEN</span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleSelectStock(stock.symbol)}
                        className="text-[var(--color-brand-primary)] font-bold hover:underline"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {paginatedData.length === 0 && (
            <div className="text-center py-8 text-[var(--text-muted)]">No stocks found matching your filter.</div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)] bg-[var(--bg-main)]">
            <span className="text-sm text-[var(--text-muted)]">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-[var(--bg-secondary)] disabled:opacity-50 text-[var(--text-main)]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1 rounded hover:bg-[var(--bg-secondary)] disabled:opacity-50 text-[var(--text-main)]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Stock Details Modal */}
      {selectedStock && !selectedStock.loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-main)] relative">
              <button 
                onClick={() => setSelectedStock(null)}
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors bg-[var(--bg-secondary)] p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-3xl font-bold">{selectedStock.symbol}</h2>
                  <p className="text-[var(--text-muted)] max-w-[200px] truncate">{selectedStock.name}</p>
                </div>
                <button 
                  onClick={() => toggleWatchlist(selectedStock.symbol)}
                  className="mr-8 p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] transition-colors"
                  title={watchlistSymbols.has(selectedStock.symbol) ? "Remove from Watchlist" : "Add to Watchlist"}
                >
                  {watchlistSymbols.has(selectedStock.symbol) 
                    ? <BookmarkCheck className="w-6 h-6 text-[var(--color-brand-primary)]" />
                    : <Bookmark className="w-6 h-6 text-[var(--text-muted)]" />
                  }
                </button>
              </div>
              
              <div className="flex items-end gap-3 mt-4">
                <p className="text-4xl font-bold font-mono">${selectedStock.price?.toFixed(2)}</p>
                <div className={`flex items-center gap-1 font-semibold text-lg pb-1 ${
                  selectedStock.change >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'
                }`}>
                  {selectedStock.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <span>{selectedStock.change >= 0 ? '+' : ''}{selectedStock.change?.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6 bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-color)]">
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">Day High</p>
                  <p className="font-bold">${selectedStock.high?.toFixed(2) || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">Day Low</p>
                  <p className="font-bold">${selectedStock.low?.toFixed(2) || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">Open</p>
                  <p className="font-bold">${selectedStock.open?.toFixed(2) || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">Prev Close</p>
                  <p className="font-bold">${selectedStock.previousClose?.toFixed(2) || '-'}</p>
                </div>
              </div>

              <button 
                onClick={() => setShowTradeModal(true)}
                className="w-full btn-primary py-4 font-bold text-xl flex justify-center items-center gap-2 rounded-xl shadow-lg shadow-pink-500/20"
              >
                Trade {selectedStock.symbol}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Modal (Nested logic handled in component) */}
      {showTradeModal && selectedStock && (
        <TradeModal 
          isOpen={showTradeModal} 
          onClose={() => setShowTradeModal(false)} 
          symbol={selectedStock.symbol} 
          currentPrice={selectedStock.price}
        />
      )}
    </div>
  );
}
