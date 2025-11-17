const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema({
  meetingId: { type: String, required: true, index: true },
  summary: { type: String, required: true },
  fullTranscript: { type: String, required: true },
  participants: [{ type: String }],
  duration: { type: Number },
  startTime: { type: Date },
  endTime: { type: Date },
  title: String,
  captions: [{
    text: String,
    timestamp: Date,
    speaker: String
  }],
  wordCount: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Summary", summarySchema);