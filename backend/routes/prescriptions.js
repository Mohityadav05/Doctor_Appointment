const express = require('express');
const router = express.Router();
const { auth, isRole } = require('../middleware/auth');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Create a prescription (Doctor only)
router.post('/', [auth, isRole('doctor')], async (req, res) => {
  try {
    const { patientId, appointmentId, diagnosis, medicines, notes } = req.body;

    const newPrescription = new Prescription({
      patientId,
      doctorId: req.user.id,
      appointmentId,
      diagnosis,
      medicines,
      notes
    });

    const prescription = await newPrescription.save();
    res.json(prescription);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get prescriptions for a specific patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Authorization check
    // 1. If user is patient, ensure they are requesting their own records
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ msg: 'Access denied: You can only view your own records' });
    }

    // 2. If user is doctor, ensure they have at least one appointment with this patient
    if (req.user.role === 'doctor') {
      const appointmentExists = await Appointment.findOne({ doctorId: req.user.id, patientId: patientId });
      if (!appointmentExists) {
        return res.status(403).json({ msg: 'Access denied: You do not have an appointment with this patient' });
      }
    }

    // Fetch the prescriptions
    const prescriptions = await Prescription.find({ patientId: patientId })
      .populate('doctorId', ['name', 'email'])
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
