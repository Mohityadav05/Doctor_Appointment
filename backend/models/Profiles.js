const mongoose = require('mongoose');

const DoctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  consultationFee: { type: Number, required: true },
  availableSlots: [{ type: String }] // e.g. ['09:00 AM', '10:00 AM', '02:00 PM']
});

const PatientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  age: { type: Number },
  bloodGroup: { type: String },
  medicalHistory: { type: String } // Super secure, only accessible by patient and doctor
});

module.exports = {
  DoctorProfile: mongoose.model('DoctorProfile', DoctorProfileSchema),
  PatientProfile: mongoose.model('PatientProfile', PatientProfileSchema)
};
