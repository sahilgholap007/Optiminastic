const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit', 'order_deduction'], required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
