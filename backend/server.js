const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Enable Mongoose debugging
mongoose.set('debug', true);

console.log('--- MongoDB Connection Attempt ---');
if (!process.env.MONGO_URI) {
  console.error('❌ CRITICAL: MONGO_URI is NOT defined in Environment Variables!');
} else {
  console.log('URI found, attempting connection...');
}

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Fail after 5 seconds instead of hanging
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('Error Code:', err.code);
    if (process.env.MONGO_URI) {
      console.log('Using URI starting with:', process.env.MONGO_URI.substring(0, 15) + '...');
    }
  });

// Diagnostic Route
app.get('/api/test-db', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      return res.json({ status: 'success', message: 'Already connected to MongoDB!' });
    }
    
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    res.json({ status: 'success', message: 'Dynamically connected to MongoDB!' });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: err.message,
      code: err.code,
      uri_preview: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) + '...' : 'UNDEFINED'
    });
  }
});

// Default route for Vercel
app.get('/', (req, res) => {
  res.send('Doctor Appointment API is running!');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
