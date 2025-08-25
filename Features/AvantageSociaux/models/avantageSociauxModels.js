  const mongoose = require('mongoose');

    const avantageSociauxsSchema = new mongoose.Schema({

    titre_AS: { type: String, required: true }, 
    description_AS: { type: String, required: true },
    date_AS: { type: Date , required: true },
    image_AS: { type: String, required: true },
   
  }, { timestamps: true });
  
  module.exports = mongoose.model('avantageSociaux', avantageSociauxsSchema);
