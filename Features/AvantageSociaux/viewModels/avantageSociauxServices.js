const avantageSociaux = require('../models/avantageSociauxModels');


// Create
async function createavantageSociaux(data) {
  return await avantageSociaux.create(data);
}

// Read All
async function getAllavantageSociaux() {
  return await avantageSociaux.find();
}

// Read One
async function getavantageSociauxById(_id) {
  return await avantageSociaux.findOne({ _id });
}

// Update
async function updateavantageSociaux(_id, data) {
  return await avantageSociaux.findOneAndUpdate({ _id }, data, { new: true });
}

// Delete
async function deleteavantageSociaux(_id) {
  return await avantageSociaux.findOneAndDelete({ _id});
}

module.exports = {
  createavantageSociaux,
  getAllavantageSociaux,
  getavantageSociauxById,
  updateavantageSociaux,
  deleteavantageSociaux,
};


