const express = require('express');
const router = express.Router();
const invitationController = require('../views/invitationController');
const authJwt = require('../../Authentification/middlewares/auth.middleware');

router.post('/invite/:collectionId', authJwt.verifyToken, invitationController.sendInvitation);
router.post('/respond', authJwt.verifyToken, invitationController.respondInvitation);
router.delete('/:invitationId', authJwt.verifyToken, invitationController.removeInvitation);
router.get('/', authJwt.verifyToken, invitationController.getUserInvitations);
router.get('/sent/:collectionId', authJwt.verifyToken, invitationController.getSentInvitations);

module.exports = router;