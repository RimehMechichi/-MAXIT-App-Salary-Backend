const eventcalendar = require('../models/eventCalendarModel.js');

// Create
async function createEventcalendar(data) {
  return await eventcalendar.create(data);
}

// Read All
async function getAllEventcalendars() {
  return await eventcalendar.find();
}

// Read One
async function getEventcalendarById(_id) {
  return await eventcalendar.findOne({ _id });
}

// Update
async function updateEventcalendar(_id, data) {
  return await eventcalendar.findOneAndUpdate({ _id }, data, { new: true });
}

// Delete
async function deleteEventcalendar(_id) {
  return await eventcalendar.findOneAndDelete({ _id });
}

module.exports = {
  createEventcalendar,
  getAllEventcalendars,
  getEventcalendarById,
  updateEventcalendar,
  deleteEventcalendar,
};
