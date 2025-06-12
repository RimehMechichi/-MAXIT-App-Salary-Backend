import verifySignUp  from "../middlewares/verifySignUp.js";
import { signup, signin, signout, forgotPassword, resetPassword } from "../controllers/auth.controller.js";



export default function setupAuthRoutes(app) {

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     description: Crée un nouveau compte utilisateur avec les informations fournies.
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'utilisateur.
 *               firstName:
 *                 type: string
 *                 description: Prénom de l'utilisateur.
 *               username:
 *                 type: string
 *                 description: Nom d'utilisateur unique.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email de l'utilisateur.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe de l'utilisateur.
 *               modePaiement:
 *                 type: string
 *                 description: Mode de paiement préféré de l'utilisateur.
 *               rib:
 *                 type: string
 *                 description: Numéro de RIB de l'utilisateur.
 *     responses:
 *       200:
 *         description: Utilisateur inscrit avec succès.
 *       400:
 *         description: Erreur de validation des données de la requête.
 *       409:
 *         description: L'utilisateur existe déjà ou une violation de contrainte.
 *       500:
 *         description: Erreur interne du serveur.
 */

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    signup
  );

  /**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Authentifie un utilisateur avec son nom d'utilisateur et son mot de passe.
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nom d'utilisateur.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe de l'utilisateur.
 *     responses:
 *       200:
 *         description: Connexion réussie. Retourne les informations de l'utilisateur et le token d'authentification.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID de l'utilisateur.
 *                 username:
 *                   type: string
 *                   description: Nom d'utilisateur.
 *                 name:
 *                   type: string
 *                   description: Nom de l'utilisateur.
 *                 firstName:
 *                   type: string
 *                   description: Prénom de l'utilisateur.
 *                 email:
 *                   type: string
 *                   description: Adresse email de l'utilisateur.
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Rôles de l'utilisateur.
 *                 token:
 *                   type: string
 *                   description: Token d'authentification.
 *       401:
 *         description: Identifiants invalides ou compte non confirmé/bloqué.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur interne du serveur.
 */

  app.post("/api/auth/signin", signin);
/**
   * @swagger
   * /api/auth/signout:
   *   post:
   *     summary: Déconnexion d'un utilisateur
   *     tags: [AUTH]
   *     responses:
   *       200:
   *         description: Utilisateur déconnecté avec succès
   *       500:
   *         description: Erreur interne du serveur
   */
  app.post("/api/auth/signout", signout);

  /**
   * @swagger
   * /api/auth/forgot-password:
   *   post:
   *     summary: Mot de passe oublié
   *     tags: [AUTH]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *             example:
   *               email: johndoe@example.com
   *     responses:
   *       200:
   *         description: Email de réinitialisation de mot de passe envoyé
   *       404:
   *         description: Utilisateur non trouvé
   *       500:
   *         description: Erreur interne du serveur
   */
  
  app.post('/api/auth/forgot-password', forgotPassword);

  /**
   * @swagger
   * /api/auth/reset-password:
   *   post:
   *     summary: Réinitialisation du mot de passe
   *     tags: [AUTH]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               resetToken:
   *                 type: string
   *               newPassword:
   *                 type: string
   *             example:
   *               resetToken: your-reset-token
   *               newPassword: yournewpassword
   *     responses:
   *       200:
   *         description: Mot de passe réinitialisé avec succès
   *       400:
   *         description: Token de réinitialisation invalide ou expiré
   *       500:
   *         description: Erreur interne du serveur
   */
  app.post('/api/auth/reset-password', resetPassword);
}
