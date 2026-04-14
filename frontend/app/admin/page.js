'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, MinusCircle, User, DollarSign, Loader2, History, Package } from 'lucide-react';

export default function AdminDashboard() {
  const [formData, setFormData] = useState({ client_id: '', amount: '' });
  const [activities, setActivities] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/activities');
      setActivities(res.data);
    } catch (err) {
      console.error('Failed to fetch admin activities', err);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action) => {
    if (!formData.client_id || !formData.amount) {
      setStatus({ type: 'error', message: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const endpoint = action === 'credit' ? '/admin/wallet/credit' : '/admin/wallet/debit';
      const res = await axios.post(`http://localhost:5000${endpoint}`, {
        client_id: formData.client_id,
        amount: parseFloat(formData.amount)
      });
      
      setStatus({ 
        type: 'success', 
        message: `${action === 'credit' ? 'Credited' : 'Debited'} successfully. New balance: $${res.data.balance}` 
      });
      setFormData({ ...formData, amount: '' });
      fetchActivities(); // Immediate refresh
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.error || 'Something went wrong' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <p className="text-foreground/60">Manage client wallet balances and transactions.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="glass p-8 space-y-6 self-start">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <User size={24} />
            </div>
            <h2 className="text-xl font-semibold">Wallet Actions</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">Client ID</label>
              <input 
                type="text"
                placeholder="e.g. client_01"
                className="w-full bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">Amount ($)</label>
              <input 
                type="number"
                placeholder="0.00"
                className="w-full bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button 
                onClick={() => handleAction('credit')}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} />}
                Credit
              </button>
              <button 
                onClick={() => handleAction('debit')}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <MinusCircle size={20} />}
                Debit
              </button>
            </div>
          </div>

          {status.message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl text-center font-medium ${
                status.type === 'success' ? 'bg-accent/20 text-accent border border-accent/20' : 'bg-red-500/20 text-red-500 border border-red-500/10'
              }`}
            >
              {status.message}
            </motion.div>
          )}
        </section>

        {/* Transaction History Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-foreground/80">
              <History size={20} />
              <h2 className="text-xl font-bold">System Transactions</h2>
            </div>
            <div className="text-[10px] text-foreground/40 bg-white/5 px-2 py-1 rounded truncate">
              Live Feed (Last 50)
            </div>
          </div>
          
          <div className="glass overflow-hidden border-white/5 flex flex-col min-h-[400px]">
            {activities.length > 0 ? (
              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                {activities.map((activity, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    key={activity._id} 
                    className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'credit' ? 'bg-accent/20 text-accent' : 
                        activity.type === 'debit' ? 'bg-red-500/20 text-red-500' : 
                        'bg-primary/20 text-primary'
                      }`}>
                        {activity.type === 'credit' ? <PlusCircle size={16} /> : 
                         activity.type === 'debit' ? <MinusCircle size={16} /> : 
                         <Package size={16} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm tracking-tight truncate max-w-[100px]">{activity.clientId}</p>
                          <span className="text-[9px] text-foreground/30 uppercase font-black whitespace-nowrap">{activity.type.replace('_', ' ')}</span>
                        </div>
                        <p className="text-[9px] text-foreground/40">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`font-mono font-bold text-sm shrink-0 ${
                      activity.type === 'credit' ? 'text-accent' : 'text-red-500'
                    }`}>
                      {activity.type === 'credit' ? '+' : '-'}${activity.amount.toFixed(2)}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                <div className="bg-white/5 p-4 rounded-full text-foreground/20">
                  <History size={32} />
                </div>
                <p className="text-xs text-foreground/40 italic">
                  No system transactions recorded.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
