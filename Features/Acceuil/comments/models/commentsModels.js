const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  acceuilItemId: { type: String, required: true },
  acceuilItemType: { type: String, required: true }, // 'avantageSociaux' or 'ecologique'
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);