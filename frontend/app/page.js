'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw,
  Package,
  ExternalLink,
  History,
  PlusCircle,
  MinusCircle
} from 'lucide-react';

export default function ClientDashboard() {
  const [clientId, setClientId] = useState('');
  const [balance, setBalance] = useState(null);
  const [orderAmount, setOrderAmount] = useState('');
  const [recentOrder, setRecentOrder] = useState(null);
  const [activities, setActivities] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBalance = async (id = clientId) => {
    if (!id) return;
    try {
      const balanceRes = await axios.get('http://localhost:5000/wallet/balance', {
        headers: { 'client-id': id }
      });
      setBalance(balanceRes.data.balance);
      
      const activityRes = await axios.get('http://localhost:5000/activities', {
        headers: { 'client-id': id }
      });
      setActivities(activityRes.data);

      const ordersRes = await axios.get('http://localhost:5000/orders', {
        headers: { 'client-id': id }
      });
      setOrders(ordersRes.data);
      
      setError('');
    } catch (err) {
      setError('Could not fetch data. Check Client ID.');
    }
  };

  const createOrder = async () => {
    if (!clientId || !orderAmount) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/orders', 
        { amount: parseFloat(orderAmount) },
        { headers: { 'client-id': clientId } }
      );
      setRecentOrder(res.data);
      setOrderAmount('');
      fetchBalance(clientId);
    } catch (err) {
      setError(err.response?.data?.error || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-foreground/60">Manage your wallet and place new orders.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-xl border border-white/5">
          <input 
            type="text"
            placeholder="Enter Client ID"
            className="bg-transparent px-4 py-2 text-sm focus:outline-none w-32 md:w-48"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
          <button 
            onClick={() => fetchBalance()}
            className="bg-primary hover:bg-primary/80 p-2 rounded-lg transition-colors"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Wallet Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass p-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-foreground/60 font-medium">Available Balance</h2>
            <div className="text-5xl font-bold tracking-tighter">
              {balance !== null ? `$${balance.toFixed(2)}` : '----'}
            </div>
            <p className="text-xs text-foreground/40 uppercase tracking-widest font-bold">Secure Global Wallet</p>
          </div>
        </motion.div>

        {/* Create Order Card */}
        <div className="lg:col-span-2 glass p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <ShoppingBag size={24} />
            </div>
            <h2 className="text-xl font-semibold">Place New Order</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-foreground/70">Order Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40">$</span>
                <input 
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-secondary/50 border border-white/10 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-end">
              <button 
                onClick={createOrder}
                disabled={loading || !clientId}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 h-[50px]"
              >
                {loading ? <RefreshCcw className="animate-spin" /> : <>Confirm Order <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-sm font-medium">
              <XCircle size={16} /> {error}
            </div>
          )}
        </div>
      </div>

      {/* Recent Order Status */}
      <AnimatePresence>
        {recentOrder && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass p-8 border-accent/20 bg-accent/5"
          >
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/20 p-2 rounded-lg text-accent">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Order Placed Successfully</h3>
                    <p className="text-sm text-foreground/60">ID: {recentOrder._id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                  <div>
                    <p className="text-xs text-foreground/40 uppercase font-bold">Fulfillment ID</p>
                    <p className="font-mono text-accent">#{recentOrder.fulfillmentId || 'Pending'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/40 uppercase font-bold">Amount Paid</p>
                    <p className="font-semibold">${recentOrder.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/40 uppercase font-bold">Status</p>
                    <div className="flex items-center gap-1.5 text-accent text-sm font-bold">
                      <Package size={14} /> {recentOrder.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <a 
                  href={`https://jsonplaceholder.typicode.com/posts/${recentOrder.fulfillmentId}`}
                  target="_blank"
                  className="flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors bg-white/5 py-2 px-4 rounded-lg border border-white/5"
                >
                  View Fulfillment Receipt <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-foreground/80">
            <History size={20} />
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="glass overflow-hidden border-white/5 h-[400px] overflow-y-auto custom-scrollbar">
            {activities.length > 0 ? (
              <div className="divide-y divide-white/5 text-nowrap">
                {activities.map((activity, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={activity._id} 
                    className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'credit' ? 'bg-accent/20 text-accent' : 
                        activity.type === 'debit' ? 'bg-red-500/20 text-red-500' : 
                        'bg-primary/20 text-primary'
                      }`}>
                        {activity.type === 'credit' ? <PlusCircle size={18} /> : 
                         activity.type === 'debit' ? <MinusCircle size={18} /> : 
                         <Package size={18} />}
                      </div>
                      <div>
                        <p className="font-medium capitalize text-sm">
                          {activity.type.replace('_', ' ')}
                        </p>
                        <p className="text-[10px] text-foreground/40">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold text-sm ${
                      activity.type === 'credit' ? 'text-accent' : 'text-red-500'
                    }`}>
                      {activity.type === 'credit' ? '+' : '-'}${activity.amount.toFixed(2)}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-foreground/40 italic text-sm">
                No activity found.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-foreground/80">
            <Package size={20} />
            <h2 className="text-xl font-bold">Your Orders</h2>
          </div>
          <div className="glass overflow-hidden border-white/5 h-[400px] overflow-y-auto custom-scrollbar">
            {orders.length > 0 ? (
              <div className="divide-y divide-white/5">
                {orders.map((order, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={order._id} 
                    className="p-4 hover:bg-white/5 transition-colors space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-foreground/40 font-mono select-all">#{order._id}</p>
                        <p className="text-lg font-bold tracking-tight">${order.amount.toFixed(2)}</p>
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                        order.status === 'fulfilled' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                    
                    {order.fulfillmentId && (
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-[10px] text-foreground/60">
                          <CheckCircle2 size={12} className="text-accent" />
                          <span>Fulfillment: <span className="font-mono text-accent">#{order.fulfillmentId}</span></span>
                        </div>
                        <a 
                          href={`https://jsonplaceholder.typicode.com/posts/${order.fulfillmentId}`}
                          target="_blank"
                          className="text-[10px] text-primary hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-foreground/40 italic text-sm">
                No orders placed yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
