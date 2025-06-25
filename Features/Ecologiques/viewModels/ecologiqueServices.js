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
async function getecologiqueById(_id) {
  return await ecologique.findOne({ _id });
}

// Update
async function updateecologiques(_id, data) {
  return await ecologique.findOneAndUpdate({ _id }, data, { new: true });
}

// Delete
async function deleteecologiques(_id) {
  return await ecologique.findOneAndDelete({ _id});
}

module.exports = {
  createecologiques,
  getAllecologiques,
  getecologiqueById,
  updateecologiques,
  deleteecologiques,
};


