const CollectionInvitation = require('../models/CollectionInvitation');
const TodoCollection = require('../models/TodoCollection');
const User = require('../../Authentification/models/user.model');
const notificationService = require('./notificationService');

// Create an invitation with expiration
async function sendInvitation(collectionId, email, toUserId, fromUserId, fromUserEmail, fromUserName) {
  console.log('sendInvitation called with:', { collectionId, email, toUserId, fromUserId, fromUserEmail, fromUserName });
  
  const collection = await TodoCollection.findById(collectionId);
  if (!collection) throw new Error('Collection not found');
  
  console.log('🔍 DEBUG: Collection ownership check');
  console.log('Collection createdBy:', collection.createdBy.toString());
  console.log('From User ID:', fromUserId.toString());
  
  // FIX: Check if user is the owner OR a member
  const isOwner = collection.createdBy.toString() === fromUserId.toString();
  const isMember = collection.members.some(m => 
    m.userId.toString() === fromUserId.toString()
  );
  
  console.log('👑 Is owner?:', isOwner);
  console.log('👥 Is member?:', isMember);
  
  if (!isOwner && !isMember) {
    throw new Error('You are not a member of this collection');
  }

  const isAlreadyMember = collection.members.some(m => 
    m.userId.toString() === toUserId.toString()
  );
  if (isAlreadyMember) throw new Error('User is already a member of this collection');

  // FIX: Improved existing invitation check
  const existingInvitation = await CollectionInvitation.findOne({ 
    collectionId, 
    toUserId,
    status: 'pending'
  });
  
  if (existingInvitation) {
    console.log('📨 Found existing invitation:', existingInvitation._id);
    console.log('⏰ Expires at:', existingInvitation.expiresAt);
    console.log('⏰ Current time:', new Date());
    console.log('📮 Is expired?:', existingInvitation.isExpired());
    
    // Check if the existing invitation is expired
    if (existingInvitation.isExpired()) {
      console.log('🔄 Updating expired invitation status');
      existingInvitation.status = 'expired';
      await existingInvitation.save();
      console.log('✅ Expired invitation marked as expired');
    } else {
      console.log('❌ Active pending invitation already exists');
      throw new Error('Invitation already sent to this user');
    }
  }

  // Set expiration (15 minutes from now)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const invitation = new CollectionInvitation({ 
    collectionId, 
    invitedUserEmail: email,
    toUserId,
    fromUserId,
    fromUserEmail,
    fromUserName,
    collectionName: collection.title,
    expiresAt,
    status: 'pending' // Explicitly set status
  });
  
  const savedInvitation = await invitation.save();
  console.log('✅ New invitation saved successfully with ID:', savedInvitation._id);
  console.log('⏰ Expiration:', savedInvitation.expiresAt);

  // Send notification to the invited user
  if (notificationService && notificationService.sendInvitationNotification) {
    await notificationService.sendInvitationNotification(
      toUserId,
      {
        invitationId: savedInvitation._id,
        collectionName: collection.title,
        fromUserName: fromUserName,
        expiresAt: expiresAt
      }
    );
  } else {
    console.log('⚠️ Notification service not available');
  }

  return savedInvitation;
}

// Read all pending invitations for a user (filter out expired)
async function getUserInvitations(email, userId) {
  console.log('getUserInvitations called with:', { email, userId });
  
  // Clean up expired invitations first
  await CollectionInvitation.cleanupExpired();
  
  const invitations = await CollectionInvitation.find({ 
    $or: [
      { invitedUserEmail: email },
      { toUserId: userId }
    ],
    status: 'pending'
  }); // REMOVED: .populate('collectionId', 'title category categoryColor members')
      // REMOVED: .populate('fromUserId', 'firstName lastName email');
  
  const validInvitations = invitations.filter(inv => !inv.isExpired());
  
  console.log('Found valid invitations:', validInvitations.length);
  
  if (validInvitations.length > 0) {
    console.log('📧 Sample invitation structure:', JSON.stringify(validInvitations[0], null, 2));
  }
  
  return validInvitations;
}

async function respondInvitation(invitationId, accept, userId) {
  console.log('respondInvitation called with:', { invitationId, accept, userId });

  const invitation = await CollectionInvitation.findById(invitationId);
  if (!invitation) throw new Error('Invitation not found');

  // Check if invitation is expired
  if (invitation.isExpired()) {
    invitation.status = 'expired';
    await invitation.save();
    throw new Error('This invitation has expired');
  }

  // Verify the user is the intended recipient
  if (invitation.toUserId.toString() !== userId.toString()) {
    throw new Error('You are not authorized to respond to this invitation');
  }

  invitation.status = accept ? 'accepted' : 'rejected';
  await invitation.save();

  if (!accept) {
    return { invitation };
  }

  // ✅ User accepted → update collection membership
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const collection = await TodoCollection.findById(invitation.collectionId);
  if (!collection) throw new Error('Collection not found');

  // Check if user already exists in members
  const memberIndex = collection.members.findIndex(
    (m) => m.userId.toString() === userId.toString()
  );

  if (memberIndex === -1) {
    // ✅ Add as new accepted member
    collection.members.push({
      userId: user._id,
      email: user.email,
      displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      role: 'member',
      status: 'accepted',
      joinedAt: new Date(),
    });
    console.log('✅ New member added to collection:', user.email);
  } else {
    // ✅ Update existing pending member to accepted
    collection.members[memberIndex].status = 'accepted';
    if (!collection.members[memberIndex].role)
      collection.members[memberIndex].role = 'member';
    console.log('🔄 Updated existing member to accepted:', user.email);
  }

  await collection.save();

  // ✅ Notify inviter
  if (notificationService && notificationService.sendInvitationResponseNotification) {
    await notificationService.sendInvitationResponseNotification(invitation.fromUserId, {
      collectionName: invitation.collectionName,
      userName: user.firstName || user.email,
      accepted: true,
    });
  }

  // ✅ Return updated data for frontend refresh
  return {
    invitation,
    collection: await TodoCollection.findById(invitation.collectionId).populate(
      'members.userId',
      'firstName lastName email'
    ),
  };
}


async function removeInvitation(invitationId, userId) {
  console.log('removeInvitation called with:', { invitationId, userId });
  
  const invitation = await CollectionInvitation.findById(invitationId);
  if (!invitation) throw new Error('Invitation not found');

  // Check if user has permission to remove this invitation
  const canRemove = invitation.fromUserId.toString() === userId.toString() || 
                   invitation.toUserId.toString() === userId.toString();
  
  if (!canRemove) throw new Error('You do not have permission to remove this invitation');

  // Mark as cancelled instead of deleting to keep history
  invitation.status = 'cancelled';
  const result = await invitation.save();
  
  console.log('Invitation cancelled:', invitationId);
  return result;
}

// Get invitation details
async function getInvitation(invitationId) {
  return await CollectionInvitation.findById(invitationId)
    .populate('collectionId', 'title category categoryColor')
    .populate('fromUserId', 'firstName lastName email');
}

// Check if invitation is still valid
async function validateInvitation(invitationId) {
  const invitation = await CollectionInvitation.findById(invitationId);
  if (!invitation) return { valid: false, reason: 'Invitation not found' };
  
  if (invitation.isExpired()) {
    invitation.status = 'expired';
    await invitation.save();
    return { valid: false, reason: 'Invitation expired' };
  }
  
  if (invitation.status !== 'pending') {
    return { valid: false, reason: `Invitation already ${invitation.status}` };
  }
  
  return { valid: true, invitation };
}

module.exports = {
  sendInvitation,
  getUserInvitations,
  getInvitation,
  validateInvitation,
  respondInvitation,
  removeInvitation
};