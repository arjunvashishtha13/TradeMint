import { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '' });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to fetch goals', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', { ...newGoal, targetAmount: Number(newGoal.targetAmount) });
      setIsAdding(false);
      setNewGoal({ name: '', targetAmount: '', deadline: '' });
      fetchGoals();
    } catch (error) {
      console.error('Failed to create goal', error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading Goals...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-[var(--color-brand-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Investment Goals</h1>
            <p className="text-[var(--text-muted)] text-sm">Set targets and track your progress</p>
          </div>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="clean-card p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Goal Name</label>
              <input type="text" className="input-field" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} required placeholder="e.g. Dream House Downpayment" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Target Amount ($)</label>
              <input type="number" min="0" className="input-field" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} required placeholder="50000" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Deadline (Optional)</label>
              <input type="date" className="input-field" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Goal</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full text-center py-10 text-[var(--text-muted)]">No goals set yet. Start planning!</div>
        ) : (
          goals.map(goal => {
            const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            return (
              <div key={goal._id} className="clean-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">{goal.name}</h3>
                    {goal.isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-[var(--color-profit)]" />
                    ) : (
                      <Clock className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-muted)]">Progress</span>
                    <span className="font-bold">{progress.toFixed(1)}%</span>
                  </div>
                  
                  {/* Milestones Tracker */}
                  <div className="w-full relative mb-4">
                    <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1 px-1">
                      <span className={progress >= 0 ? 'text-[var(--color-brand-primary)] font-bold' : ''}>0%</span>
                      <span className={progress >= 25 ? 'text-[var(--color-brand-primary)] font-bold' : ''}>25%</span>
                      <span className={progress >= 50 ? 'text-[var(--color-brand-primary)] font-bold' : ''}>50%</span>
                      <span className={progress >= 75 ? 'text-[var(--color-brand-primary)] font-bold' : ''}>75%</span>
                      <span className={progress >= 100 ? 'text-[var(--color-profit)] font-bold' : ''}>100%</span>
                    </div>
                    
                    <div className="w-full bg-[var(--bg-main)] rounded-full h-2 border border-[var(--border-color)] relative overflow-hidden">
                      {/* Milestone Markers */}
                      <div className="absolute left-[25%] top-0 bottom-0 w-px bg-[var(--border-color)] z-10"></div>
                      <div className="absolute left-[50%] top-0 bottom-0 w-px bg-[var(--border-color)] z-10"></div>
                      <div className="absolute left-[75%] top-0 bottom-0 w-px bg-[var(--border-color)] z-10"></div>
                      
                      {/* Fill */}
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 relative z-0 ${progress >= 100 ? 'bg-[var(--color-profit)]' : 'bg-[var(--color-brand-primary)]'}`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">Current</p>
                      <p className="font-semibold text-[var(--text-main)]">${goal.currentAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--text-muted)]">Target</p>
                      <p className="font-semibold text-[var(--text-main)]">${goal.targetAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                {goal.deadline && (
                  <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
