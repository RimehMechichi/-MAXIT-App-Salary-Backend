// ai.service.js - Fixed
const axios = require("axios");

const HF_API_URL = "https://api-inference.huggingface.co/models";
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

const MODELS = {
  TRANSCRIBE: [
    process.env.HF_TRANSCRIBE_MODEL || "openai/whisper-large-v3",
  ],
  SUMMARIZE: [
    process.env.HF_SUMMARY_MODEL || "google/pegasus-large",
    "google/pegasus-cnn_dailymail",
    "facebook/bart-large-cnn",
    "philschmid/bart-large-cnn-samsum",
    "google/pegasus-xsum",
    "google/flan-t5-xl"  
  ],
};

async function callHuggingFaceModel(model, input, headers = {}) {
  try {
    console.log(`🤖 Calling Hugging Face model: ${model}`);
    
    const response = await axios.post(`${HF_API_URL}/${model}`, input, {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        ...headers,
      },
      timeout: 120000, 
    });
    
    console.log(`✅ HF model ${model} responded successfully`);
    return response.data;
  } catch (err) {
    const status = err.response?.status;
    const errorMsg = err.response?.data?.error || err.message;
    
    if (status === 503) {
      console.warn(`⏳ Model ${model} is loading, trying next model...`);
    } else {
      console.warn(`⚠️ HF model ${model} failed [${status}]: ${errorMsg}`);
    }
    return null;
  }
}

async function transcribeAudio(base64Audio) {
  const audioBuffer = Buffer.from(base64Audio, "base64");
  
  console.log(`🎧 Transcribing audio (${audioBuffer.length} bytes)...`);

  for (const model of MODELS.TRANSCRIBE) {
    console.log(`🔊 Trying ${model} for transcription...`);
    
    const result = await callHuggingFaceModel(model, audioBuffer, {
      "Content-Type": "audio/wav",
      "Accept": "application/json",
    });
    
    if (result?.text) {
      const cleanedText = result.text.trim();
      console.log(`✅ Transcribed with ${model}: "${cleanedText}"`);
      return cleanedText;
    }
  }

  console.error("❌ All transcription models failed");
  return "";
}

function chunkText(text, size = 3000) {
  if (!text) return [];
  const trimmed = text.trim();

  if (trimmed.length <= size) return [trimmed];

  const regex = new RegExp(`(.|[\r\n]){1,${size}}`, "g");
  return trimmed.match(regex) || [trimmed];
}

async function summarizeText(text) {
  try {
    if (!text || text.trim().length < 20) {
      return "Not enough transcript content to summarize.";
    }

    const len = text.trim().length;
    console.log(`🧠 Summary requested (${len} chars)`);

    // Short transcripts - simple processing
    if (len < 500) {
      console.log("📘 Using simple summary for short transcript");
      
      for (const model of MODELS.SUMMARIZE) {
        try {
          const response = await callHuggingFaceModel(model, {
            inputs: `Summarize this short meeting transcript: ${text}`,
            parameters: {
              max_length: 500,
              min_length: 50,
              temperature: 0.7,
            }
          });

          const summary =
            response?.[0]?.summary_text ||
            response?.summary_text ||
            response?.[0]?.generated_text ||
            (typeof response === "string" ? response : null);

          if (summary && summary.trim().length > 10) {
            return summary.trim();
          }
        } catch (err) {
          console.warn(`⚠️ Model ${model} failed:`, err.message);
          continue;
        }
      }
      
      // Fallback for very short content
      return `Meeting transcript: "${text.trim()}" - This was a brief conversation.`;
    }

    // --- CHUNKING (for big transcripts)
    const chunks = chunkText(text, 3000);
    let partialSummaries = [];

    // --- EXPAND EACH CHUNK
    for (const chunk of chunks) {
      let expanded = null;

      for (const model of MODELS.SUMMARIZE) {
        try {
          console.log(`📝 Expanding chunk (${chunk.length} chars) using ${model}`);

          const response = await callHuggingFaceModel(model, {
            inputs: `
Expand this meeting transcript into a detailed written report.
Include decisions, discussions, and action steps.

TRANSCRIPT:
${chunk}
`,
            parameters: {
              max_length: 1024,
              min_length: 200,
              temperature: 0.7,
              do_sample: true,
            }
          });

          expanded =
            response?.[0]?.summary_text ||
            response?.summary_text ||
            response?.[0]?.generated_text ||
            (typeof response === "string" ? response : null);

          if (expanded && expanded.trim().length > 50) {
            partialSummaries.push(expanded.trim());
            break;
          }
        } catch (err) {
          console.warn(`⚠️ Model ${model} failed:`, err.message);
          continue;
        }
      }
    }

    // If nothing worked, fallback
    if (partialSummaries.length === 0) {
      return "Summary could not be generated due to model failures.";
    }

    // MERGE OUTPUT
    const combined = partialSummaries.join("\n\n");

    // FINAL SUMMARY PASS
    console.log(`📚 Finalizing combined summary (${combined.length} chars)`);

    try {
      const result = await callHuggingFaceModel(MODELS.SUMMARIZE[0], {
        inputs: `Create a comprehensive meeting summary from: ${combined}`,
        parameters: {
          max_length: 1024,
          min_length: 200,
          temperature: 0.7,
        }
      });

      const final =
        result?.[0]?.summary_text ||
        result?.summary_text ||
        combined;

      return final.trim();
    } catch (err) {
      console.warn("⚠️ Final summary failed, returning partial:", err.message);
      return combined.trim();
    }

  } catch (fatal) {
    console.error("🔥 summarizeText fatal error:", fatal);
    return "A summarization error occurred.";
  }
}

module.exports = { transcribeAudio, summarizeText };