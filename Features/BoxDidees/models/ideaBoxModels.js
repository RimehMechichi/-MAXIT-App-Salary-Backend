const mongoose = require  ('mongoose');

const IdeaBoxSchema = new mongoose.Schema({
boxObject: {type : String ,require: true},
boxTitle: {type : String ,require: true},
department: {type : String ,require: true},
createdAt: {type : Date},
imagePath: {type : String},
isAnonymous: {type : Boolean},
category: {type : String ,require: true}
});

module.exports = mongoose.model('IdeaBox', IdeaBoxSchema);