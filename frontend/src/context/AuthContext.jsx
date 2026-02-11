import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Au démarrage, on demande au serveur "Qui suis-je ?" via la session
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('https://lamarana-kepler.onrender.com/api/auth/me', {
        credentials: 'include', // Indispensable pour envoyer le cookie de session
      });
      const data = await response.json();
      
      if (data.ok && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('https://lamarana-kepler.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Indispensable pour recevoir le cookie de session
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      // Ici on vérifie 'data.ok' car c'est ce que ton backend renvoie
      if (response.ok && data.ok) {
        setUser(data.user);
        return { success: true, role: data.user.role };
      }
      
      return { success: false, message: data.message || 'Identifiants incorrects' };
    } catch (error) {
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  };

  const logout = async () => {
    try {
      await fetch('https://lamarana-kepler.onrender.com/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};