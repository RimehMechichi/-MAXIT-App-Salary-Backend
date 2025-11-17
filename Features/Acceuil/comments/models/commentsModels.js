<<<<<<< HEAD
  const mongoose = require('mongoose');

    const commentsSchema = new mongoose.Schema({

    titre_cmnt: { type: String, required: true }, 
    description_cmnt: { type: String, required: true },
    date_cmnt: { type: Date , required: true },
    image_cmnt: { type: String, required: true },
    nombres_cmnt: { type: Number, required: true },
   
  }, { timestamps: true });
  
  module.exports = mongoose.model('comments', commentsSchema);
=======
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
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
