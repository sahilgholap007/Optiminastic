'use client';
import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PlusCircle, MinusCircle, User, DollarSign, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [formData, setFormData] = useState({ client_id: '', amount: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

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

      <div className="grid md:grid-cols-2 gap-8">
        <section className="glass p-8 space-y-6">
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

        <aside className="glass p-8 flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse-slow">
            <DollarSign size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Ledger Guidelines</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Credits add funds instantly. Debits require the client to have a sufficient balance. All actions are logged in the transaction ledger for audit purposes.
            </p>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
