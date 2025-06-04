const annuaire = require('../models/annuairesModels');

// Read All
async function getAllannuaires() {
  return await annuaire.find();
}

// Read One
async function getannuaireById(idannuaire) {
  return await annuaire.findOne({ idannuaire });
}


module.exports = {
  getAllannuaires,
  getannuaireById,
};
