  const mongoose = require('mongoose');
  const { v4: uuidv4 } = require('uuid');

    const ecologiquesSchema = new mongoose.Schema({
    event_ecoId: {
        type: String,
        default: () => 'ECO-' + uuidv4(),
        unique: true
    },
    titre_eventEco: { type: String, required: true }, 
    description_eventEco: { type: String, required: true },
    date_eventEco: { type: Date , required: true },
    image_eventEco: { type: String, required: true },
   
  }, { timestamps: true });
  
  module.exports = mongoose.model('ecologiques', ecologiquesSchema);
    
