const express = require('express');
const authJwt = require('../middlewares/authJwt');
const UserController = require('../views/userController');
const { uploadSingleImage } = require('../middlewares/multer-config'); 

const router = express.Router();

router.get('/all',  UserController.getAllUsers);
router.get('/allUsers', [authJwt.verifyToken, authJwt.isAdmin], UserController.getAllUsersWithRoleUser);
router.get('/allAdmins', [authJwt.verifyToken, authJwt.isAdmin], UserController.getAllAdmins);
router.get('/getUserProfile', [authJwt.verifyToken], UserController.getUserProfile);
router.put('/update/:id', [authJwt.verifyToken], UserController.updateUserProfile);
router.put('/confirm/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.confirmUser);
router.put('/block/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.blockAccount);
router.put('/unblock/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.unblockAccount);
router.delete('/delete/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.deleteUser);
router.get('/user/:id', [authJwt.verifyToken], UserController.getUserById);
router.put('/upload-profile-picture/:userId', 
  [authJwt.verifyToken], // Add authentication
  uploadSingleImage, 
  UserController.uploadProfilePicture
);
//organigramme
router.get('/organigramme', [authJwt.verifyToken], UserController.getOrganigramme);


module.exports = router;