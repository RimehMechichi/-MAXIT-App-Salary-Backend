const express = require("express");
const router = express.Router();
const { handleAudioTranscript } = require("../views/liveAI.controller");

router.get("/liveai/meeting/:meetingId", handleAudioTranscript);

module.exports = router;
