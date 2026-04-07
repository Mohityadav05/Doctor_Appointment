import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <h2 className="mb-6 text-center" style={{ fontSize: '2rem' }}>Welcome Back</h2>
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={onChange} className="input-field" required />
          </div>
          <div className="mb-6">
            <label className="text-secondary mb-2" style={{ display: 'block' }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={onChange} className="input-field" required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login</button>
        </form>
        <p className="mt-4 text-center text-secondary">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
