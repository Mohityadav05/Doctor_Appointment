const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const { PatientProfile } = require('../models/Profiles');
const Appointment = require('../models/Appointment');

// Get patient data securely (Only that patient, or a doctor they have an appointment with)
router.get('/:id', auth, async (req, res) => {
  try {
    const patientId = req.params.id;

    // Direct match (Patient requesting their own data)
    if (req.user.id === patientId && req.user.role === 'patient') {
        const profile = await PatientProfile.findOne({ userId: patientId }).populate('userId', ['name', 'email']);
        return res.json(profile);
    }

    // Doctor requesting: Check if doctor has an appointment with this patient
    if (req.user.role === 'doctor') {
        const appointmentExists = await Appointment.findOne({ doctorId: req.user.id, patientId: patientId });
        if (!appointmentExists) {
            return res.status(403).json({ msg: 'Access denied: You do not have an appointment with this patient.' });
        }
        const profile = await PatientProfile.findOne({ userId: patientId }).populate('userId', ['name', 'email']);
        return res.json(profile);
    }

    return res.status(403).json({ msg: 'Access denied' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update patient profile (Patient only)
router.put('/', auth, async (req, res) => {
    if (req.user.role !== 'patient') return res.status(403).json({ msg: 'Access denied' });
    try {
        const { name, age, bloodGroup, medicalHistory } = req.body;
        
        if (name) {
            await User.findByIdAndUpdate(req.user.id, { name });
        }

        let profile = await PatientProfile.findOne({ userId: req.user.id });
        if (profile) {
            if (age !== undefined) profile.age = age;
            if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
            if (medicalHistory !== undefined) profile.medicalHistory = medicalHistory;
            await profile.save();
        } else {
            profile = new PatientProfile({
                userId: req.user.id,
                age, bloodGroup, medicalHistory
            });
            await profile.save();
        }
        
        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json({ user: updatedUser, profile });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
