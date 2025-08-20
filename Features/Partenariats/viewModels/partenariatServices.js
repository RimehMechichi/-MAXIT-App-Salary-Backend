const partenariat = require('../models/partenariatModel');

// Create
async function createpartenariat(data) {
  return await partenariat.create(data);
}

// Read All
async function getAllpartenariats() {
  return await partenariat.find();
}

// Read One
async function getpartenariatById(_id) {
  return await partenariat.findOne({ idpart_idenariat });
}

// Update
async function updatepartenariat(_id, data) {
  return await partenariat.findOneAndUpdate({ _id }, data, { new: true });
}

// Delete
async function deletepartenariat(_id) {
  return await partenariat.findOneAndDelete({ _id });
}

async function checkIfExists({ companyName, email }) {
  return await partenariat.findOne({
    $or: [
      { companyName: companyName },
      { partEmail: email }
    ]
  });
}

module.exports = {
  createpartenariat,
  getAllpartenariats,
  getpartenariatById,
  updatepartenariat,
  deletepartenariat,
  checkIfExists, 
};
