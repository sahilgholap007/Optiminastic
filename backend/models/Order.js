const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  amount: { type: Number, required: true },
  fulfillmentId: { type: String },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
