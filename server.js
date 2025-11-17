// 📦 Core imports
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const session = require('express-session');
require('dotenv').config();

const { notFoundError, errorHandler } = require('./Middleware/error_handler.js');
const path = require('path');

// 🚀 Initialize Express
const app = express();
const PORT = process.env.PORT || 8080;

// 🧱 Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'a_very_strong_default_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

// 🖼️ Static assets
app.use('/images', express.static(path.join(__dirname, 'Features/Authentification/Public/images')));
app.use('/images', express.static(path.join(__dirname, 'Features/Ecologiques/Public/images')));

// 🧩 ROUTES IMPORTS
const congeRoutes = require('./Features/Conge/routes/congeRoutes.js');
const annuaireRoutes = require('./Features/Annuaires/routes/annuairesRoutes.js');
const conventionRoutes = require('./Features/Conventions/routes/conventionRoutes.js');
const ecologiqueRoutes = require('./Features/Ecologiques/routes/ecologiquesRoutes.js');
const authRoutes = require('./Features/Authentification/routes/authRoutes.js');
const userRoutes = require('./Features/Authentification/routes/userRoutes.js');
const ideaBoxRoutes = require('./Features/BoxDidees/routes/ideaBoxRoutes.js');
const partenariatRoutes = require('./Features/Partenariats/routes/partenariatRoutes.js');
const eventCalendarRoutes = require('./Features/Event_Clalendar/routes/eventCalendarRoutes.js');
const reviewRoutes = require('./Features/Reviews/routes/reviewRoutes.js');
const commentRoutes = require('./Features/Acceuil/comments/routes/commentRoutes.js');
const likesRoutes = require('./Features/Acceuil/likes/routes/likesRoutes.js');
const avantageSociauxRoutes = require('./Features/AvantageSociaux/routes/avantageSociauxRoutes.js');
const collectionRoutes = require('./Features/Collections/routes/collectionRoutes');
const invitationRoutes = require('./Features/Collections/routes/invitationRoutes');

// ✅ Import LiveAI - ONLY ONCE
const { liveAIRoutes, initLiveAISocket } = require('./Features/liveAI/index.js');
const SummaryRoutes = require('./Features/Summary/routes/summary.routes.js');

// 🛠️ Register all routes
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
app.use('/collections', collectionRoutes);
app.use('/invitations', invitationRoutes);
///app.use('/', liveAIRoutes); 
app.use('/', SummaryRoutes); 


// 🧠 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 🔄 Monthly cron
require('./Features/Conge/cron/monthlySoldeUpdater.js');

// 🧠 Create HTTP server
const server = http.createServer(app);

// ✅ Initialize LiveAI Socket.IO - ONLY ONCE
console.log('🔧 [SERVER] Initializing Socket.IO server...');
const io = initLiveAISocket(server);

if (!io) {
  console.error('❌ [SERVER] Failed to initialize Socket.IO server');
} else {
  console.log('✅ [SERVER] Socket.IO server initialized successfully');
}

// Add this route to test Socket.IO connectivity
app.get('/socket-io-test', (req, res) => {
  const ioInstance = getIO();
  const activeConnections = ioInstance ? ioInstance.engine.clientsCount : 0;
  
  res.json({
    message: 'Socket.IO Server Test',
    status: ioInstance ? 'running' : 'uninitialized',
    activeConnections: activeConnections,
    timestamp: new Date().toISOString()
  });
});

// ❌ Error Handlers
app.use(notFoundError);
app.use(errorHandler);

// 👂 Start Server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));