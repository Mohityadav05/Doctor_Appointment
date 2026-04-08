import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default axios params
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
        try {
          const res = await axios.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      const meRes = await axios.get('/auth/me');
      setUser(meRes.data);
      return true;
    } catch (err) {
      console.error(err.response?.data?.msg || err.message);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      const meRes = await axios.get('/auth/me');
      setUser(meRes.data);
      return true;
    } catch (err) {
      console.error(err.response?.data?.msg || err.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
