const mongoose = require("mongoose");

const transcriptSchema = new mongoose.Schema({
  meetingId: { type: String, required: true },
  userId: String,
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  processed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Transcript", transcriptSchema);
