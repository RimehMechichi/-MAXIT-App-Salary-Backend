// models/CollectionInvitation.js
const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TodoCollection',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedUserEmail: {
    type: String,
    required: true
  },
  fromUserEmail: String,
  fromUserName: String,
  collectionName: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
invitationSchema.index({ toUserId: 1, status: 1 });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to check if invitation is expired
invitationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Static method to clean up expired invitations
invitationSchema.statics.cleanupExpired = async function() {
  await this.updateMany(
    { 
      status: 'pending',
      expiresAt: { $lt: new Date() }
    },
    { status: 'expired' }
  );
};

module.exports = mongoose.model('CollectionInvitation', invitationSchema);