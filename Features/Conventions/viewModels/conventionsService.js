const convention = require('../models/conventionsModels');

// Create
async function createconventions(data) {
  return await convention.create(data);
}

// Read All
async function getAllconventions() {
  return await convention.find();
}

// Read One
async function getconventionById(rapportId) {
  return await convention.findOne({ rapportId });
}

// Update
async function updateconventions(rapportId, data) {
  return await convention.findOneAndUpdate({ rapportId }, data, { new: true });
}

// Delete
async function deleteconventions(rapportId) {
  return await convention.findOneAndDelete({ rapportId});
}

module.exports = {
  createconventions,
  getAllconventions,
  getconventionById,
  updateconventions,
  deleteconventions,
};


