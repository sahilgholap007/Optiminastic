require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const User = require('./models/User');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// --- Middlewares ---

const validateClient = async (req, res, next) => {
  const clientId = req.headers['client-id'];
  if (!clientId) {
    return res.status(400).json({ error: 'client-id header is required' });
  }
  
  let user = await User.findOne({ clientId });
  if (!user) {
    // For this simple demo, we auto-create the user if they don't exist
    user = await User.create({ clientId, name: `Client ${clientId}`, walletBalance: 0 });
  }
  
  req.user = user;
  next();
};

// --- Admin APIs ---

// 1. Admin - Credit Wallet
app.post('/admin/wallet/credit', async (req, res) => {
  const { client_id, amount } = req.body;
  
  if (!client_id || !amount || amount <= 0) {
    return res.status(400).json({ error: 'client_id and positive amount are required' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { clientId: client_id },
      { $inc: { walletBalance: amount } },
      { new: true, upsert: true }
    );

    await Transaction.create({
      clientId: client_id,
      type: 'credit',
      amount
    });

    res.json({ message: 'Wallet credited successfully', balance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Admin - Debit Wallet
app.post('/admin/wallet/debit', async (req, res) => {
  const { client_id, amount } = req.body;

  if (!client_id || !amount || amount <= 0) {
    return res.status(400).json({ error: 'client_id and positive amount are required' });
  }

  try {
    const user = await User.findOne({ clientId: client_id });
    if (!user || user.walletBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    user.walletBalance -= amount;
    await user.save();

    await Transaction.create({
      clientId: client_id,
      type: 'debit',
      amount
    });

    res.json({ message: 'Wallet debited successfully', balance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2.1 Admin - Get All Activities
app.get('/admin/activities', async (req, res) => {
  try {
    const activities = await Transaction.find().sort({ timestamp: -1 }).limit(50);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Client APIs ---

// 3. Client - Create Order
app.post('/orders', validateClient, async (req, res) => {
  const { amount } = req.body;
  const clientId = req.user.clientId;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ clientId }).session(session);
    if (user.walletBalance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    // Deduct amount
    user.walletBalance -= amount;
    await user.save({ session });

    // Create Order
    const order = new Order({
      clientId,
      amount,
      status: 'creating'
    });
    await order.save({ session });

    // Log Transaction
    await Transaction.create([{
      clientId,
      type: 'order_deduction',
      amount
    }], { session });

    // Call Fulfillment API (JSONPlaceholder)
    // NOTE: In a real scenario, this might be outside the DB transaction if it takes long, 
    // but here we follow the order: deduct -> create -> fulfillment -> update.
    try {
      const fulfillmentResponse = await axios.post('https://jsonplaceholder.typicode.com/posts', {
        userId: clientId,
        title: order._id.toString()
      });

      order.fulfillmentId = fulfillmentResponse.data.id;
      order.status = 'fulfilled';
      await order.save({ session });
    } catch (fulfillErr) {
      console.error('Fulfillment API failed', fulfillErr.message);
      order.status = 'fulfillment_failed';
      await order.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: err.message });
  }
});

// 4. Client - Get Order Details
app.get('/orders/:order_id', validateClient, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.order_id, clientId: req.user.clientId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Wallet Balance
app.get('/wallet/balance', validateClient, async (req, res) => {
  res.json({ clientId: req.user.clientId, balance: req.user.walletBalance });
});

// 6. Get All Orders
app.get('/orders', validateClient, async (req, res) => {
  try {
    const orders = await Order.find({ clientId: req.user.clientId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Get All Activities (Transactions)
app.get('/activities', validateClient, async (req, res) => {
  try {
    const activities = await Transaction.find({ clientId: req.user.clientId }).sort({ timestamp: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
