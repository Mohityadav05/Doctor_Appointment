import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const onLogout = () => {
    logout();
  };

  return (
    <nav className="nav-bar">
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 'bold' }}>
        <Activity color="var(--accent-primary)" size={28} />
        <span>MediConnect</span>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to={`/${user.user.role}/dashboard`}>Dashboard</Link>
            <a href="#!" onClick={onLogout}>Logout</a>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
