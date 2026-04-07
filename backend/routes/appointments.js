const express = require('express');
const router = express.Router();
const { auth, isRole } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const { DoctorProfile } = require('../models/Profiles');

// Book appointment (Patient)
router.post('/', [auth, isRole('patient')], async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;
    
    // Check if slot is already booked
    const existing = await Appointment.findOne({ doctorId, date, timeSlot, status: { $ne: 'Cancelled' } });
    if (existing) {
      return res.status(400).json({ msg: 'Time slot already booked' });
    }

    const newAppointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      date,
      timeSlot
    });

    const appointment = await newAppointment.save();
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get my appointments
router.get('/', auth, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patientId: req.user.id })
        .populate('doctorId', ['name', 'email'])
        .sort({ date: -1 });
    } else {
      appointments = await Appointment.find({ doctorId: req.user.id })
        .populate('patientId', ['name', 'email'])
        .sort({ date: -1 });
    }
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get vacant slots for a doctor on a given date
router.get('/vacant/:doctorId/:date', async (req, res) => {
  try {
    const doctor = await DoctorProfile.findOne({ userId: req.params.doctorId });
    if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

    const bookedAppointments = await Appointment.find({
      doctorId: req.params.doctorId,
      date: req.params.date,
      status: { $nin: ['Cancelled', 'Completed'] }  // freed-up slots are bookable again
    });

    const bookedSlots = bookedAppointments.map(app => app.timeSlot);
    const vacantSlots = doctor.availableSlots.filter(slot => !bookedSlots.includes(slot));

    res.json(vacantSlots);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update appointment status (Doctor only)
router.patch('/:id/status', [auth, isRole('doctor')], async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Confirmed', 'Completed', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

    // Only the assigned doctor may update
    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied: Not your appointment' });
    }

    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
