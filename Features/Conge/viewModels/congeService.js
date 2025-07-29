const Conge = require('../models/congeModel');
const User = require('/Users/Asus/Desktop/StagePFE/appsalary-backend/Features/Authentification/models/user.model.js');

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

// Get By User ID
async function getCongesByUser(userId) {
  return await Conge.find({ userId: userId });
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
  getCongesByUser,
  updateConge,
  deleteConge,
};
