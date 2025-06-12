const express = require ('express');
const mongoose = require ('mongoose');
const morgan = require ('morgan');
const cors = require ('cors');
const { notFoundError, errorHandler } = require ('./Middleware/error_handler.js');

const congeRoutes = require ('./Features/Conge/routes/congeRoutes.js');
const annuaireRoutes  = require ('./Features/Annuaires/routes/annuairesRoutes.js');
const conventionRoutes  = require ('./Features/Conventions/routes/conventionRoutes.js');
const ecologiqueRoutes  = require ('./Features/Ecologiques/routes/ecologiquesRoutes.js');

const app = express();
const PORT = process.env.PORT || 8080;
//const hostname = process.env.HOSTNAME;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', congeRoutes);
app.use('/', annuaireRoutes);
app.use('/', conventionRoutes);
app.use('/', ecologiqueRoutes);
/*
// MongoDB Connection
mongoose
  .connect('mongodb://127.0.0.1:27017/AppSalary_MAXIT', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
*/
// ✅ Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


