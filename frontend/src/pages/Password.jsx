import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Password = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        if (data.devMode && data.resetLink) {
          // Mode développement - redirection automatique
          setSuccess("Mode développement : redirection vers le lien de réinitialisation...");
          setTimeout(() => {
            window.location.href = data.resetLink;
          }, 1500);
        } else {
          setSuccess(data.message || "Un email de réinitialisation a été envoyé à votre adresse.");
        }
      } else {
        setError(data.message || 'Erreur lors de la demande de réinitialisation.');
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
              <i className="fas fa-key"></i>
            </div>
            <h4 className="auth-profile-name">Récupération</h4>
            <p className="auth-profile-role">Mot de passe oublié</p>
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
            <h1 className="auth-title">Mot de passe oublié</h1>
            <p className="auth-subtitle">
              Saisissez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}
            {success && (
              <div className="alert alert-success" role="alert">
                <i className="fas fa-check-circle me-2"></i>
                {success}
              </div>
            )}

            <form onSubmit={handleResetRequest} className="auth-form">
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

              <div className="auth-options">
                <Link to="/login" className="auth-forgot-link">
                  <i className="fas fa-arrow-left me-1"></i>
                  Retour à la connexion
                </Link>
              </div>

              {loading ? (
                <button key="loading-btn" type="button" className="auth-submit-btn" disabled>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Envoi en cours...
                </button>
              ) : (
                <button key="submit-btn" type="submit" className="auth-submit-btn">
                  <i className="fas fa-paper-plane me-2"></i>
                  Envoyer le lien
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

export default Password;
