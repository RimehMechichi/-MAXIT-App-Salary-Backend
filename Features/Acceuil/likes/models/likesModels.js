const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  acceuilItemId: { type: String, required: true },
  acceuilItemType: { type: String, required: true }, // 'avantageSociaux' or 'ecologique'
  isLiked: { type: Boolean, default: true },
  likedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Like', likeSchema);