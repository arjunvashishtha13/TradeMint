import { useState, useEffect } from 'react';
import { BookOpen, Plus, Save } from 'lucide-react';
import api from '../services/api';

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({ symbol: '', type: 'NOTE', notes: '', reason: '' });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('/journal');
      setEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch journal entries', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/journal', newEntry);
      setIsAdding(false);
      setNewEntry({ symbol: '', type: 'NOTE', notes: '', reason: '' });
      fetchEntries();
    } catch (error) {
      console.error('Failed to create entry', error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading Journal...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[var(--color-brand-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Trading Journal</h1>
            <p className="text-[var(--text-muted)] text-sm">Document your thought process and review performance</p>
          </div>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="clean-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Symbol (Optional)</label>
              <input type="text" className="input-field" value={newEntry.symbol} onChange={e => setNewEntry({...newEntry, symbol: e.target.value})} placeholder="e.g. AAPL" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Type</label>
              <select className="input-field" value={newEntry.type} onChange={e => setNewEntry({...newEntry, type: e.target.value})}>
                <option value="NOTE">General Note</option>
                <option value="BUY">Buy Strategy</option>
                <option value="SELL">Sell Strategy</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Notes</label>
            <textarea className="input-field min-h-[100px]" value={newEntry.notes} onChange={e => setNewEntry({...newEntry, notes: e.target.value})} required placeholder="What are you thinking?"></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Reason / Catalyst</label>
            <input type="text" className="input-field" value={newEntry.reason} onChange={e => setNewEntry({...newEntry, reason: e.target.value})} placeholder="Earnings report, technical breakout, etc." />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save Entry</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)]">No journal entries yet.</div>
        ) : (
          entries.map(entry => (
            <div key={entry._id} className="clean-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    entry.type === 'BUY' ? 'bg-emerald-500/20 text-[var(--color-profit)]' : 
                    entry.type === 'SELL' ? 'bg-red-500/20 text-[var(--color-loss)]' : 
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {entry.type}
                  </span>
                  {entry.symbol && <span className="font-bold">{entry.symbol}</span>}
                </div>
                <span className="text-xs text-[var(--text-muted)]">{new Date(entry.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-[var(--text-main)] whitespace-pre-wrap">{entry.notes}</p>
              {entry.reason && (
                <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                  <p className="text-sm"><span className="font-semibold text-[var(--text-muted)]">Reason:</span> {entry.reason}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
