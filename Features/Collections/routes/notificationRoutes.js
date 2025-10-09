const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authJwt = require('../../Authentification/middlewares/auth.middleware');

router.get('/', authJwt.verifyToken, notificationController.getUserNotifications);
router.put('/:id/read', authJwt.verifyToken, notificationController.markAsRead);
router.delete('/:id', authJwt.verifyToken, notificationController.deleteNotification);

module.exports = router;