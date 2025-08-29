const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  acceuilItemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    refPath: 'acceuilItemType' // CHANGE TO refPath
  },
  acceuilItemType: { // ADD THIS FIELD
    type: String,
    required: true,
    enum: ['avantageSociaux', 'ecologique']
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  text: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  userName: { type: String },
  userAvatar: { type: String},
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);