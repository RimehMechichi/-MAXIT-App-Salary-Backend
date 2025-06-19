const mongoose = require ('mongoose');

const EventCalendarschema = new mongoose.Schema({
    pictureEvent: {type: String, required : false},
    title: {type: String, required : true},
    description : {type: String, required : true},
    postTime: {type: Date, required : true},
    latitude: {type: String, required : false},
    longitude: {type: String, required : false},
    startTime: {type: String, required : false},
    endTime: {type: String, required : false},
    address: {type: String, required : false},
});

module.exports = mongoose.model('EventCalendar', EventCalendarschema)