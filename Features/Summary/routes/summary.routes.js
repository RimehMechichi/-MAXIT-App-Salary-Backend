const express = require("express");
const router = express.Router();
const { 
  getAllSummaries, 
  getSummaryById,
  getSummariesByMeeting , 
  getSummaryStats
} = require("../views/summary.controller");

router.get("/summaries", getAllSummaries);
router.get("/summaries/meeting/:meetingId", getSummariesByMeeting); 
router.get("/summaries/:id", getSummaryById);
router.get('/summaries/stats', getSummaryStats);

module.exports = router;