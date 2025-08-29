  const mongoose = require('mongoose');

    const likesSchema = new mongoose.Schema({
  acceuilItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'acceuilItemType'
  },
  acceuilItemType: {
    type: String,
    required: true,
    enum: ['avantageSociaux', 'ecologique']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  like: {
    type: Boolean,
    default: false
  },
  dislike: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
    userName: {
    type: String,
  } ,
   userAvatar: {
    type: String,
  }
});
  
  module.exports = mongoose.model('likes', likesSchema);
