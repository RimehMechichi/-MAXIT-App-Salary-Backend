/*const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
const { transcribeAudio, summarizeText } = require("./ai.service");
const Summary = require("../../Summary/models/summaryModel");

const meetingTranscripts = new Map();
const activeConnections = new Map();

let ioInstance;

function createWavFileBuffer(pcmBuffer) {
  const HEADER_LENGTH = 44;
  const sampleRate = 16000;
  const numChannels = 1;
  const bitDepth = 16;
  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);

  // Ensure buffer is properly sized and aligned for 16-bit PCM
  let processedBuffer = pcmBuffer;
  if (pcmBuffer.length % 2 !== 0) {
    // Ensure even length for 16-bit audio
    processedBuffer = pcmBuffer.slice(0, pcmBuffer.length - 1);
  }

  const dataSize = processedBuffer.length;
  const fileSize = dataSize + 36;

  const wavBuffer = Buffer.alloc(HEADER_LENGTH + processedBuffer.length);
  
  // Write WAV header
  wavBuffer.write("RIFF", 0);
  wavBuffer.writeUInt32LE(fileSize, 4);
  wavBuffer.write("WAVE", 8);
  wavBuffer.write("fmt ", 12);
  wavBuffer.writeUInt32LE(16, 16); // PCM format
  wavBuffer.writeUInt16LE(1, 20); // PCM audio format
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitDepth, 34);
  wavBuffer.write("data", 36);
  wavBuffer.writeUInt32LE(dataSize, 40);
  
  // Copy PCM data
  processedBuffer.copy(wavBuffer, HEADER_LENGTH);

  console.log(`🎵 Created WAV: ${wavBuffer.length} bytes, PCM: ${processedBuffer.length} bytes`);
  return wavBuffer;
}

// Audio debugging function
function debugAudioBuffer(buffer, meetingId) {
  console.log(`🔍 [AUDIO DEBUG] Meeting: ${meetingId}`);
  console.log(`   📊 Buffer size: ${buffer.length} bytes`);
  
  if (buffer.length >= 4) {
    const header = buffer.slice(0, 4).toString();
    if (header === 'RIFF') {
      console.log('   ✅ Format: WAV file');
      try {
        const sampleRate = buffer.readUInt32LE(24);
        const channels = buffer.readUInt16LE(22);
        const bitsPerSample = buffer.readUInt16LE(34);
        console.log(`   🎵 Sample Rate: ${sampleRate}Hz, Channels: ${channels}, Bits: ${bitsPerSample}`);
      } catch (e) {
        console.log('   ⚠️ Could not read WAV header details');
      }
    } else {
      console.log('   📝 Format: Raw PCM (will convert to WAV)');
    }
  }
  
  const duration = buffer.length / (16000 * 2);
  console.log(`   ⏱️ Estimated duration: ${duration.toFixed(2)} seconds`);
}

// Transcription result handler
async function handleTranscriptionResult(transcriptionResult, state, meetingId, userId, io) {
  const cleanedText = transcriptionResult.trim();
  const words = cleanedText.split(/\s+/).filter(word => word.length > 0);
  
  console.log(`🔊 [BACKEND] Raw transcription: "${cleanedText}" (${words.length} words)`);

  // Enhanced language detection and filtering
  const frenchPatterns = [
    'bonjour', 'salut', 'merci', 'oui', 'non', 'au', 'revoir', 'bonsoir',
    'ça', 'va', 'comment', 'aller', 'bien', 'très', 'super', 'd\'accord',
    'parfait', 'excusez', 'moi', 's\'il', 'vous', 'plaît', 'madame', 'monsieur',
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'des', 'les', 'un', 'une'
  ];
  
  const commonEnglishWords = ['you', 'the', 'and', 'is', 'are', 'hello', 'hi', 'thank', 'thanks', 'okay', 'ok', 'yes', 'no'];
  
  const hasFrenchContent = words.some(word => 
    frenchPatterns.includes(word.toLowerCase().replace(/[.,!?]/g, ''))
  );
  
  const hasMeaningfulContent = words.length >= 2 || 
    (words.length === 1 && words[0].length > 3);
  
  const isCommonEnglishNoise = words.length === 1 && 
    commonEnglishWords.includes(words[0].toLowerCase());

  const confidenceScore = calculateConfidence(cleanedText);

  if ((hasFrenchContent || (hasMeaningfulContent && confidenceScore > 0.7)) && !isCommonEnglishNoise) {
    state.fullTranscript += " " + cleanedText;
    
    io.to(meetingId).emit("partial_transcript", {
      text: cleanedText,
      fullTranscript: state.fullTranscript.trim(),
      timestamp: new Date().toISOString(),
      userId,
      confidence: confidenceScore
    });

    console.log(`✅ [BACKEND] MEANINGFUL Transcription: "${cleanedText}" (confidence: ${confidenceScore})`);
    console.log(`📄 [BACKEND] Total transcript: ${state.fullTranscript.length} chars`);
  } else {
    console.log(`🚫 [BACKEND] Filtered out: "${cleanedText}" (confidence: ${confidenceScore}, french: ${hasFrenchContent}, meaningful: ${hasMeaningfulContent})`);
  }
}

// Confidence scoring function
function calculateConfidence(text) {
  const words = text.split(/\s+/);
  if (words.length === 0) return 0;
  
  // Simple confidence based on word length and special characters
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  const hasSpecialChars = /[.,!?]/.test(text);
  
  let score = 0;
  if (avgWordLength > 3) score += 0.3;
  if (words.length > 1) score += 0.3;
  if (hasSpecialChars) score += 0.2;
  if (text === text.toUpperCase()) score -= 0.2; // All caps often indicates errors
  
  return Math.min(1, Math.max(0, score));
}

async function processAudioChunks(meetingId, userId, io) {
  const state = meetingTranscripts.get(meetingId);
  if (!state || state.isProcessing || state.audioChunks.length === 0) return;

  state.isProcessing = true;
  const chunksToProcess = [...state.audioChunks];
  state.audioChunks = [];

  console.log(`🧠 [BACKEND] Processing ${chunksToProcess.length} audio chunks (${chunksToProcess.reduce((acc, chunk) => acc + chunk.length, 0)} bytes)...`);

  try {
    const rawAudioBuffer = Buffer.concat(chunksToProcess);
    
    // Debug audio input
    debugAudioBuffer(rawAudioBuffer, meetingId);
    
    // Enhanced validation
    if (rawAudioBuffer.length < 16000) { // At least 1 second of audio
      console.log(`⏭️ [BACKEND] Skipping small audio buffer: ${rawAudioBuffer.length} bytes`);
      state.isProcessing = false;
      return;
    }

    let finalAudioBuffer = rawAudioBuffer;
    
    // Check if data is already WAV format
    if (rawAudioBuffer.slice(0, 4).toString() === 'RIFF') {
      console.log('🎵 Using existing WAV file');
      finalAudioBuffer = rawAudioBuffer;
    } else {
      console.log('🎵 Converting raw PCM to WAV format for Whisper...');
      finalAudioBuffer = createWavFileBuffer(rawAudioBuffer);
    }

    console.log(`🎯 [BACKEND] Sending ${finalAudioBuffer.length} bytes to Whisper...`);

    const transcriptionResult = await Promise.race([
      transcribeAudio(finalAudioBuffer),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transcription timeout after 30s')), 30000)
      )
    ]);

    if (transcriptionResult && transcriptionResult.trim().length > 0) {
      await handleTranscriptionResult(transcriptionResult, state, meetingId, userId, io);
    } else {
      console.log(`❌ [BACKEND] Empty transcription result`);
    }

  } catch (error) {
    console.error("❌ [BACKEND] Transcription failed:", error.message);
    
    // Retry logic - keep recent chunks
    if (chunksToProcess.length > 1) {
      state.audioChunks.unshift(...chunksToProcess.slice(-2));
    }
  } finally {
    state.isProcessing = false;
    state.lastProcessed = Date.now();
    
    // Continue processing if more chunks accumulated
    if (state.audioChunks.length >= 2) {
      setTimeout(() => processAudioChunks(meetingId, userId, io), 100);
    }
  }
}

function initLiveAISocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/live-ai-socket/",
    pingTimeout: 30000,
    pingInterval: 10000,
    connectTimeout: 20000,
    maxHttpBufferSize: 1e6,
    transports: ['websocket', 'polling']
  });

  ioInstance = io;

  setInterval(() => {
    console.log(`📊 [BACKEND] Active Socket.IO connections: ${io.engine.clientsCount}`);
    console.log(`🏥 [BACKEND] Active meetings: ${meetingTranscripts.size}`);
  }, 30000);

  io.on("connection", (socket) => {
    const meetingId = socket.handshake.query.meetingId || "unknown_meeting";
    const userId = socket.handshake.query.userId || "unknown_user";

    socket.meetingId = meetingId;
    socket.userId = userId;

    activeConnections.set(socket.id, { meetingId, userId, connectedAt: new Date() });

    console.log(`🔌 [BACKEND] New client connected. Meeting: ${meetingId}, User: ${userId}, Socket: ${socket.id}`);

    socket.join(meetingId);

    if (!meetingTranscripts.has(meetingId)) {
      meetingTranscripts.set(meetingId, {
        fullTranscript: "",
        audioChunks: [],
        lastProcessed: Date.now(),
        isProcessing: false,
        participants: new Set([userId]),
        startTime: new Date(),
        processingTimer: null,
        chunkCount: 0,
        lastActivity: Date.now()
      });
      console.log(`📝 [BACKEND] Initialized new meeting state for ${meetingId}`);
    } else {
      const state = meetingTranscripts.get(meetingId);
      state.participants.add(userId);
      state.lastActivity = Date.now();
    }

    socket.emit("ai_connected", {
      message: "Connected to AI transcription service",
      meetingId: meetingId,
      userId: userId,
      timestamp: new Date().toISOString(),
    });

    console.log(`🤖 [BACKEND] Sent 'ai_connected' welcome event to ${socket.id}`);

    socket.on("audio_chunk", async (chunk) => {
      try {
        const state = meetingTranscripts.get(meetingId);
        if (!state) {
          console.log(`❌ [BACKEND] No state for meeting ${meetingId}`);
          return;
        }

        state.lastActivity = Date.now();

        const safeChunk = Buffer.isBuffer(chunk)
          ? chunk
          : Array.isArray(chunk)
          ? Buffer.from(chunk)
          : Buffer.from(chunk || []);

        if (safeChunk.length > 20000) {
          console.log(`⚠️ [BACKEND] Chunk too large: ${safeChunk.length} bytes, using only first 20KB`);
          state.audioChunks.push(safeChunk.slice(0, 20000));
        } else {
          state.audioChunks.push(safeChunk);
        }

        state.chunkCount++;

        if (!state.isProcessing && state.audioChunks.length >= 2) {
          await processAudioChunks(meetingId, userId, io);
        } else if (!state.isProcessing && state.processingTimer === null) {
          state.processingTimer = setTimeout(() => {
            if (!state.isProcessing && state.audioChunks.length > 0) {
              processAudioChunks(meetingId, userId, io);
            }
            state.processingTimer = null;
          }, 500);
        }

      } catch (err) {
        console.error("🔥 [BACKEND] Error handling audio_chunk:", err);
      }
    });

    socket.on("heartbeat", () => {
      const state = meetingTranscripts.get(meetingId);
      if (state) {
        state.lastActivity = Date.now();
      }
      socket.emit("heartbeat_ack", { timestamp: new Date().toISOString() });
    });

    socket.on("join_meeting", (data) => {
      socket.join(data.meetingId);
      console.log(`👥 [BACKEND] User ${userId} joined room: ${data.meetingId}`);
    });

    socket.on("end_meeting", async (data) => {
      console.log(`🛑 [BACKEND] Manual meeting end requested for ${meetingId}`);
      await generateFinalSummary(meetingId, io);
    });

    socket.on("disconnect", async (reason) => {
      console.log(`🚫 [BACKEND] Client disconnected: ${userId} (${reason}). Meeting: ${meetingId}, Socket: ${socket.id}`);

      activeConnections.delete(socket.id);

      const state = meetingTranscripts.get(meetingId);
      if (!state) {
        console.log(`⚠️ [BACKEND] No state found for meeting ${meetingId}.`);
        return;
      }

      if (state.processingTimer) {
        clearTimeout(state.processingTimer);
        state.processingTimer = null;
      }

      state.participants.delete(userId);

      if (state.audioChunks.length > 0 && !state.isProcessing) {
        console.log(`🧠 [BACKEND] Processing final ${state.audioChunks.length} chunks before disconnect...`);
        await processAudioChunks(meetingId, userId, io);
      }

      const activeClientsInRoom = io.sockets.adapter.rooms.get(meetingId)?.size || 0;

      if (activeClientsInRoom === 0) {
        console.log(`👋 [BACKEND] All participants left meeting ${meetingId}`);
        await generateFinalSummary(meetingId, io);
        
        setTimeout(() => {
          if (meetingTranscripts.has(meetingId)) {
            meetingTranscripts.delete(meetingId);
            console.log(`🧹 [BACKEND] Cleaned up resources for meeting ${meetingId}`);
          }
        }, 5000);
      }

      console.log("=".repeat(80));
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ [BACKEND] Socket connect_error:", err.message);
    });

    socket.on("error", (err) => {
      console.error("🔥 [BACKEND] Socket error:", err);
    });

  });

  return io;
}

async function generateFinalSummary(meetingId, io) {
  const state = meetingTranscripts.get(meetingId);
  if (!state) {
    console.log(`⚠️ [BACKEND] No state found for meeting ${meetingId} when generating summary`);
    return;
  }

  const finalTranscript = state.fullTranscript.trim();
  
  const wordCount = finalTranscript.split(/\s+/).filter(word => word.length > 0).length;
  
  if (finalTranscript.length < 25 || wordCount < 5) {
    console.log(`⚠️ [BACKEND] Transcript too short (${finalTranscript.length} chars, ${wordCount} words) for summary`);
    io.to(meetingId).emit("summary_error", { 
      message: "Not enough content for meaningful summary",
      transcriptLength: finalTranscript.length,
      wordCount: wordCount
    });
    return;
  }

  console.log(`⏳ [BACKEND] Generating final summary for meeting ${meetingId}...`);
  console.log(`📄 Final transcript: "${finalTranscript}"`);
  console.log(`📊 Final transcript length: ${finalTranscript.length} chars, ${wordCount} words`);

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

    const savedSummary = await Summary.create({
      meetingId,
      summary: summary,
      fullTranscript: finalTranscript,
      participants: Array.from(state.participants),
      duration: meetingDuration,
      startTime: state.startTime,
      endTime: new Date(),
      title: `Meeting ${meetingId} - ${state.startTime.toLocaleDateString()}`,
    });

    console.log(`✅ [BACKEND] Final summary saved to database with ID: ${savedSummary._id}`);
    console.log(`📊 Summary: ${summary.length} chars`);

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
*/

const { Server } = require("socket.io");
const { summarizeText } = require("./ai.service");
const Summary = require("../../Summary/models/summaryModel");
const captionService = require("../views/caption.service");

const meetingTranscripts = new Map();
const activeConnections = new Map();
let ioInstance;

function initLiveAISocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/live-ai-socket/",
    pingTimeout: 30000,
    pingInterval: 10000,
    connectTimeout: 20000,
    maxHttpBufferSize: 1e6,
    transports: ['websocket', 'polling']
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    const meetingId = socket.handshake.query.meetingId || "unknown_meeting";
    const userId = socket.handshake.query.userId || "unknown_user";

    socket.meetingId = meetingId;
    socket.userId = userId;

    activeConnections.set(socket.id, { meetingId, userId, connectedAt: new Date() });

    console.log(`🔌 [BACKEND] New client connected. Meeting: ${meetingId}, User: ${userId}, Socket: ${socket.id}`);

    socket.join(meetingId);

    // Initialize meeting state
    if (!meetingTranscripts.has(meetingId)) {
      meetingTranscripts.set(meetingId, {
        participants: new Set([userId]),
        startTime: new Date(),
        lastActivity: Date.now()
      });
      console.log(`📝 [BACKEND] Initialized new meeting state for ${meetingId}`);
    } else {
      const state = meetingTranscripts.get(meetingId);
      state.participants.add(userId);
      state.lastActivity = Date.now();
    }

    socket.emit("ai_connected", {
      message: "Connected to caption and summary service",
      meetingId: meetingId,
      userId: userId,
      timestamp: new Date().toISOString(),
    });

    console.log(`🤖 [BACKEND] Sent 'ai_connected' welcome event to ${socket.id}`);

    // Handle caption data from frontend
    socket.on("caption_data", async (data) => {
      try {
        const { text, speaker } = data;
        
        console.log(`🗣️ [BACKEND] Received caption data: "${text}" from ${speaker}`);
        
        if (text && text.trim().length > 0) {
          // Save caption to service
          captionService.addCaption(meetingId, {
            text: text.trim(),
            speaker: speaker || userId
          });

          // Broadcast to other participants (optional)
          socket.to(meetingId).emit("caption_update", {
            text: text.trim(),
            timestamp: new Date().toISOString(),
            speaker: speaker || userId
          });

          console.log(`✅ [BACKEND] Caption saved for ${meetingId}: "${text.trim()}"`);
          
          // Log current stats
          const stats = captionService.getStats(meetingId);
          console.log(`📊 [BACKEND] Current stats: ${stats.captionCount} captions, ${stats.wordCount} words`);
        }
      } catch (err) {
        console.error("❌ [BACKEND] Error handling caption data:", err);
      }
    });

    // Handle manual summary request
    socket.on("generate_summary", async () => {
      try {
        console.log(`⏳ [BACKEND] Manual summary requested for meeting ${meetingId}`);
        await generateFinalSummary(meetingId, io);
      } catch (error) {
        console.error("❌ [BACKEND] Manual summary generation failed:", error);
        socket.emit("summary_error", {
          message: "Failed to generate summary",
          error: error.message
        });
      }
    });

    socket.on("end_meeting", async () => {
      console.log(`🛑 [BACKEND] Manual meeting end requested for ${meetingId}`);
      await generateFinalSummary(meetingId, io);
    });

    socket.on("disconnect", async (reason) => {
      console.log(`🚫 [BACKEND] Client disconnected: ${userId} (${reason})`);

      activeConnections.delete(socket.id);

      const state = meetingTranscripts.get(meetingId);
      if (state) {
        state.participants.delete(userId);

        const activeClientsInRoom = io.sockets.adapter.rooms.get(meetingId)?.size || 0;

        if (activeClientsInRoom === 0) {
          console.log(`👋 [BACKEND] All participants left meeting ${meetingId}`);
          await generateFinalSummary(meetingId, io);
          
          setTimeout(() => {
            if (meetingTranscripts.has(meetingId)) {
              meetingTranscripts.delete(meetingId);
              captionService.clearCaptions(meetingId);
              console.log(`🧹 [BACKEND] Cleaned up resources for meeting ${meetingId}`);
            }
          }, 5000);
        }
      }
    });
  });

  return io;
}

async function generateFinalSummary(meetingId, io) {
  try {
    const state = meetingTranscripts.get(meetingId);
    const fullTranscript = captionService.getFullTranscript(meetingId);
    const captions = captionService.getCaptions(meetingId);
    const stats = captionService.getStats(meetingId);
    
    console.log(`📊 [BACKEND] Summary generation - Words: ${stats.wordCount}, Captions: ${stats.captionCount}`);
    console.log(`📄 [BACKEND] Full transcript: "${fullTranscript}"`);
    
    if (fullTranscript.length < 25 || stats.wordCount < 5) {
      console.log(`⚠️ [BACKEND] Transcript too short for summary (${stats.wordCount} words)`);
      io.to(meetingId).emit("summary_error", { 
        message: "Not enough content for meaningful summary",
        wordCount: stats.wordCount,
        captionCount: stats.captionCount
      });
      return;
    }

    console.log(`⏳ [BACKEND] Generating summary for meeting ${meetingId}...`);

    const summary = await summarizeText(fullTranscript);
    const meetingDuration = state ? Date.now() - state.startTime : 0;
    
    const summaryData = {
      meetingId,
      summary: summary,
      fullTranscript: fullTranscript,
      participants: state ? Array.from(state.participants) : [],
      duration: meetingDuration,
      startTime: state?.startTime || new Date(),
      endTime: new Date(),
      captions: captions,
      wordCount: stats.wordCount,
      title: `Meeting ${meetingId} - ${new Date().toLocaleDateString()}`,
    };

    const savedSummary = await Summary.create(summaryData);

    console.log(`✅ [BACKEND] Summary saved to database with ID: ${savedSummary._id}`);
    console.log(`📄 Summary: ${summary.length} chars`);

    io.to(meetingId).emit("final_summary", {
      summary: summary,
      meetingId: meetingId,
      duration: meetingDuration,
      wordCount: stats.wordCount,
      createdAt: new Date()
    });

    // Clear captions after successful summary generation
    captionService.clearCaptions(meetingId);

  } catch (error) {
    console.error("❌ [BACKEND] SUMMARY GENERATION FAILED:", error.message);
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