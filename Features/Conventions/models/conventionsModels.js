  const mongoose = require('mongoose');
  const { v4: uuidv4 } = require('uuid');

    const conventionsSchema = new mongoose.Schema({
   /*  conventionId: {
        type: String,
        default: () => 'CNV-' + uuidv4(),
        unique: true
    },*/
    titreConv: { type: String, required: true }, 
    secteur: { type: String, required: true },
    dateSignature: { type: Date , required: true },
   
  }, { timestamps: true });
  
  module.exports = mongoose.model('conventions', conventionsSchema);
    
