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
async function getCongeById(_id) {
  return await Conge.findOne({ idConge });
}

// Update
async function updateConge(_id, data) {
  return await Conge.findOneAndUpdate({ _id }, data, { new: true });
}

// Delete
async function deleteConge(_id) {
  return await Conge.findOneAndDelete({ _id });
}

module.exports = {
  createConge,
  getAllConges,
  getCongeById,
  updateConge,
  deleteConge,
};
