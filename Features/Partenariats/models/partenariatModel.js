const mongoose = require ('mongoose');

const PartenariatSchema = new mongoose.Schema({
companyName: {type : String, required: true},
partEmail: {type : String, required: true},
partPhone: {type : String, required: true},
partDepartement: {type : String, required: true},
activityDomain: {type : String, required: true},
addDate: {type : Date, default: Date.now },
});

module.exports = mongoose.model('Partenariat', PartenariatSchema);