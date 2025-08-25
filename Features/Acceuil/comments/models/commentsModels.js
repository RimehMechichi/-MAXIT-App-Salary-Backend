  const mongoose = require('mongoose');

    const commentsSchema = new mongoose.Schema({

    titre_cmnt: { type: String, required: true }, 
    description_cmnt: { type: String, required: true },
    date_cmnt: { type: Date , required: true },
    image_cmnt: { type: String, required: true },
    nombres_cmnt: { type: Number, required: true },
   
  }, { timestamps: true });
  
  module.exports = mongoose.model('comments', commentsSchema);
