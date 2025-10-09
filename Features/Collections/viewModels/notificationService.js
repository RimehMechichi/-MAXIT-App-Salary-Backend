// services/notificationService.js
const User = require('../../Authentification/models/user.model');
const Notification = require('../models/Notification'); // We'll create this model

class NotificationService {
  
  // Send invitation notification to user
  async sendInvitationNotification(userId, invitationData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log('User not found for notification:', userId);
        return;
      }

      // Create notification in database
      const notification = new Notification({
        userId: userId,
        type: 'invitation',
        title: 'New Collection Invitation',
        message: `You've been invited to join "${invitationData.collectionName}" by ${invitationData.fromUserName}`,
        data: {
          invitationId: invitationData.invitationId,
          collectionName: invitationData.collectionName,
          expiresAt: invitationData.expiresAt
        },
        expiresAt: invitationData.expiresAt // Auto-cleanup
      });

      await notification.save();

      // Here you can integrate with:
      // - Email service (SendGrid, Mailgun, etc.)
      // - Push notifications (Firebase, OneSignal, etc.)
      // - WebSocket for real-time notifications
      // - In-app notifications

      console.log(`Invitation notification sent to user ${userId}`);
      
      // Example: Send email notification
      await this.sendEmailNotification(user.email, {
        subject: `You've been invited to join ${invitationData.collectionName}`,
        message: `Hello ${user.firstName || 'there'}! You've been invited to join the collection "${invitationData.collectionName}" by ${invitationData.fromUserName}. This invitation will expire in 15 minutes.`
      });

    } catch (error) {
      console.error('Error sending invitation notification:', error);
    }
  }

  // Send response notification to inviter
  async sendInvitationResponseNotification(userId, responseData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log('User not found for response notification:', userId);
        return;
      }

      const notification = new Notification({
        userId: userId,
        type: 'invitation_response',
        title: 'Invitation Response',
        message: `${responseData.userName} ${responseData.accepted ? 'accepted' : 'declined'} your invitation to "${responseData.collectionName}"`,
        data: {
          collectionName: responseData.collectionName,
          accepted: responseData.accepted
        }
      });

      await notification.save();

      console.log(`Invitation response notification sent to user ${userId}`);

    } catch (error) {
      console.error('Error sending response notification:', error);
    }
  }

  // Email notification (example implementation)
  async sendEmailNotification(email, emailData) {
    try {
      // Integrate with your email service here
      // Example with nodemailer:
      /*
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: emailData.subject,
        html: this.generateEmailTemplate(emailData)
      });
      */
      
      console.log(`Email notification sent to ${email}: ${emailData.subject}`);
      
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Get user notifications
  async getUserNotifications(userId) {
    try {
      return await Notification.find({ 
        userId: userId,
        expiresAt: { $gt: new Date() } // Only non-expired
      }).sort({ createdAt: -1 }).limit(50);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      await Notification.updateOne(
        { _id: notificationId, userId: userId },
        { read: true, readAt: new Date() }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
}

module.exports = new NotificationService();