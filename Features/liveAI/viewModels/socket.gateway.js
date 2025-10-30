const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
const { transcribeAudio, summarizeText } = require("./ai.service");
const Transcript = require("../models/transcript.model");
const Summary = require("../../Summary/models/summaryModel");

const meetingTranscripts = new Map();

let ioInstance;

function createWavFileBuffer(pcmBuffer) {
  const HEADER_LENGTH = 44;
  const sampleRate = 16000;
  const numChannels = 1;
  const bitDepth = 16;
  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);

  const wavBuffer = Buffer.alloc(HEADER_LENGTH + pcmBuffer.length);
  const dataSize = pcmBuffer.length;
  const fileSize = dataSize + 36;

  wavBuffer.write("RIFF", 0);
  wavBuffer.writeUInt32LE(fileSize, 4);
  wavBuffer.write("WAVE", 8);

  wavBuffer.write("fmt ", 12);
  wavBuffer.writeUInt32LE(16, 16);
  wavBuffer.writeUInt16LE(1, 20);
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitDepth, 34);

  wavBuffer.write("data", 36);
  wavBuffer.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(wavBuffer, HEADER_LENGTH);

  return wavBuffer;
}

function initLiveAISocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/live-ai-socket/",
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  ioInstance = io;

  setInterval(() => {
    console.log(`📊 [BACKEND] Active Socket.IO connections: ${io.engine.clientsCount}`);
  }, 10000);

  io.on("connection", (socket) => {
    const meetingId = socket.handshake.query.meetingId || "unknown_meeting";
    const userId = socket.handshake.query.userId || "unknown_user";

    socket.meetingId = meetingId;
    socket.userId = userId;

    console.log(`🔌 [BACKEND] New client connected. Meeting: ${meetingId}, User: ${userId}`);

    // Initialize meeting state if not exists
    if (!meetingTranscripts.has(meetingId)) {
      meetingTranscripts.set(meetingId, {
        fullTranscript: "", // This accumulates ALL transcriptions
        audioChunks: [],
        lastProcessed: Date.now(),
        isProcessing: false,
        participants: new Set([userId]),
        startTime: new Date(),
      });
      console.log(`📝 [BACKEND] Initialized new meeting state for ${meetingId}`);
    } else {
      // Add participant to existing meeting
      const state = meetingTranscripts.get(meetingId);
      state.participants.add(userId);
    }

    // 🧠 Handle incoming audio chunks
    socket.on("audio_chunk", async (chunk) => {
      try {
        const state = meetingTranscripts.get(meetingId);
        if (!state) return;

        const safeChunk = Buffer.isBuffer(chunk)
          ? chunk
          : Array.isArray(chunk)
          ? Buffer.from(chunk)
          : Buffer.from(chunk || []);

        state.audioChunks.push(safeChunk);

        // Trigger transcription when enough data accumulated
        if (
          !state.isProcessing &&
          state.audioChunks.length * safeChunk.length >= 100000 &&
          Date.now() - state.lastProcessed > 5000
        ) {
          state.isProcessing = true;
          state.lastProcessed = Date.now();

          console.log(`🧠 [BACKEND] Triggering transcription for ${state.audioChunks.length} chunks...`);

          const pcmBuffer = Buffer.concat(state.audioChunks);
          const wavBuffer = createWavFileBuffer(pcmBuffer);
          state.audioChunks = [];

          try {
            const transcriptionResult = await transcribeAudio(wavBuffer);

            if (transcriptionResult && transcriptionResult.length > 0) {
              console.log(`✅ [BACKEND] Transcription result: ${transcriptionResult}`);

              // 🆕 ACCUMULATE transcript instead of saving individually
              state.fullTranscript += " " + transcriptionResult;

              // Send real-time updates to frontend
              io.to(meetingId).emit("partial_transcript", {
                text: transcriptionResult.trim(),
                fullTranscript: state.fullTranscript.trim(),
                timestamp: new Date().toISOString(),
                userId,
              });

              console.log(`📄 [BACKEND] Meeting ${meetingId} total transcript: ${state.fullTranscript.length} chars`);
            }
          } catch (error) {
            console.error("❌ [BACKEND] Transcription failed:", error.message);
          } finally {
            state.isProcessing = false;
          }
        }
      } catch (err) {
        console.error("🔥 [BACKEND] Error handling audio_chunk:", err);
      }
    });

    socket.on("join_meeting", (data) => {
      socket.join(data.meetingId);
      console.log(`👥 [BACKEND] User ${userId} joined room: ${data.meetingId}`);
    });

    // 🆕 End meeting manually
    socket.on("end_meeting", async (data) => {
      console.log(`🛑 [BACKEND] Manual meeting end requested for ${meetingId}`);
      await generateFinalSummary(meetingId, io);
    });

    socket.on("disconnect", async (reason) => {
      console.log(`🚫 [BACKEND] Client disconnected: ${userId} (${reason}). Meeting: ${meetingId}`);

      const state = meetingTranscripts.get(meetingId);
      if (!state) {
        console.log(`⚠️ [BACKEND] No state found for meeting ${meetingId}.`);
        return;
      }

      // Remove participant
      state.participants.delete(userId);

      // Process any remaining audio chunks
      if (state.audioChunks.length > 0) {
        console.log(`🧠 [BACKEND] Processing final ${state.audioChunks.length} chunks...`);
        const pcmBuffer = Buffer.concat(state.audioChunks);
        const wavBuffer = createWavFileBuffer(pcmBuffer);
        const transcriptionResult = await transcribeAudio(wavBuffer);

        if (transcriptionResult && transcriptionResult.length > 0) {
          state.fullTranscript += " " + transcriptionResult;
          io.to(meetingId).emit("partial_transcript", {
            text: transcriptionResult.trim(),
            fullTranscript: state.fullTranscript.trim(),
            timestamp: new Date().toISOString(),
            userId,
          });
        }
      }

      const activeClientsInRoom = io.sockets.adapter.rooms.get(meetingId)?.size || 0;

      // 🆕 Generate summary when last participant leaves
      if (activeClientsInRoom === 0) {
        console.log(`👋 [BACKEND] All participants left meeting ${meetingId}`);
        await generateFinalSummary(meetingId, io);
        
        // Cleanup
        meetingTranscripts.delete(meetingId);
        console.log(`🧹 [BACKEND] Cleaned up resources for meeting ${meetingId}`);
      }

      console.log("=".repeat(80));
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ [BACKEND] Socket connect_error:", err.message);
    });

    socket.emit("ai_connected", {
      message: "Connected to AI transcription service",
      meetingId: socket.meetingId,
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });

    console.log(`🤖 [BACKEND] Sent 'ai_connected' welcome event to frontend`);
  });

  return io;
}

// 🆕 Function to generate and save final summary
async function generateFinalSummary(meetingId, io) {
  const state = meetingTranscripts.get(meetingId);
  if (!state) {
    console.log(`⚠️ [BACKEND] No state found for meeting ${meetingId} when generating summary`);
    return;
  }

  const finalTranscript = state.fullTranscript.trim();
  
  if (finalTranscript.length < 10) {
    console.log(`⚠️ [BACKEND] Transcript too short (${finalTranscript.length} chars) for summary`);
    io.to(meetingId).emit("summary_error", { 
      message: "Transcript too short for summary generation",
      transcriptLength: finalTranscript.length
    });
    return;
  }

  console.log(`⏳ [BACKEND] Generating final summary for meeting ${meetingId}...`);
  console.log(`📄 Final transcript length: ${finalTranscript.length} chars`);
  console.log("=".repeat(80));

  try {
    const summary = await summarizeText(finalTranscript);
    const meetingDuration = Date.now() - state.startTime;
    
    const summaryData = {
      meetingId,
      summary: summary,
      fullTranscript: finalTranscript,
      participants: Array.from(state.participants),
      duration: meetingDuration,
      startTime: state.startTime,
      endTime: new Date(),
      timestamp: new Date(),
    };

    // 🆕 Save ONE comprehensive summary to database
    const savedSummary = await Summary.create({
      meetingId,
      summary: summary,
      fullTranscript: finalTranscript,
      participants: Array.from(state.participants),
      duration: meetingDuration,
      startTime: state.startTime,
      endTime: new Date(),
      title: `Meeting Summary - ${state.startTime.toLocaleDateString()}`,
    });

    console.log(`✅ [BACKEND] Final summary saved to database with ID: ${savedSummary._id}`);
    console.log(`📊 Summary: ${summary.length} chars, Transcript: ${finalTranscript.length} chars`);

    // Notify all meeting participants
    io.to(meetingId).emit("final_summary", summaryData);
    console.log(`📢 [BACKEND] Final summary broadcasted for meeting ${meetingId}`);

  } catch (error) {
    console.error("❌ [BACKEND] FINAL SUMMARY GENERATION FAILED:", error.message);
    io.to(meetingId).emit("summary_error", { 
      message: "Failed to generate summary",
      error: error.message 
    });
  }
}

function getIO() {
  return ioInstance;
}

module.exports = { initLiveAISocket, getIO };