const express = require('express');
const mongoose = require('mongoose');
const congeRoutes = require('./Features/Conge/routes/congeRoutes.js');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use('/api', congeRoutes);

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

// ✅ Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
