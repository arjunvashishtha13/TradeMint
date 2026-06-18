import { useState, useEffect } from 'react';
import { History, Filter, Download, Search, ChevronLeft, ChevronRight, Edit3, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  
  // Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Note Editing State
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [reasonText, setReasonText] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        order,
      });
      if (searchQuery) queryParams.append('search', searchQuery);

      const response = await api.get(`/transactions?${queryParams.toString()}`);
      setTransactions(response.data.transactions || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, sortBy, order, searchQuery]); // Re-fetch when these change

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setOrder('desc');
    }
    setPage(1);
  };

  const saveNotes = async (id) => {
    try {
      await api.put(`/transactions/${id}/notes`, { notes: noteText, reason: reasonText });
      toast.success('Trade notes saved');
      setEditingNoteId(null);
      await fetchTransactions(); // Refresh
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const filteredTx = filter === 'ALL' 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);

  const exportCSV = () => {
    const headers = ['Transaction ID,Date,Asset,Type,Quantity,Price,Total,Reason,Notes'];
    const csvContent = headers.concat(
      filteredTx.map(tx => {
        return `${tx._id},${new Date(tx.createdAt).toLocaleString()},${tx.symbol},${tx.type},${tx.quantity},${tx.price},${tx.quantity * tx.price},"${tx.reason || ''}","${tx.notes || ''}"`;
      })
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return order === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-1" /> : <ArrowDown className="w-3 h-3 inline ml-1" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Transaction Center</h1>
          <p className="text-[var(--text-muted)] text-sm">Detailed history with notes and pagination</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search symbol..."
              className="input-field pl-9 py-1.5 text-sm"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[var(--text-muted)] mr-1" />
            {['ALL', 'BUY', 'SELL'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  filter === type 
                    ? 'bg-[var(--color-brand-primary)] text-white' 
                    : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 py-1.5 text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="clean-card overflow-hidden">
        {loading && transactions.length === 0 ? (
          <div className="text-center py-10">Loading Transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                  <th className="p-4 font-semibold text-sm cursor-pointer" onClick={() => handleSort('createdAt')}>Date & Time <SortIcon column="createdAt" /></th>
                  <th className="p-4 font-semibold text-sm cursor-pointer" onClick={() => handleSort('symbol')}>Asset <SortIcon column="symbol" /></th>
                  <th className="p-4 font-semibold text-sm cursor-pointer" onClick={() => handleSort('type')}>Type <SortIcon column="type" /></th>
                  <th className="p-4 font-semibold text-sm text-right cursor-pointer" onClick={() => handleSort('quantity')}>Quantity <SortIcon column="quantity" /></th>
                  <th className="p-4 font-semibold text-sm text-right cursor-pointer" onClick={() => handleSort('price')}>Price <SortIcon column="price" /></th>
                  <th className="p-4 font-semibold text-sm text-right">Total</th>
                  <th className="p-4 font-semibold text-sm text-center">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((tx) => (
                  <tr key={tx._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-colors text-sm">
                    <td className="p-4">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-bold">{tx.symbol}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        tx.type === 'BUY' 
                          ? 'bg-emerald-500/10 text-[var(--color-profit)]' 
                          : 'bg-red-500/10 text-[var(--color-loss)]'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 text-right">{tx.quantity}</td>
                    <td className="p-4 text-right">${tx.price.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold">${(tx.quantity * tx.price).toFixed(2)}</td>
                    <td className="p-4 text-center">
                      {editingNoteId === tx._id ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <input 
                            type="text" 
                            placeholder="Reason for trade..." 
                            className="input-field py-1 text-xs" 
                            value={reasonText} 
                            onChange={(e) => setReasonText(e.target.value)} 
                          />
                          <textarea 
                            placeholder="Detailed notes..." 
                            className="input-field py-1 text-xs resize-none" 
                            value={noteText} 
                            onChange={(e) => setNoteText(e.target.value)} 
                            rows={2} 
                          />
                          <div className="flex gap-2">
                            <button onClick={() => saveNotes(tx._id)} className="btn-primary py-1 px-2 text-xs flex-1">Save</button>
                            <button onClick={() => setEditingNoteId(null)} className="btn-secondary py-1 px-2 text-xs flex-1">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center justify-center gap-2 cursor-pointer text-[var(--text-muted)] hover:text-[var(--color-brand-primary)]"
                          onClick={() => {
                            setEditingNoteId(tx._id);
                            setNoteText(tx.notes || '');
                            setReasonText(tx.reason || '');
                          }}
                        >
                          {(tx.notes || tx.reason) ? (
                            <span className="truncate max-w-[150px] text-xs bg-[var(--bg-secondary)] px-2 py-1 rounded border border-[var(--border-color)]" title={`${tx.reason}\n${tx.notes}`}>
                              {tx.reason || 'View Note'}
                            </span>
                          ) : (
                            <Edit3 className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTx.length === 0 && !loading && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
                <p className="text-[var(--text-muted)]">No transactions found for this filter.</p>
              </div>
            )}
          </div>
        )}

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
    </div>
  );
}
