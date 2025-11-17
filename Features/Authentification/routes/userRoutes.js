const express = require('express');
const authJwt = require('../middlewares/authJwt');
const UserController = require('../views/userController');

const router = express.Router();

router.get('/all', [authJwt.verifyToken, authJwt.isAdmin], UserController.getAllUsers);
router.get('/allUsers', [authJwt.verifyToken, authJwt.isAdmin], UserController.getAllUsersWithRoleUser);
router.get('/allAdmins', [authJwt.verifyToken, authJwt.isAdmin], UserController.getAllAdmins);
router.get('/getUserProfile', [authJwt.verifyToken], UserController.getUserProfile);
router.put('/update/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.updateUserRole);
router.put('/confirm/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.confirmUser);
router.put('/block/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.blockAccount);
router.put('/unblock/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.unblockAccount);
router.delete('/delete/:id', [authJwt.verifyToken, authJwt.isAdmin], UserController.deleteUser);
router.get('/user/:id', [authJwt.verifyToken], UserController.getUserById);

//organigramme
router.get('/organigramme', [authJwt.verifyToken], UserController.getOrganigramme);


module.exports = router;
