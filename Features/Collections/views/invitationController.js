const invitationService = require('../viewModels/invitationService');
const User = require('../../Authentification/models/user.model');

module.exports = {
  sendInvitation: async (req, res) => {
    try {
      const { collectionId } = req.params;
      const { toUserId } = req.body;
      const fromUserId = req.userId;
      
      console.log('Sending invitation:', { collectionId, toUserId, fromUserId });

      const targetUser = await User.findById(toUserId);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const fromUser = await User.findById(fromUserId);
      if (!fromUser) {
        return res.status(404).json({ message: 'Sender user not found' });
      }

      const invitation = await invitationService.sendInvitation(
        collectionId, 
        targetUser.email,
        targetUser._id.toString(),
        fromUserId,
        fromUser.email,
        `${fromUser.firstName || ''} ${fromUser.lastName || ''}`.trim() || fromUser.email
      );
      res.json(invitation);
    } catch (err) {
      console.error('Error sending invitation:', err);
      res.status(400).json({ message: err.message });
    }
  },

  respondInvitation: async (req, res) => {
    try {
      const { invitationId, accept } = req.body;
      const userId = req.userId;
      
      console.log('Responding to invitation:', { invitationId, accept, userId });
      
      const result = await invitationService.respondInvitation(invitationId, accept, userId);
      
      if (accept && result.collection) {
        res.json({
          invitation: result.invitation,
          collection: result.collection,
          message: 'Successfully joined the collection'
        });
      } else {
        res.json({
          invitation: result.invitation,
          message: accept ? 'Invitation accepted' : 'Invitation declined'
        });
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);
      res.status(400).json({ message: err.message });
    }
  },

  removeInvitation: async (req, res) => {
    try {
      const { invitationId } = req.params;
      const userId = req.userId;
      
      console.log('Removing invitation:', { invitationId, userId });
      
      const result = await invitationService.removeInvitation(invitationId, userId);
      res.json({ message: 'Invitation removed successfully', result });
    } catch (err) {
      console.error('Error removing invitation:', err);
      res.status(400).json({ message: err.message });
    }
  },

  getUserInvitations: async (req, res) => {
    try {
      const userId = req.userId;
      console.log('Getting invitations for user:', userId);
      
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const invitations = await invitationService.getUserInvitations(user.email, userId);
      res.json(invitations);
    } catch (err) {
      console.error('Error getting user invitations:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // NEW: Get sent invitations (for collection owners to see what they've sent)
  getSentInvitations: async (req, res) => {
    try {
      const { collectionId } = req.params;
      const userId = req.userId;
      
      console.log('Getting sent invitations for collection:', { collectionId, userId });
      
      const invitations = await invitationService.getSentInvitations(collectionId, userId);
      res.json(invitations);
    } catch (err) {
      console.error('Error getting sent invitations:', err);
      res.status(500).json({ message: err.message });
    }
  }
};