const express = require ('express');
const mongoose = require ('mongoose');
const morgan = require ('morgan');
const cors = require ('cors');
const http = require ('http'); 
const { Server } = require ('socket.io'); 
const session = require('express-session'); 

const { notFoundError, errorHandler } = require ('./Middleware/error_handler.js');
const congeRoutes = require ('./Features/Conge/routes/congeRoutes.js');
const annuaireRoutes  = require ('./Features/Annuaires/routes/annuairesRoutes.js');
const conventionRoutes  = require ('./Features/Conventions/routes/conventionRoutes.js');
const ecologiqueRoutes  = require ('./Features/Ecologiques/routes/ecologiquesRoutes.js');
const authRoutes  = require ('./Features/Authentification/routes/authRoutes.js');
const userRoutes  = require ('./Features/Authentification/routes/userRoutes.js');
const ideaBoxRoutes  = require ('./Features/BoxDidees/routes/ideaBoxRoutes.js');
const partenariatRoutes  = require ('./Features/Partenariats/routes/partenariatRoutes.js');
const eventCalendarRoutes  = require ('./Features/Event_Clalendar/routes/eventCalendarRoutes.js');
const reviewRoutes  = require ('./Features/Reviews/routes/reviewRoutes.js');
const commentRoutes = require ('./Features/Acceuil/comments/routes/commentRoutes.js');
const likesRoutes = require ('./Features/Acceuil/likes/routes/likesRoutes.js')
const avantageSociauxRoutes = require ('./Features/AvantageSociaux/routes/avantageSociauxRoutes.js')

require('dotenv').config();
require('./Features/Conge/cron/monthlySoldeUpdater.js'); 

const app = express();
const PORT = process.env.PORT || 8080;
const path = require('path');

app.use('/images', express.static(path.join(__dirname, 'Features/Authentification/Public/images')));
app.use('/images', express.static(path.join(__dirname, 'Features/Ecologiques/Public/images')));
app.use('/images', express.static(path.join(__dirname, 'Features/Authentification/Public/images')));

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'a_very_strong_default_secret_key', 
    resave: false, 
    saveUninitialized: true, 
    cookie: { secure: process.env.NODE_ENV === 'production' } 
  })
);
// --- Migration Script Function ---
async function migrateUserSoldeRestant() {
  try {
    const result = await User.updateMany(
      { soldeRestant: { $exists: false } },
      { $set: { soldeRestant: 25 } } 
    );
    console.log(`Migration complete: ${result.nModified} users updated with default soldeRestant.`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

app.use('/', congeRoutes);
app.use('/', annuaireRoutes);
app.use('/', conventionRoutes);
app.use('/', ecologiqueRoutes);
app.use('/api', authRoutes);
app.use('/', userRoutes);
app.use('/', ideaBoxRoutes);
app.use('/', partenariatRoutes);
app.use('/', eventCalendarRoutes);
app.use('/', reviewRoutes);
app.use('/acceuil', commentRoutes);
app.use('/acceuil', likesRoutes);
app.use('/', avantageSociauxRoutes);


const db = require("./Features/Authentification/models/index.js");

db.mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })



// Configurer Socket.IO pour écouter les connexions
/*io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // Écouter les messages envoyés par les utilisateurs
  socket.on('sendMessage', (message) => {
    io.emit('receiveMessage', message);
  });

  // Écouter la demande de fin de discussion
  socket.on('finishDiscussion', (reclamationId) => {
    // Mettre à jour le statut de la réclamation dans la base de données
    // Utiliser la fonction updateReclamationStatus du contrôleur
    // Mettre à jour le statut à "Traitee"
    // Vous devez implémenter cette fonction selon votre logique métier
  });
});*/

// ✅ Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on  ${PORT}`);
});


