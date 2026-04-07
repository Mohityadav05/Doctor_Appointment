import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Users as UsersIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  ClipboardList,
  PlusCircle,
  Pill,
  Trash2,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';

const EMPTY_MEDICINE = { name: '', dosage: '', frequency: '', duration: '' };

const DoctorDashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientData, setPatientData] = useState(null);

  // Prescription history for the viewed patient
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescLoading, setPrescLoading] = useState(false);

  // Write-prescription form state
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([{ ...EMPTY_MEDICINE }]);
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);

  // Collapsible prescription cards
  const [expandedPrescId, setExpandedPrescId] = useState(null);

  // Profile Edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.user.name,
    specialization: user.profile?.specialization || '',
    experience: user.profile?.experience || '',
    consultationFee: user.profile?.consultationFee || '',
    availableSlots: user.profile?.availableSlots ? user.profile.availableSlots.join(', ') : ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const viewPatientData = async (patientId, appointmentId) => {
    try {
      const res = await axios.get(`/patients/${patientId}`);
      setPatientData(res.data);
      setSelectedPatientId(patientId);
      setActiveAppointmentId(appointmentId);
      setShowForm(false);
      setFormSuccess(false);
      fetchPatientPrescriptions(patientId);
    } catch (err) {
      alert('Error fetching patient data: ' + (err.response?.data?.msg || err.message));
    }
  };

  const fetchPatientPrescriptions = async (patientId) => {
    setPrescLoading(true);
    try {
      const res = await axios.get(`/prescriptions/patient/${patientId}`);
      setPrescriptions(res.data);
    } catch (err) {
      console.error(err);
      setPrescriptions([]);
    } finally {
      setPrescLoading(false);
    }
  };

  const closePatientPanel = () => {
    setPatientData(null);
    setSelectedPatientId(null);
    setActiveAppointmentId(null);
    setPrescriptions([]);
    setShowForm(false);
    setFormSuccess(false);
    resetForm();
  };

  const markComplete = async (appointmentId) => {
    try {
      await axios.patch(`/appointments/${appointmentId}/status`, { status: 'Completed' });
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status: 'Completed' } : a))
      );
    } catch (err) {
      alert('Could not update appointment: ' + (err.response?.data?.msg || err.message));
    }
  };

  // Medicine helpers
  const addMedicine = () => setMedicines([...medicines, { ...EMPTY_MEDICINE }]);
  const removeMedicine = (idx) => setMedicines(medicines.filter((_, i) => i !== idx));
  const updateMedicine = (idx, field, value) => {
    const updated = medicines.map((m, i) => (i === idx ? { ...m, [field]: value } : m));
    setMedicines(updated);
  };

  const resetForm = () => {
    setDiagnosis('');
    setNotes('');
    setMedicines([{ ...EMPTY_MEDICINE }]);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...profileForm,
      availableSlots: profileForm.availableSlots.split(',').map(s => s.trim()).filter(s => s)
    };
    try {
      const res = await axios.put('/doctors', data);
      setUser({ ...user, user: res.data.user, profile: res.data.profile });
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error updating profile');
    }
  };

  const submitPrescription = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) return alert('Diagnosis is required.');
    setFormLoading(true);
    try {
      await axios.post('/prescriptions', {
        patientId: selectedPatientId,
        appointmentId: activeAppointmentId,
        diagnosis,
        medicines: medicines.filter((m) => m.name.trim()),
        notes,
      });
      setFormSuccess(true);
      setShowForm(false);
      resetForm();
      fetchPatientPrescriptions(selectedPatientId);
      // Auto-mark the appointment as Completed once a prescription is written
      if (activeAppointmentId) await markComplete(activeAppointmentId);
    } catch (err) {
      alert('Error saving prescription: ' + (err.response?.data?.msg || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="page-container animate-fade-in dashboard-grid">
      {/* ─── Sidebar ─── */}
      <div className="sidebar">
        {/* Doctor card */}
        <div className="card mb-6" style={{ textAlign: 'center' }}>
          <UserIcon
            size={64}
            color="var(--accent-secondary)"
            style={{ margin: '0 auto', background: 'rgba(139,92,246,0.1)', borderRadius: '50%', padding: '15px' }}
          />
          <h2 className="mt-4">Dr. {user.user.name}</h2>
          <p className="text-secondary">{user.profile?.specialization}</p>
          
          <div className="mt-4" style={{ textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            {!isEditingProfile ? (
              <>
                <p className="mb-2"><strong>Experience:</strong> {user.profile?.experience} Years</p>
                <p className="mb-2"><strong>Fee:</strong> ₹{user.profile?.consultationFee}</p>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '15px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--accent-secondary)' }}
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleProfileSubmit} style={{ textAlign: 'left' }}>
                <div className="mb-2">
                  <label className="text-secondary mb-1" style={{ display: 'block', fontSize: '0.8rem' }}>Name</label>
                  <input type="text" className="input-field" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} style={{ padding: '8px 12px' }} required />
                </div>
                <div className="mb-2">
                  <label className="text-secondary mb-1" style={{ display: 'block', fontSize: '0.8rem' }}>Specialization</label>
                  <input type="text" className="input-field" value={profileForm.specialization} onChange={(e) => setProfileForm({...profileForm, specialization: e.target.value})} style={{ padding: '8px 12px' }} required />
                </div>
                <div className="mb-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="text-secondary mb-1" style={{ display: 'block', fontSize: '0.8rem' }}>Exp (Yrs)</label>
                    <input type="number" className="input-field" value={profileForm.experience} onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})} style={{ padding: '8px 12px' }} required />
                  </div>
                  <div>
                    <label className="text-secondary mb-1" style={{ display: 'block', fontSize: '0.8rem' }}>Fee (₹)</label>
                    <input type="number" className="input-field" value={profileForm.consultationFee} onChange={(e) => setProfileForm({...profileForm, consultationFee: e.target.value})} style={{ padding: '8px 12px' }} required />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-secondary mb-1" style={{ display: 'block', fontSize: '0.8rem' }}>Available Slots (comma separated)</label>
                  <input type="text" className="input-field" value={profileForm.availableSlots} onChange={(e) => setProfileForm({...profileForm, availableSlots: e.target.value})} placeholder="e.g. 10:00 AM, 11:00 AM" style={{ padding: '8px 12px' }} required />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '8px' }}>Save</button>
                  <button type="button" className="btn-primary" style={{ flex: 1, padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({
                      name: user.user.name,
                      specialization: user.profile?.specialization || '',
                      experience: user.profile?.experience || '',
                      consultationFee: user.profile?.consultationFee || '',
                      availableSlots: user.profile?.availableSlots ? user.profile.availableSlots.join(', ') : ''
                    });
                  }}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Patient restricted profile */}
        {patientData && (
          <div className="card" style={{ border: '1px solid var(--accent-primary)' }}>
            <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UsersIcon size={20} color="var(--accent-primary)" /> Restricted Profile
            </h3>
            <p className="mb-2"><strong>Name:</strong> {patientData.userId?.name}</p>
            <p className="mb-2"><strong>Age:</strong> {patientData.age}</p>
            <p className="mb-2"><strong>Blood Grp:</strong> {patientData.bloodGroup}</p>
            {patientData.medicalHistory && (
              <div className="mt-4" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <strong style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>General Notes:</strong>
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>{patientData.medicalHistory}</p>
              </div>
            )}

            {/* Success banner */}
            {formSuccess && (
              <div style={{
                marginTop: '14px', padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#4ade80'
              }}>
                <CheckCircle size={16} /> Prescription saved!
              </div>
            )}

            {/* Write Prescription toggle */}
            {!showForm ? (
              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: '14px' }}
                onClick={() => { setShowForm(true); setFormSuccess(false); }}
              >
                <PlusCircle size={16} /> Write Prescription
              </button>
            ) : (
              <form onSubmit={submitPrescription} style={{ marginTop: '14px' }}>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Diagnosis *
                  </label>
                  <input
                    className="input-field"
                    placeholder="e.g. Viral Fever"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                    style={{ fontSize: '0.9rem', padding: '10px 12px' }}
                  />
                </div>

                {/* Medicines */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    <Pill size={13} style={{ display: 'inline', marginRight: '5px' }} /> Medicines
                  </label>
                  {medicines.map((med, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(15,23,42,0.5)', borderRadius: '10px',
                      padding: '10px', marginBottom: '8px', border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                        <input className="input-field" placeholder="Medicine name" value={med.name}
                          onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                          style={{ fontSize: '0.82rem', padding: '8px 10px' }} />
                        <input className="input-field" placeholder="Dosage (e.g. 500mg)" value={med.dosage}
                          onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                          style={{ fontSize: '0.82rem', padding: '8px 10px' }} />
                        <input className="input-field" placeholder="Frequency" value={med.frequency}
                          onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                          style={{ fontSize: '0.82rem', padding: '8px 10px' }} />
                        <input className="input-field" placeholder="Duration (e.g. 5 days)" value={med.duration}
                          onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                          style={{ fontSize: '0.82rem', padding: '8px 10px' }} />
                      </div>
                      {medicines.length > 1 && (
                        <button type="button" onClick={() => removeMedicine(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addMedicine}
                    style={{ background: 'none', border: '1px dashed var(--border-color)', borderRadius: '8px',
                      width: '100%', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)',
                      fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <PlusCircle size={13} /> Add Medicine
                  </button>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Additional Notes
                  </label>
                  <textarea
                    className="input-field"
                    placeholder="Rest advice, diet, follow-up..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    style={{ fontSize: '0.85rem', padding: '10px 12px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn-primary" disabled={formLoading}
                    style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}>
                    {formLoading ? 'Saving…' : <><CheckCircle size={15} /> Save</>}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                    style={{ flex: 1, padding: '10px', fontSize: '0.9rem', background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
              onClick={closePatientPanel}
            >
              Close
            </button>

            {/* Past Prescriptions */}
            <div style={{ marginTop: '18px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '0.95rem' }}>
                <ClipboardList size={16} color="var(--accent-secondary)" /> Medical History
              </h4>
              {prescLoading ? (
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Loading…</p>
              ) : prescriptions.length === 0 ? (
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>No prescriptions on record.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {prescriptions.map((p) => (
                    <div key={p._id} style={{
                      background: 'rgba(15,23,42,0.5)', borderRadius: '10px',
                      border: '1px solid var(--border-color)', overflow: 'hidden'
                    }}>
                      <button
                        onClick={() => setExpandedPrescId(expandedPrescId === p._id ? null : p._id)}
                        style={{
                          width: '100%', background: 'none', border: 'none', padding: '10px 12px',
                          cursor: 'pointer', color: 'var(--text-primary)', display: 'flex',
                          justifyContent: 'space-between', alignItems: 'center', textAlign: 'left'
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '0.88rem' }}>{p.diagnosis}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                            {formatDate(p.createdAt)}
                          </p>
                        </div>
                        {expandedPrescId === p._id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      {expandedPrescId === p._id && (
                        <div style={{ padding: '0 12px 12px' }}>
                          {p.medicines.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                                <Pill size={12} style={{ display: 'inline', marginRight: '4px' }} /> Medicines
                              </p>
                              {p.medicines.map((m, i) => (
                                <div key={i} style={{
                                  fontSize: '0.8rem', padding: '6px 8px', borderRadius: '6px',
                                  background: 'rgba(59,130,246,0.08)', marginBottom: '4px'
                                }}>
                                  <strong>{m.name}</strong> — {m.dosage}, {m.frequency}, {m.duration}
                                </div>
                              ))}
                            </div>
                          )}
                          {p.notes && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <strong>Notes:</strong> {p.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Main Content ─── */}
      <div className="main-content">
        <div className="card">
          <h2 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon color="var(--accent-secondary)" /> Incoming Appointments
          </h2>
          {appointments.length === 0 ? (
            <p className="text-secondary">No upcoming appointments.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {appointments.map((app) => (
                <div
                  key={app._id}
                  className="glass-panel"
                  style={{
                    padding: '20px', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                    border: selectedPatientId === app.patientId._id
                      ? '1px solid var(--accent-primary)'
                      : '1px solid transparent',
                    transition: 'border 0.3s'
                  }}
                >
                  <div>
                    <h3 className="mb-2">{app.patientId.name}</h3>
                    <p className="text-secondary">
                      <CalendarIcon size={14} style={{ display: 'inline', marginRight: '5px' }} />
                      {app.date} &nbsp;|&nbsp;
                      <Clock size={14} style={{ display: 'inline', marginLeft: '5px', marginRight: '5px' }} />
                      {app.timeSlot}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                      onClick={() => viewPatientData(app.patientId._id, app._id)}
                    >
                      View File
                    </button>
                    {app.status !== 'Completed' && app.status !== 'Cancelled' && (
                      <button
                        className="btn-primary"
                        style={{
                          padding: '8px 16px', fontSize: '0.9rem',
                          background: 'rgba(34,197,94,0.15)',
                          border: '1px solid rgba(34,197,94,0.4)',
                          color: '#4ade80',
                        }}
                        onClick={() => markComplete(app._id)}
                        title="Mark this appointment as Completed"
                      >
                        <CheckCircle2 size={15} /> Complete
                      </button>
                    )}
                    <span className={`status-badge status-${app.status}`}>{app.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
