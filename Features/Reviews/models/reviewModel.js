const mongoose = require ('mongoose');

const ReviewSchema = new mongoose.Schema({
clientName: {type: String, reqired: true},
comment: {type: String, reqired: true},  
rating: {type: String, reqired: false},
date: {type: Date, reqired: true},
isFeatured: {type: Boolean, reqired: false},
});
module.exports = mongoose.model ('Reviews ', ReviewSchema);