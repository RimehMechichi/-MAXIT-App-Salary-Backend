  const mongoose = require('mongoose');

    const likesSchema = new mongoose.Schema({

    like: { type: String, required: true }, 
    dislike: { type: String, required: true },
   
  }, { timestamps: true });
  
  module.exports = mongoose.model('likes', likesSchema);
