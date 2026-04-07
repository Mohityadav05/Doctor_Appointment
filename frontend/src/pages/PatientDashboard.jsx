import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Activity,
  User as UserIcon,
  ClipboardList,
  Pill,
  ChevronDown,
  ChevronUp,
  Stethoscope,
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [vacantSlots, setVacantSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescLoading, setPrescLoading] = useState(true);
  const [expandedPrescId, setExpandedPrescId] = useState(null);

  // Profile Edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.user.name,
    age: user.profile?.age || '',
    bloodGroup: user.profile?.bloodGroup || ''
  });

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) fetchVacantSlots();
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVacantSlots = async () => {
    try {
      const res = await axios.get(`/appointments/vacant/${selectedDoctor}/${selectedDate}`);
      setVacantSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrescriptions = async () => {
    setPrescLoading(true);
    try {
      const patientId = user.user._id;
      const res = await axios.get(`/prescriptions/patient/${patientId}`);
      setPrescriptions(res.data);
    } catch (err) {
      console.error(err);
      setPrescriptions([]);
    } finally {
      setPrescLoading(false);
    }
  };

  const bookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot)
      return alert('Please select all fields');
    try {
      await axios.post('/appointments', {
        doctorId: selectedDoctor,
        date: selectedDate,
        timeSlot: selectedSlot,
      });
      alert('Appointment booked successfully!');
      fetchAppointments();
      fetchVacantSlots();
      setSelectedSlot('');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error booking appointment');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/patients', profileForm);
      setUser({ ...user, user: res.data.user, profile: res.data.profile });
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error updating profile');
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="page-container animate-fade-in dashboard-grid">
      {/* ─── Sidebar ─── */}
      <div className="sidebar">
        <div className="card mb-6" style={{ textAlign: 'center' }}>
          <UserIcon
            size={64}
            color="var(--accent-primary)"
            style={{
              margin: '0 auto',
              background: 'rgba(59,130,246,0.1)',
              borderRadius: '50%',
              padding: '15px',
            }}
          />
          <h2 className="mt-4">{user.user.name}</h2>
          <p className="text-secondary">Patient Profile</p>
          
          <div className="mt-4" style={{ textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            {!isEditingProfile ? (
              <>
                <p className="mb-2"><strong>Email:</strong> {user.user.email}</p>
                {user.profile && (
                  <>
                    <p className="mb-2"><strong>Age:</strong> {user.profile.age || 'N/A'}</p>
                    <p className="mb-2"><strong>Blood Group:</strong> {user.profile.bloodGroup || 'N/A'}</p>
                  </>
                )}
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '15px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--accent-primary)' }}
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleProfileSubmit}>
                <div className="mb-2">
                  <label className="text-secondary mb-1" style={{ display: 'block', fontSize: '0.8rem' }}>Name</label>
                  <input type="text" className="input-field" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} style={{ padding: '8px 12px' }} required />
                </div>
                <div className="mb-2">
                  <label className="text-secondary mb-1" style={{ display: 'block', fontSize: '0.8rem' }}>Age</label>
                  <input type="number" className="input-field" value={profileForm.age} onChange={(e) => setProfileForm({...profileForm, age: e.target.value})} style={{ padding: '8px 12px' }} />
                </div>
                <div className="mb-4">
                  <label className="text-secondary mb-1" style={{ display: 'block', fontSize: '0.8rem' }}>Blood Group</label>
                  <input type="text" className="input-field" value={profileForm.bloodGroup} onChange={(e) => setProfileForm({...profileForm, bloodGroup: e.target.value})} style={{ padding: '8px 12px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '8px' }}>Save</button>
                  <button type="button" className="btn-primary" style={{ flex: 1, padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({
                      name: user.user.name,
                      age: user.profile?.age || '',
                      bloodGroup: user.profile?.bloodGroup || ''
                    });
                  }}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="main-content">
        {/* Book Appointment */}
        <div className="card mb-6">
          <h2
            className="mb-4"
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <CalendarIcon color="var(--accent-primary)" /> Book an Appointment
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            <div>
              <label
                className="text-secondary mb-2"
                style={{ display: 'block' }}
              >
                Select Doctor
              </label>
              <select
                className="input-field"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="">Select a Doctor...</option>
                {doctors.map((d) => (
                  <option key={d.userId._id} value={d.userId._id}>
                    {d.userId.name} — {d.specialization}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-secondary mb-2"
                style={{ display: 'block' }}
              >
                Select Date
              </label>
              <input
                type="date"
                className="input-field"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {selectedDoctor && selectedDate && (
            <div className="mt-6">
              <label className="text-secondary mb-4" style={{ display: 'block' }}>
                All Available Slots
              </label>
              {(() => {
                const doctorObj = doctors.find((d) => d.userId._id === selectedDoctor);
                const allSlots = doctorObj?.availableSlots || [];
                if (allSlots.length === 0)
                  return <p className="text-secondary">This doctor has no slots configured.</p>;
                return (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {allSlots.map((slot) => {
                      const isVacant = vacantSlots.includes(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          className="btn-primary"
                          disabled={!isVacant}
                          onClick={() => isVacant && setSelectedSlot(slot)}
                          style={{
                            padding: '10px 18px',
                            fontSize: '0.88rem',
                            position: 'relative',
                            background: isSelected
                              ? 'var(--gradient-primary)'
                              : isVacant
                              ? 'rgba(59,130,246,0.08)'
                              : 'rgba(15,23,42,0.5)',
                            border: isSelected
                              ? '1px solid var(--accent-primary)'
                              : isVacant
                              ? '1px solid rgba(59,130,246,0.35)'
                              : '1px solid rgba(255,255,255,0.06)',
                            color: isSelected
                              ? '#fff'
                              : isVacant
                              ? 'var(--text-primary)'
                              : 'var(--text-secondary)',
                            cursor: isVacant ? 'pointer' : 'not-allowed',
                            opacity: isVacant ? 1 : 0.55,
                            flexDirection: 'column',
                            gap: '3px',
                            alignItems: 'center',
                          }}
                          title={isVacant ? 'Click to select' : 'Already booked'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} /> {slot}
                          </div>
                          {!isVacant && (
                            <span style={{ fontSize: '0.68rem', opacity: 0.8, marginTop: '2px' }}>Booked</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          <div className="mt-6">
            <button
              className="btn-primary"
              onClick={bookAppointment}
              disabled={!selectedSlot}
            >
              Confirm Booking
            </button>
          </div>
        </div>

        {/* My Appointments */}
        <div className="card mb-6">
          <h2
            className="mb-4"
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Activity color="var(--accent-secondary)" /> My Appointments
          </h2>
          {appointments.length === 0 ? (
            <p className="text-secondary">No appointments found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {appointments.map((app) => (
                <div
                  key={app._id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h3 className="mb-2">Dr. {app.doctorId.name}</h3>
                    <p className="text-secondary">
                      <CalendarIcon
                        size={14}
                        style={{ display: 'inline', marginRight: '5px' }}
                      />
                      {app.date} &nbsp;|&nbsp;
                      <Clock
                        size={14}
                        style={{
                          display: 'inline',
                          marginLeft: '5px',
                          marginRight: '5px',
                        }}
                      />
                      {app.timeSlot}
                    </p>
                  </div>
                  <div>
                    <span className={`status-badge status-${app.status}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Medical History & Prescriptions ─── */}
        <div className="card">
          <h2
            className="mb-4"
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <ClipboardList color="var(--accent-primary)" /> Medical History &amp; Prescriptions
          </h2>

          {prescLoading ? (
            <p className="text-secondary">Loading your prescriptions…</p>
          ) : prescriptions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                borderRadius: '12px',
                background: 'rgba(15,23,42,0.4)',
                border: '1px dashed var(--border-color)',
              }}
            >
              <ClipboardList
                size={40}
                color="var(--text-secondary)"
                style={{ margin: '0 auto 12px' }}
              />
              <p className="text-secondary">No prescriptions on record yet.</p>
              <p
                className="text-secondary"
                style={{ fontSize: '0.85rem', marginTop: '6px' }}
              >
                Prescriptions written by your doctor will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {prescriptions.map((p) => (
                <div
                  key={p._id}
                  style={{
                    borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(15,23,42,0.5)',
                    overflow: 'hidden',
                    transition: 'border-color 0.3s',
                  }}
                >
                  {/* Header row — always visible */}
                  <button
                    onClick={() =>
                      setExpandedPrescId(
                        expandedPrescId === p._id ? null : p._id
                      )
                    }
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: 'rgba(59,130,246,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Stethoscope size={20} color="var(--accent-primary)" />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '1rem' }}>
                          {p.diagnosis}
                        </p>
                        <p
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            marginTop: '3px',
                          }}
                        >
                          Dr. {p.doctorId?.name} &nbsp;·&nbsp;{' '}
                          {formatDate(p.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          background: 'rgba(139,92,246,0.15)',
                          color: 'var(--accent-secondary)',
                          fontWeight: '600',
                        }}
                      >
                        {p.medicines.length} med
                        {p.medicines.length !== 1 ? 's' : ''}
                      </span>
                      {expandedPrescId === p._id ? (
                        <ChevronUp size={18} color="var(--text-secondary)" />
                      ) : (
                        <ChevronDown size={18} color="var(--text-secondary)" />
                      )}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {expandedPrescId === p._id && (
                    <div
                      style={{
                        padding: '0 20px 20px',
                        borderTop: '1px solid var(--border-color)',
                        animation: 'fadeIn 0.2s ease-out',
                      }}
                    >
                      {/* Medicines table */}
                      {p.medicines.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                          <p
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              color: 'var(--text-secondary)',
                              marginBottom: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Pill size={14} /> Prescribed Medicines
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {p.medicines.map((m, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                  gap: '8px',
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  background: 'rgba(59,130,246,0.07)',
                                  border: '1px solid rgba(59,130,246,0.15)',
                                  fontSize: '0.85rem',
                                  alignItems: 'center',
                                }}
                              >
                                <span style={{ fontWeight: '600' }}>{m.name}</span>
                                <span className="text-secondary">{m.dosage}</span>
                                <span className="text-secondary">{m.frequency}</span>
                                <span className="text-secondary">{m.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {p.notes && (
                        <div
                          style={{
                            marginTop: '14px',
                            padding: '12px 14px',
                            borderRadius: '10px',
                            background: 'rgba(139,92,246,0.07)',
                            border: '1px solid rgba(139,92,246,0.15)',
                          }}
                        >
                          <p
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              color: 'var(--accent-secondary)',
                              marginBottom: '5px',
                            }}
                          >
                            Doctor's Notes
                          </p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {p.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
