const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const session = require('express-session');
const path = require('path');

require('dotenv').config();


console.log("🔍 MONGO_URL =", process.env.MONGO_URL);
console.log("🔍 SESSION_SECRET =", process.env.SESSION_SECRET);


const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);


app.use('/images',
  express.static(path.join(__dirname, 'Features/Ecologiques/Public/images'))
);

app.use('/images',
  express.static(path.join(__dirname, 'Features/AvantageSociaux/Public/images'))
);


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

// Register routes
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


if (!process.env.MONGO_URL) {
  console.error("❌ MONGO_URL is missing in .env — server stopped");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });


require('./Features/Conge/cron/monthlySoldeUpdater.js');


app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
