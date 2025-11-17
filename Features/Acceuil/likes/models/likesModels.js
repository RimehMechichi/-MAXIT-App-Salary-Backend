  const mongoose = require('mongoose');

    const likesSchema = new mongoose.Schema({
<<<<<<< HEAD

    like: { type: String, required: true }, 
    dislike: { type: String, required: true },
   
  }, { timestamps: true });
=======
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
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
  
  module.exports = mongoose.model('likes', likesSchema);
