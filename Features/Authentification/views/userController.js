const User = require('../models/user.model.js');
const Role = require('../models/role.model.js');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const emailConfig = require('../config/email.config.js');
const { userConfirmationEmailOptions } = require('../config/emailOptions.config.js');


class UserController {

    static async getAllUsers(req, res) {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: "An error occurred while retrieving users." });
        }
    }

    static async getUserById(req, res) {
        const { id } = req.params;
        User.findById(id)
            .then((user) => {
                if (!user) {
                    res.status(404).json({ message: 'Utilisateur introuvable' });
                } else {
                    res.json(user);
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ message: 'Une erreur est survenue lors de la récupération de l\'utilisateur.' });
            });
    }

    static async confirmUser(req, res) {
        try {
            const { id } = req.params;
            const token = req.headers.authorization.split('Bearer ')[1];
            const decodedToken = jwt.verify(token, config.secret);
            const userId = decodedToken.id;
            const user = await User.findById(userId).populate('roles');
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur introuvable' });
            }

            const hasUserRole = user.roles.some((role) => role.name === 'admin');
            if (!hasUserRole) {
                return res.status(401).json({ error: 'Access Denied' });
            }
            const utilisateur = await User.findByIdAndUpdate(
                id, { statusUser: 'confirmé' }, { new: true }
            );

            // Send confirmation email to the admin
            const transporter = nodemailer.createTransport(emailConfig);

            const mailOptions = userConfirmationEmailOptions(utilisateur);

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: 'Error sending email' });
                }
                console.log('Email sent: ' + info.response);
                res.json({ message: 'User registration successful. Confirmation email sent to admin.' });
            });

            if (utilisateur) {
                res.json(utilisateur);
            } else {
                res.status(404).json({ message: 'Utilisateur introuvable' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Une erreur est survenue lors de la confirmation de l\'utilisateur.' });
        }
    }

    static async blockAccount(req, res) {
        try {
            const { id } = req.params;
            const token = req.headers.authorization.split('Bearer ')[1];
            const decodedToken = jwt.verify(token, config.secret);
            const userId = decodedToken.id;

            const user = await User.findById(userId).populate('roles');
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur introuvable' });
            }

            const hasUserRole = user.roles.some((role) => role.name === 'admin');
            if (!hasUserRole) {
                return res.status(401).json({ error: 'Access Denied' });
            }
            const utilisateur = await User.findByIdAndUpdate(
                id, { statusCompte: 'bloqué' }, { new: true }
            );

            if (utilisateur) {
                res.json(utilisateur);
            } else {
                res.status(404).json({ message: 'Utilisateur introuvable' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Une erreur est survenue lors du blocage du compte de l\'utilisateur.' });
        }
    }

    static async unblockAccount(req, res) {
        try {
            const { id } = req.params;
            const token = req.headers.authorization.split('Bearer ')[1];
            const decodedToken = jwt.verify(token, config.secret);
            const userId = decodedToken.id;

            const user = await User.findById(userId).populate('roles');
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur introuvable' });
            }

            const hasUserRole = user.roles.some((role) => role.name === 'admin');
            if (!hasUserRole) {
                return res.status(401).json({ error: 'Access Denied' });
            }
            const utilisateur = await User.findByIdAndUpdate(
                id, { statusCompte: 'actif' }, { new: true }
            );

            if (utilisateur) {
                res.json(utilisateur);
            } else {
                res.status(404).json({ message: 'Utilisateur introuvable' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Une erreur est survenue lors du blocage du compte de l\'utilisateur.' });
        }
    }

    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const token = req.headers.authorization.split('Bearer ')[1];
            const decodedToken = jwt.verify(token, config.secret);
            const userId = decodedToken.id;

            const user = await User.findById(userId).populate('roles');
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur introuvable' });
            }

            const hasUserRole = user.roles.some((role) => role.name === 'admin');
            if (!hasUserRole) {
                return res.status(401).json({ error: 'Access Denied' });
            }
            const deletedUser = await User.findByIdAndDelete(id);

            if (deletedUser) {
                res.json({ message: 'Utilisateur supprimé avec succès' });
            } else {
                res.status(404).json({ message: 'Utilisateur introuvable' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Une erreur est survenue lors de la suppression de l\'utilisateur.' });
        }
    }

    static async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const token = req.headers.authorization.split('Bearer ')[1];
            const decodedToken = jwt.verify(token, config.secret);
            const userId = decodedToken.id;
            const user = await User.findById(userId).populate('roles');
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur introuvable' });
            }

            const hasUserRole = user.roles.some((role) => role.name === 'admin');
            if (!hasUserRole) {
                return res.status(401).json({ error: 'Access Denied' });
            }
            let userRole = await Role.findOne({ name: 'user' });
            if (req.body.role!==null && req.body.role==='admin'){
                userRole = await Role.findOne({ name: 'admin' });
            }

            const updatedUser = req.body;
            updatedUser.roles = [userRole._id]; 
            const utilisateur = await User.findByIdAndUpdate(id, updatedUser, { new: true });

            if (utilisateur) {
                res.json(utilisateur);
            } else {
                res.status(404).json({ message: 'Utilisateur introuvable' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour de l\'utilisateur.' });
        }
    }

    static async getUserProfile(req, res) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
            }

            const token = authHeader.split("Bearer ")[1];
            if (!token) {
            return res.status(401).json({ message: "Token missing" });
            }

            const decodedToken = jwt.verify(token, config.secret);
            const userId = decodedToken.id;

            const user = await User.findById(userId).lean();
            if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
            }

            const userProfile = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            statusUser: user.statusUser,
            statusCompte: user.statusCompte,
            soldeRestant: user.soldeRestant ,
            };

            res.json(userProfile);
        } catch (error) {
            console.error("getUserProfile error:", error);
            res.status(500).json({ 
            message: "Une erreur est survenue lors de la récupération du profil de l'utilisateur.",
            error: error.message
            });
        }
    }


    // userController.js
    static async updateUserProfile(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
        );

        if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    }

    static async getAllUsersWithRoleUser(req, res) {
        try {
            const token = req.headers.authorization.split('Bearer ')[1];
            const decodedToken = jwt.verify(token, config.secret);
            const userId = decodedToken.id;

            const user = await User.findById(userId).populate('roles');
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur introuvable' });
            }

            const hasUserRole = user.roles.some((role) => role.name === 'admin');
            if (!hasUserRole) {
                return res.status(401).json({ error: 'Access Denied' });
            }

            const role = await Role.findOne({ name: 'user' });
            console.log("role",role.name)
            if (!role) {
                return res.status(404).json({ error: 'Le rôle "user" n\'existe pas.' });
            }
            const users = await User.find({ roles: role._id }).populate('roles');
            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des utilisateurs.' });
        }
    }

    static async getAllAdmins(req, res) {
        try {
            const token = req.headers.authorization.split('Bearer ')[1];
            const decodedToken = jwt.verify(token, config.secret);
            const userId = decodedToken.id;

            const user = await User.findById(userId).populate('roles');
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur introuvable' });
            }

            const hasUserRole = user.roles.some((role) => role.name === 'admin');
            if (!hasUserRole) {
                return res.status(401).json({ error: 'Access Denied' });
            }
            const role = await Role.findOne({ name: 'admin' });
            console.log("role",role.name)

            if (!role) {
                return res.status(404).json({ error: 'Le rôle "user" n\'existe pas.' });
            }
            const users = await User.find({ roles: role._id }).populate('roles');
            console.log("role",users)

            return res.status(200).json(users);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des utilisateurs.' });
        }
    }

   static async getOrganigramme(req, res) {
    try {
        const users = await User.find({}, 'firstName lastName jobTitle departement roles')
        .populate('roles', 'name')
        .exec();

        // Instead of grouping, just create a flat list of user objects.
        const employeeList = users.map(user => ({
            name: user.firstName + ' ' + user.lastName,
            jobTitle: user.jobTitle,
            role: user.roles.map(r => r.name),
            departement: user.departement
        }));

        res.status(200).json(employeeList);
    } catch (error) {
        console.error("Organigramme fetch error:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'organigramme' });
    }
    }

  static async uploadProfilePicture(req, res) {
  try {
    const { userId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const picturePath = `/images/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { picture: picturePath },
      { new: true }
    ).select('-password');

    const fullImageUrl = `${req.protocol}://${req.get('host')}/images/auth/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      pictureUrl: fullImageUrl,
      user: updatedUser
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

}

module.exports = UserController;