const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { DoctorProfile } = require('../models/Profiles');

const { auth, isRole } = require('../middleware/auth');

// Get all doctors with their profiles
router.get('/', async (req, res) => {
  try {
    const doctors = await DoctorProfile.find().populate('userId', ['name', 'email']);
    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await DoctorProfile.findOne({ userId: req.params.id }).populate('userId', ['name', 'email']);
    if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Doctor not found' });
    res.status(500).send('Server Error');
  }
});

// Update doctor profile (Doctor only)
router.put('/', [auth, isRole('doctor')], async (req, res) => {
  try {
    const { name, specialization, experience, consultationFee, availableSlots } = req.body;
    
    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name });
    }

    let profile = await DoctorProfile.findOne({ userId: req.user.id });
    if (profile) {
      if (specialization !== undefined) profile.specialization = specialization;
      if (experience !== undefined) profile.experience = experience;
      if (consultationFee !== undefined) profile.consultationFee = consultationFee;
      if (availableSlots !== undefined) profile.availableSlots = availableSlots;
      await profile.save();
    } else {
      profile = new DoctorProfile({
        userId: req.user.id, specialization, experience, consultationFee, availableSlots
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
