const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const app = express();

app.use(express.json());
app.use('/api', userRoutes);

mongoose.connect('mongodb://localhost:27017/AppSalary_MAXIT')
  .then(() => app.listen(3000, () => console.log('Server running')))
  .catch(err => console.log(err));
