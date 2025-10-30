const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema({
  meetingId: { type: String, required: true, index: true },
  summary: { type: String, required: true },
  fullTranscript: { type: String, required: true },
  participants: [{ type: String }], // Array of user IDs
  duration: { type: Number }, // Duration in milliseconds
  startTime: { type: Date },
  endTime: { type: Date },
  title: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Summary", summarySchema);
