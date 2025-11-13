const Transcript = require("../models/transcript.model");
const Summary = require("../../Summary/models/summaryModel");
const { transcribeAudio, summarizeText } = require("../viewModels/ai.service");

exports.handleAudioTranscript = async (req, res) => {
  try {
    const { meetingId, userId, base64Audio } = req.body;

    console.log("🎙️ Received /handleAudioTranscript request", {
      meetingId,
      userId,
      base64AudioLength: base64Audio?.length || 0,
    });

    if (!meetingId || !base64Audio) {
      return res.status(400).json({
        message: "meetingId and base64Audio are required",
      });
    }

    console.log("🔍 Starting transcription...");
    const text = await transcribeAudio(base64Audio);

    if (!text || text.trim().length === 0) {
      console.error("❌ No text returned from transcription!");
      return res.status(500).json({
        message: "Transcription failed — no text returned from model",
      });
    }

    console.log(`✅ Transcription complete (${text.length} chars)`);

    const existingSummary = await Summary.findOne({ meetingId }).sort({ createdAt: -1 });
    
    if (existingSummary) {
      console.log("🔄 Updating existing meeting summary with new transcription...");
      
      const updatedTranscript = existingSummary.fullTranscript + " " + text;
      
      const newSummary = await summarizeText(updatedTranscript);
      
      existingSummary.fullTranscript = updatedTranscript;
      existingSummary.summary = newSummary;
      existingSummary.endTime = new Date();
      await existingSummary.save();

      console.log("✅ Meeting summary updated successfully");

      return res.status(200).json({
        message: "Meeting summary updated successfully",
        transcript: text,
        summary: existingSummary,
      });
    }

    console.log("🧠 Creating new meeting summary...");
    const summaryText = await summarizeText(text);

    const title = `Meeting ${meetingId} - ${new Date().toLocaleDateString()}`;

    const summary = await Summary.create({
      meetingId,
      summary: summaryText || "Summary generation in progress...",
      fullTranscript: text,
      participants: [userId],
      startTime: new Date(),
      endTime: new Date(),
      title,
    });

    console.log("✅ New meeting summary created successfully");

    res.status(201).json({
      message: "Meeting summary created successfully",
      transcript: text,
      summary,
    });

  } catch (err) {
    console.error("🔥 Fatal error in handleAudioTranscript:", err);
    res.status(500).json({
      message: "Error processing transcript",
      error: err.message,
    });
  }
};