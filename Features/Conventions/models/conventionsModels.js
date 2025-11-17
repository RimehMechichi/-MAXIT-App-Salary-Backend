  const mongoose = require('mongoose');

    const conventionsSchema = new mongoose.Schema({
    titreConv: { type: String, required: true }, 
    secteur: { type: String, required: true },
    dateSignature: { type: Date , required: true },
   
  }, { timestamps: true });
  
  module.exports = mongoose.model('conventions', conventionsSchema);
    
