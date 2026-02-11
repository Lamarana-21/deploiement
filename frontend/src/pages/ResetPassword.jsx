import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!email || !token) {
      setError("Lien invalide (e-mail ou jeton manquant)");
    }
  }, [email, token]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess('Mot de passe mis à jour avec succès. Redirection vers la connexion...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        setError(data.message || 'Erreur lors de la mise à jour du mot de passe.');
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
              <i className="fas fa-shield-alt"></i>
            </div>
            <h4 className="auth-profile-name">Sécurité</h4>
            <p className="auth-profile-role">Nouveau mot de passe</p>
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
            <h1 className="auth-title">Réinitialiser le mot de passe</h1>
            <p className="auth-subtitle">
              Créez un nouveau mot de passe sécurisé pour votre compte.
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

            <form onSubmit={handleReset} className="auth-form">
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
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="auth-input-group">
                <div 
                  className="auth-input-icon auth-toggle-password" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-unlock' : 'fa-lock'}`}></i>
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className="auth-input" 
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
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
                  Mise à jour en cours...
                </button>
              ) : (
                <button key="submit-btn" type="submit" className="auth-submit-btn" disabled={!email || !token}>
                  <i className="fas fa-save me-2"></i>
                  Mettre à jour le mot de passe
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

export default ResetPassword;
