const ecologique = require('../models/ecologiquesModels');

// Create
async function createecologiques(data) {
  return await ecologique.create(data);
}

// Read All
async function getAllecologiques() {
  return await ecologique.find();
}

// Read One
async function getecologiqueById(rapportId) {
  return await ecologique.findOne({ rapportId });
}

// Update
async function updateecologiques(rapportId, data) {
  return await ecologique.findOneAndUpdate({ rapportId }, data, { new: true });
}

// Delete
async function deleteecologiques(rapportId) {
  return await ecologique.findOneAndDelete({ rapportId});
}

module.exports = {
  createecologiques,
  getAllecologiques,
  getecologiqueById,
  updateecologiques,
  deleteecologiques,
};


