  const mongoose = require('mongoose');
  const { v4: uuidv4 } = require('uuid');

    const annuairesSchema = new mongoose.Schema({
    rapportId: {
        type: String,
        default: () => 'ORG-' + uuidv4(),
        unique: true
    },
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String , required: true },
    phone: { type: String , required: true },
    direction: { type: String, required: true },
  }, { timestamps: true });
  
  module.exports = mongoose.model('annuaires', annuairesSchema);
    
