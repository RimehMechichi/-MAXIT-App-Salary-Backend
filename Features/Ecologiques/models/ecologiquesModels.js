  const mongoose = require('mongoose');

    const ecologiquesSchema = new mongoose.Schema({

    titre_eventEco: { type: String, required: true }, 
    description_eventEco: { type: String, required: true },
    planning: {type: [String], required: true },
    date_eventEco: { type: Date , required: true },
    image_eventEco: { type: String, required: true },
    images: {type: [String] , required: false},
  }, { timestamps: true });
  
  module.exports = mongoose.model('ecologiques', ecologiquesSchema);
