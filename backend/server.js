const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
};

// Connect to DB immediately on start
connectDB();

// Root route for API confirmation
app.get('/', (req, res) => {
  res.send('Doctor Appointment API is running!');
});

// Routes
// Middleware to ensure DB is connected for all API routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
