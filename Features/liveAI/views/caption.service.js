class CaptionService {
  constructor() {
    this.meetingCaptions = new Map(); // meetingId -> captions array
  }

  addCaption(meetingId, captionData) {
    if (!this.meetingCaptions.has(meetingId)) {
      this.meetingCaptions.set(meetingId, []);
    }
    
    const captions = this.meetingCaptions.get(meetingId);
    captions.push({
      text: captionData.text,
      timestamp: new Date(),
      speaker: captionData.speaker || 'Unknown'
    });
    
    console.log(`📝 Caption added for meeting ${meetingId}: "${captionData.text}"`);
  }

  getCaptions(meetingId) {
    return this.meetingCaptions.get(meetingId) || [];
  }

  getFullTranscript(meetingId) {
    const captions = this.getCaptions(meetingId);
    return captions.map(caption => caption.text).join(' ').trim();
  }

  clearCaptions(meetingId) {
    this.meetingCaptions.delete(meetingId);
    console.log(`🧹 Cleared captions for meeting ${meetingId}`);
  }

  getStats(meetingId) {
    const captions = this.getCaptions(meetingId);
    const transcript = this.getFullTranscript(meetingId);
    const wordCount = transcript.split(/\s+/).filter(word => word.length > 0).length;
    
    return {
      captionCount: captions.length,
      wordCount,
      duration: captions.length > 0 ? 
        new Date() - captions[0].timestamp : 0
    };
  }
}

module.exports = new CaptionService();