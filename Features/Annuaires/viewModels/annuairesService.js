const annuaire = require('../models/annuairesModels');

// Create
async function createannuaires(data) {
  return await annuaire.create(data);
}

// Read All
async function getAllannuaires() {
  return await annuaire.find();
}

// Read All
async function getAllFromUsers() {
  return await annuaire.find();
}


// Read One
async function getannuaireById(_id) {
  return await annuaire.findOne({ _id });
}

// Update
async function updateannuaires(_id, data) {
  return await annuaire.findOneAndUpdate({ _id }, data, { new: true });
}

// Delete
async function deleteannuaires(_id) {
  return await annuaire.findOneAndDelete({ _id});
}

module.exports = {
  createannuaires,
  getAllannuaires,
  getannuaireById,
  updateannuaires,
  deleteannuaires,
  getAllFromUsers,
};


