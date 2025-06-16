const User = require('../models/userModels.js');
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
            updatedUser.roles = [userRole._id]; // Use the ObjectId of the user role
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
            const token = req.headers.authorization.split('Bearer ')[1];
            const decodedToken = jwt.verify(token, config.secret);
            const userId = decodedToken.id;
            const user = await User.findById(userId);
            if (user) {
                const userProfile = {
                    name: user.name,
                    firstName: user.firstName,
                    username: user.username,
                    email: user.email,
                    statusUser: user.statusUser,
                    statusCompte: user.statusCompte,
                    modePaiement: user.modePaiement,
                    rib: user.rib
                };
                res.json(userProfile);
            } else {
                res.status(404).json({ message: 'Utilisateur introuvable' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Une erreur est survenue lors de la récupération du profil de l\'utilisateur.' });
        }
    }

    static async updateUserProfile(req, res) {
        try {
            const token = req.headers.authorization.split('Bearer ')[1];
            const decodedToken = jwt.verify(token, config.secret);
            const userId = decodedToken.id;
            const user = await User.findById(userId);
            console.log("find user : ",user)
            const updatedUser = req.body;
            if (!req.body) {
               return res.status(500).json({ message: 'Veuillez saisir les informations nécessaires' });
            }
            console.log(userId)
            if (user) {
                updatedUser.password = bcrypt.hashSync(updatedUser.password, 8);
                const utilisateur = await User.findByIdAndUpdate(userId, updatedUser, { new: true });
               return res.json(utilisateur)
            } else {
                return res.status(404).json({ message: 'Utilisateur introuvable' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Une erreur est survenue lors de la récupération du profil de l\'utilisateur.' });
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
            const users = await User.find({}, 'firstName lastName jobTitle departement roles') // ne retourne que les champs utiles
            .populate('roles', 'name') // si tu veux inclure le rôle (admin/user)
            .exec();

            // Optionnel : grouper par département
            const organigramme = {};

            users.forEach(user => {
            if (!organigramme[user.departement]) {
                organigramme[user.departement] = [];
            }
            organigramme[user.departement].push({
                name: user.firstName + ' ' + user.lastName,
                jobTitle: user.jobTitle,
                role: user.roles.map(r => r.name),
            });
            });

            res.status(200).json(organigramme);
        } catch (error) {
            console.error("Organigramme fetch error:", error);
            res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'organigramme' });
        }
    }
}

module.exports = UserController;