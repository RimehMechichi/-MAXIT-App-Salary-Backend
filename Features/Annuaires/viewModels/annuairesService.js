const annuaire = require('../models/annuairesModels');

// Create
async function createannuaire(data) {
  return await annuaire.create(data);
}

// Read All
async function getAllannuaires() {
  return await annuaire.find();
}

// Read One
async function getannuaireById(idannuaire) {
  return await annuaire.findOne({ idannuaire });
}

// Update
async function updateannuaire(idannuaire, data) {
  return await annuaire.findOneAndUpdate({ idannuaire }, data, { new: true });
}

// Delete
async function deleteannuaire(idannuaire) {
  return await annuaire.findOneAndDelete({ idannuaire });
}

module.exports = {
  createannuaire,
  getAllannuaires,
  getannuaireById,
  updateannuaire,
  deleteannuaire,
};
