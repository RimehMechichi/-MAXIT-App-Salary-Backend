const Conge = require('../models/congeModel');

// Create
async function createConge(data) {
  return await Conge.create(data);
}

// Read All
async function getAllConges() {
  return await Conge.find();
}

// Read One
async function getCongeById(idConge) {
  return await Conge.findOne({ idConge });
}

// Update
async function updateConge(idConge, data) {
  return await Conge.findOneAndUpdate({ idConge }, data, { new: true });
}

// Delete
async function deleteConge(idConge) {
  return await Conge.findOneAndDelete({ idConge });
}

module.exports = {
  createConge,
  getAllConges,
  getCongeById,
  updateConge,
  deleteConge,
};
