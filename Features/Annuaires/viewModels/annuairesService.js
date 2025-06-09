const annuaire = require('../models/annuairesModels');

// Create
async function createannuaires(data) {
  return await annuaire.create(data);
}

// Read All
async function getAllannuaires() {
  return await annuaire.find();
}

// Read One
async function getannuaireById(rapportId) {
  return await annuaire.findOne({ rapportId });
}

// Update
async function updateannuaires(rapportId, data) {
  return await annuaire.findOneAndUpdate({ rapportId }, data, { new: true });
}

// Delete
async function deleteannuaires(rapportId) {
  return await annuaire.findOneAndDelete({ rapportId});
}

module.exports = {
  createannuaires,
  getAllannuaires,
  getannuaireById,
  updateannuaires,
  deleteannuaires,
};


