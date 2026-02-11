import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        const from = location.state?.from;
        if (from && typeof from === 'string') {
          window.location.href = from;
        } else {
          const roleRoutes = {
            student: '/student',
            teacher: '/teacher',
            admin: '/admin'
          };
          window.location.href = roleRoutes[result.role] || '/';
        }
      } else {
        setError(result.message || 'Adresse e-mail ou mot de passe incorrect.');
      }
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        {/* Panneau gauche - Profil */}
        <div className="auth-left-panel">
          <div className="auth-brand">
            <i className="fas fa-crown text-warning fs-4"></i>
          </div>
          <div className="auth-profile-section">
            <div className="auth-avatar">
              <i className="fas fa-user-graduate"></i>
            </div>
            <h4 className="auth-profile-name">Bienvenue</h4>
            <p className="auth-profile-role">Plateforme de Stages</p>
          </div>
          <nav className="auth-nav">
            <Link to="/" className="auth-nav-link">
              <i className="fas fa-home me-2"></i>Accueil
            </Link>
            <Link to="/a-propos" className="auth-nav-link">
              <i className="fas fa-info-circle me-2"></i>À propos
            </Link>
            <Link to="/contact" className="auth-nav-link">
              <i className="fas fa-envelope me-2"></i>Contact
            </Link>
          </nav>
        </div>

        {/* Panneau droit - Formulaire */}
        <div className="auth-right-panel">
          <div className="auth-form-container">
            <h1 className="auth-title">Connexion</h1>
            <p className="auth-subtitle">Accédez à votre espace personnel</p>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-input-group">
                <div className="auth-input-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <input 
                  type="email" 
                  className="auth-input" 
                  placeholder="Adresse e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-input-group">
                <div 
                  className="auth-input-icon auth-toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <i className={`fas ${showPassword ? 'fa-unlock' : 'fa-lock'}`}></i>
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="auth-input" 
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="auth-options">
                <label className="auth-checkbox">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Se souvenir de moi
                </label>
                <Link to="/password" className="auth-forgot-link">
                  Mot de passe oublié ?
                </Link>
              </div>

              {loading ? (
                <button key="loading-btn" type="button" className="auth-submit-btn" disabled>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Connexion en cours...
                </button>
              ) : (
                <button key="submit-btn" type="submit" className="auth-submit-btn">
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Se connecter
                </button>
              )}
            </form>

            <div className="auth-footer">
              <p>Vous n'avez pas de compte ?</p>
              <Link to="/register" className="auth-link">Créer un compte</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
