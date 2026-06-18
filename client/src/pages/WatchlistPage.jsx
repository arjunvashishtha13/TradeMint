import { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp, TrendingDown, X, Eye, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState('All');
  const [loading, setLoading] = useState(true);

  // For Modals/Prompts
  const [isCreating, setIsCreating] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const [searchResults, setSearchResults] = useState([]);

  const activeWatchlist = watchlists.find(w => w._id === activeWatchlistId);

  const fetchWatchlists = async () => {
    try {
      const response = await api.get('/watchlist');
      const data = response.data;
      if (data.length > 0) {
        // Fetch real prices for visual representation
        const withPrices = await Promise.all(data.map(async (wl) => {
          const symbolsWithQuotes = await Promise.all((wl.symbols || []).map(async (s) => {
            try {
              const quoteRes = await api.get(`/market/quote/${s.symbol}`);
              const profileRes = await api.get(`/market/profile/${s.symbol}`);
              return {
                ...s,
                price: quoteRes.data.price,
                change: quoteRes.data.changePercent,
                sector: profileRes.data.finnhubIndustry || 'General'
              };
            } catch (err) {
              return {
                ...s,
                price: 0,
                change: 0,
                sector: 'General'
              };
            }
          }));
          return { ...wl, symbols: symbolsWithQuotes };
        }));
        
        setWatchlists(withPrices);
        if (!activeWatchlistId) setActiveWatchlistId(withPrices[0]._id);
      } else {
        setWatchlists([]);
      }
    } catch (error) {
      console.error('Failed to fetch watchlists', error);
      toast.error('Failed to load watchlists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, []);

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

  const createWatchlist = async () => {
    if (!newWatchlistName.trim()) return;
    try {
      const res = await api.post('/watchlist/create', { name: newWatchlistName });
      await fetchWatchlists();
      setActiveWatchlistId(res.data._id);
      setIsCreating(false);
      setNewWatchlistName('');
      toast.success('Watchlist created');
    } catch (error) {
      toast.error('Failed to create watchlist');
    }
  };

  const deleteWatchlist = async () => {
    if (!activeWatchlistId) return;
    if (!window.confirm('Are you sure you want to delete this watchlist?')) return;
    try {
      await api.delete(`/watchlist/delete/${activeWatchlistId}`);
      toast.success('Watchlist deleted');
      setActiveWatchlistId(''); // Will reset on fetch
      await fetchWatchlists();
    } catch (error) {
      toast.error('Failed to delete watchlist');
    }
  };

  const renameWatchlist = async () => {
    if (!renameValue.trim() || !activeWatchlistId) return;
    try {
      await api.put(`/watchlist/rename/${activeWatchlistId}`, { name: renameValue });
      await fetchWatchlists();
      setIsRenaming(false);
      toast.success('Watchlist renamed');
    } catch (error) {
      toast.error('Failed to rename watchlist');
    }
  };

  const handleAddStock = async (symbolToAdd) => {
    if (!activeWatchlistId) return;
    
    const newStockSymbol = symbolToAdd.toUpperCase();
    if (activeWatchlist?.symbols.find(s => s.symbol === newStockSymbol)) {
      toast.error(`${newStockSymbol} is already in watchlist`);
      return;
    }

    try {
      await api.post(`/watchlist/${activeWatchlistId}`, { symbol: newStockSymbol, name: `${newStockSymbol} Corp` });
      toast.success(`${newStockSymbol} added to watchlist`);
      await fetchWatchlists();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add stock');
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const addStockFormSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    handleAddStock(searchQuery);
  };

  const removeStock = async (symbol) => {
    if (!activeWatchlistId) return;
    try {
      await api.delete(`/watchlist/${activeWatchlistId}/${symbol}`);
      toast.success(`${symbol} removed from watchlist`);
      await fetchWatchlists();
    } catch (error) {
      toast.error('Failed to remove stock');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading Watchlists...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          <select 
            className="input-field py-2 w-auto font-bold text-lg"
            value={activeWatchlistId}
            onChange={(e) => setActiveWatchlistId(e.target.value)}
          >
            {watchlists.map(w => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </select>

          <button onClick={() => setIsCreating(true)} className="p-2 text-[var(--text-muted)] hover:text-[var(--color-brand-primary)] bg-[var(--bg-main)] rounded border border-[var(--border-color)]" title="Create Watchlist">
            <Plus className="w-5 h-5" />
          </button>
          {activeWatchlist && (
            <>
              <button onClick={() => { setIsRenaming(true); setRenameValue(activeWatchlist.name); }} className="p-2 text-[var(--text-muted)] hover:text-blue-500 bg-[var(--bg-main)] rounded border border-[var(--border-color)]" title="Rename Watchlist">
                <Edit2 className="w-5 h-5" />
              </button>
              <button onClick={deleteWatchlist} className="p-2 text-[var(--text-muted)] hover:text-[var(--color-loss)] bg-[var(--bg-main)] rounded border border-[var(--border-color)]" title="Delete Watchlist">
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select 
            className="input-field py-2 w-40"
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
          >
            <option value="All">All Sectors</option>
            <option value="Technology">Technology</option>
            <option value="Financials">Financials</option>
            <option value="Energy">Energy</option>
            <option value="Healthcare">Healthcare</option>
          </select>
        </div>
      </div>

      {/* Inline Forms */}
      {isCreating && (
        <div className="flex items-center gap-2 clean-card p-4">
          <input 
            autoFocus
            type="text" 
            placeholder="New Watchlist Name" 
            className="input-field py-2" 
            value={newWatchlistName} 
            onChange={e => setNewWatchlistName(e.target.value)}
          />
          <button onClick={createWatchlist} className="btn-primary py-2">Create</button>
          <button onClick={() => setIsCreating(false)} className="btn-secondary py-2">Cancel</button>
        </div>
      )}

      {isRenaming && (
        <div className="flex items-center gap-2 clean-card p-4">
          <input 
            autoFocus
            type="text" 
            className="input-field py-2" 
            value={renameValue} 
            onChange={e => setRenameValue(e.target.value)}
          />
          <button onClick={renameWatchlist} className="btn-primary py-2">Save</button>
          <button onClick={() => setIsRenaming(false)} className="btn-secondary py-2">Cancel</button>
        </div>
      )}

      {/* Search Bar */}
      {activeWatchlist && (
        <div className="relative">
          <form onSubmit={addStockFormSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies to add..."
              className="input-field pl-12 pr-12"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-primary)] hover:text-[var(--color-brand-hover)] transition-colors p-1"
            >
              <Plus className="w-6 h-6" />
            </button>
          </form>
          
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 overflow-hidden">
              {searchResults.map(result => (
                <div 
                  key={result.symbol} 
                  onClick={() => handleAddStock(result.symbol)}
                  className="p-3 border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-main)] cursor-pointer flex justify-between items-center transition-colors"
                >
                  <div>
                    <p className="font-bold">{result.symbol}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">{result.description}</p>
                  </div>
                  <button className="btn-primary py-1 px-3 text-xs flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      {activeWatchlist ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeWatchlist.symbols.filter(s => filterSector === 'All' || s.sector === filterSector).map((stock) => {
            const isUp = stock.change >= 0;
            return (
              <div key={stock.symbol} className="clean-card p-5 group flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{stock.symbol}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{stock.name}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-500/10 text-gray-500">
                      {stock.sector}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeStock(stock.symbol)}
                    className="p-1 text-gray-500 hover:text-[var(--color-loss)] transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove from watchlist"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-end justify-between mt-auto">
                  <p className="text-2xl font-bold font-mono">
                    ${stock.price.toFixed(2)}
                  </p>
                  <div className={`flex items-center gap-1 font-semibold ${
                    isUp ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'
                  }`}>
                    {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{isUp ? '+' : ''}{stock.change.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 clean-card">
          <Eye className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No Watchlists Found</h3>
          <p className="text-[var(--text-muted)] mt-1">Create a new watchlist to start tracking stocks</p>
          <button onClick={() => setIsCreating(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Watchlist
          </button>
        </div>
      )}
      
      {activeWatchlist && activeWatchlist.symbols.length === 0 && (
        <div className="text-center py-20 clean-card">
          <Eye className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">This watchlist is empty</h3>
          <p className="text-[var(--text-muted)] mt-1">Search for a stock symbol to add it here</p>
        </div>
      )}
    </div>
  );
}
