const mongoose = require ('mongoose');

const PartenariatSchema = new mongoose.Schema({
companyName: {type : String, require: true},
partEmail: {type : String, require: true},
partPhone: {type : String, require: true},
partDepartement: {type : String, require: true},
activityDomain: {type : String, require: true},
addDate: {type : Date, default: Date.now },
});

module.exports = mongoose.model('Partenariat', PartenariatSchema);