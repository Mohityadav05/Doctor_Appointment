import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'patient',
    specialization: '', experience: 0, consultationFee: 0,
    age: 0, bloodGroup: ''
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    let data = { ...formData };
    
    // Depending on role, we send different profile data
    if (data.role === 'patient') {
      data = { name: data.name, email: data.email, password: data.password, role: data.role, age: data.age, bloodGroup: data.bloodGroup };
    } else {
      data = { name: data.name, email: data.email, password: data.password, role: data.role, specialization: data.specialization, experience: data.experience, consultationFee: data.consultationFee, availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] }; // Default slots
    }

    const success = await register(data);
    if (success) {
      navigate('/');
    } else {
      setError('Registration failed. Email might exist.');
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
        <h2 className="mb-6 text-center" style={{ fontSize: '2rem' }}>Create Account</h2>
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block' }}>Role</label>
            <select name="role" value={formData.role} onChange={onChange} className="input-field">
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block' }}>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={onChange} className="input-field" required />
          </div>
          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={onChange} className="input-field" required />
          </div>
          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block' }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={onChange} className="input-field" required />
          </div>

          {formData.role === 'doctor' && (
            <>
              <div className="mb-4">
                <label className="text-secondary mb-2" style={{ display: 'block' }}>Specialization</label>
                <input type="text" name="specialization" value={formData.specialization} onChange={onChange} className="input-field" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="mb-4">
                <div>
                  <label className="text-secondary mb-2" style={{ display: 'block' }}>Experience (Yrs)</label>
                  <input type="number" name="experience" value={formData.experience} onChange={onChange} className="input-field" required />
                </div>
                <div>
                  <label className="text-secondary mb-2" style={{ display: 'block' }}>Fee ($)</label>
                  <input type="number" name="consultationFee" value={formData.consultationFee} onChange={onChange} className="input-field" required />
                </div>
              </div>
            </>
          )}

          {formData.role === 'patient' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="mb-4">
              <div>
                <label className="text-secondary mb-2" style={{ display: 'block' }}>Age</label>
                <input type="number" name="age" value={formData.age} onChange={onChange} className="input-field" />
              </div>
              <div>
                <label className="text-secondary mb-2" style={{ display: 'block' }}>Blood Group</label>
                <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={onChange} className="input-field" />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>Register</button>
        </form>
        <p className="mt-4 text-center text-secondary">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
