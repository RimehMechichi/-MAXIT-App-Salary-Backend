const Summary = require("../models/summaryModel.js");

// Get all summaries
async function getAllSummaries(filter = {}) {
  return await Summary.find(filter).sort({ createdAt: -1 });
}

// Get summary by ID
async function getSummaryById(id) {
  return await Summary.findById(id);
}

// Get summaries by meetingId
async function getSummariesByMeeting(meetingId) {
  const summaries = await Summary.find({ meetingId }).sort({ createdAt: -1 });
  // Return latest if any
  return summaries.length > 0 ? summaries[0] : null;
}

module.exports = {
  getAllSummaries,
  getSummaryById,
  getSummariesByMeeting,
};
