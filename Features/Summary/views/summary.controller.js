const Summary = require("../models/summaryModel");

// Add new endpoint to get live caption stats
exports.getCaptionStats = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const stats = captionService.getStats(meetingId);
    
    res.status(200).json({
      meetingId,
      ...stats,
      hasCaptions: stats.captionCount > 0
    });
  } catch (err) {
    console.error("❌ Error getting caption stats:", err.message);
    res.status(500).json({ message: "Error getting caption stats", error: err.message });
  }
};
// Get all summaries
exports.getAllSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find().sort({ createdAt: -1 });
    console.log(`📋 Found ${summaries.length} total summaries in database`);
    res.status(200).json({ count: summaries.length, summaries });
  } catch (err) {
    console.error("❌ Error fetching all summaries:", err.message);
    res.status(500).json({ message: "Error fetching all summaries", error: err.message });
  }
};

// Get summary by ID
exports.getSummaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const summary = await Summary.findById(id);
    if (!summary) return res.status(404).json({ message: "Summary not found" });
    res.status(200).json({ summary });
  } catch (err) {
    console.error("❌ Error fetching summary by ID:", err.message);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: "Error fetching summary", error: err.message });
  }
};

// Get summaries by meetingId
exports.getSummariesByMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    console.log(`🔍 Searching summaries with meetingId: ${meetingId}`);
    const summaries = await Summary.find({ meetingId }).sort({ createdAt: -1 });

    if (!summaries?.length) {
      return res.status(404).json({ 
        message: "No summaries found for this meeting", 
        meetingId,
        suggestion: "Try generating a summary first or check if transcript was long enough"
      });
    }

    console.log(`✅ Found ${summaries.length} summaries for meeting ${meetingId}`);
    
    res.status(200).json({
      count: summaries.length,
      meetingId,
      summaries: summaries, // Return all summaries for this meeting
      latest: summaries[0], // Most recent summary
    });
  } catch (err) {
    console.error("❌ Error fetching meeting summaries:", err.message);
    res.status(500).json({ message: "Error fetching meeting summaries", error: err.message });
  }
};

// 🆕 Debug endpoint to check database status
exports.getSummaryStats = async (req, res) => {
  try {
    const totalSummaries = await Summary.countDocuments();
    const recentSummaries = await Summary.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('meetingId createdAt summary');
    
    res.status(200).json({
      totalSummaries,
      recentSummaries,
      database: "Connected and operational"
    });
  } catch (err) {
    console.error("❌ Error getting summary stats:", err.message);
    res.status(500).json({ message: "Error getting summary stats", error: err.message });
  }
};