const mongoose = require("mongoose");

const ConventionSchema = new mongoose.Schema({
  titreConv: { type: String, required: true },
  secteur: { type: String, required: true },
  dateSignature: { type: Date, required: true },

  details: {
    resume: { type: String },
    objectifs: [{ type: String }],
    partiesSignataires: [{ type: String }],
    avantagesPourEmployes: [{ type: String }],
    obligationsEmploye: [{ type: String }],
    documentsAssocies: [
      {
        nom: { type: String },
        url: { type: String }
      }
    ]
  }
});

module.exports = mongoose.model("Convention", ConventionSchema);
