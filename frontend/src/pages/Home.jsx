import { Link } from 'react-router-dom';
import { Calendar, Shield, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="page-container animate-fade-in" style={{ textAlign: 'center', padding: '80px 5%' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '20px', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Modern Healthcare Awaits
      </h1>
      <p className="text-secondary" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px' }}>
        Book appointments, manage your health records securely, and connect with top-tier medical professionals.
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '80px' }}>
        <Link to="/register" className="btn-primary">Get Started</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'left' }}>
          <Calendar size={40} color="var(--accent-primary)" className="mb-4" />
          <h3 className="mb-2">Easy Scheduling</h3>
          <p className="text-secondary">Find vacant slots and book appointments with your preferred doctors instantly.</p>
        </div>
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'left' }}>
          <Shield size={40} color="var(--accent-secondary)" className="mb-4" />
          <h3 className="mb-2">Secure Data</h3>
          <p className="text-secondary">Your medical history is encrypted and accessible only by you and authorized doctors.</p>
        </div>
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'left' }}>
          <Users size={40} color="var(--accent-primary)" className="mb-4" />
          <h3 className="mb-2">Role Based</h3>
          <p className="text-secondary">Dedicated dashboards tailored specifically for both patients and healthcare providers.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
