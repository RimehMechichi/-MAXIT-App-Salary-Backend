const express = require("express");
const router = express.Router();
const { 
  getAllSummaries, 
  getSummaryById,
  getSummariesByMeeting, 
  getSummaryStats,
  getCaptionStats
} = require("../views/summary.controller");

router.get("/summaries", getAllSummaries);
router.get("/summaries/meeting/:meetingId", getSummariesByMeeting);
router.get("/summaries/:id", getSummaryById);
router.get("/summaries/stats", getSummaryStats);
router.get("/captions/stats/:meetingId", getCaptionStats);

module.exports = router;