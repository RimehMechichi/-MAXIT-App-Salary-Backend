const express = require('express');
const authJwt = require('../middlewares/authJwt');
const UserController = require('../views/userController');
const { uploadSingleImage } = require('../middlewares/multer-config'); 

const router = express.Router();

router.get('/all',  UserController.getAllUsers);
router.get('/allUsers', [authJwt.verifyToken], UserController.getAllUsers);
router.get('/allAdmins', [authJwt.verifyToken], UserController.getAllAdmins);
router.get('/getUserProfile', [authJwt.verifyToken], UserController.getUserProfile);
router.put('/update/:id', [authJwt.verifyToken], UserController.updateUserProfile);
router.put('/confirm/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.confirmUser);
router.put('/block/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.blockAccount);
router.put('/unblock/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.unblockAccount);
router.delete('/delete/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.deleteUser);
router.get('/user/:id', [authJwt.verifyToken], UserController.getUserById);
router.put('/upload-profile-picture/:userId', 
  [authJwt.verifyToken], 
  uploadSingleImage, 
  UserController.uploadProfilePicture
);
//organigramme
router.get('/organigramme', [authJwt.verifyToken], UserController.getOrganigramme);
router.post('/sendInvite', async (req, res) => {
  const { email, collectionName, shareCode } = req.body;
  try {
    // Use nodemailer
    await transporter.sendMail({
      from: '"My App" <no-reply@myapp.com>',
      to: email,
      subject: 'You are invited!',
      text: `You have been invited to "${collectionName}". Join with code: ${shareCode}`,
    });
    res.status(200).json({ message: 'Email sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});


module.exports = router;