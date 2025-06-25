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
async function getconventionById(_id) {
  return await convention.findOne({ _id });
}

// Update
async function updateconventions(_id, data) {
  return await convention.findOneAndUpdate({ _id }, data, { new: true });
}

// Delete
async function deleteconventions(_id) {
  return await convention.findOneAndDelete({ _id});
}

module.exports = {
  createconventions,
  getAllconventions,
  getconventionById,
  updateconventions,
  deleteconventions,
};


