import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    cin: '',
    annee: '',
    filiere: '',
    classe: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      // --- MODIFICATION ICI : URL DIRECTE VERS LE BACKEND RENDER ---
      const res = await fetch('https://lamarana-kepler.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          cin: formData.cin,
          annee: formData.annee,
          filiere: formData.filiere,
          classe: formData.classe
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setSuccess('Compte créé avec succès. Vous allez être redirigé...');
        setTimeout(() => {
          navigate('/login'); // Utilisation de navigate au lieu de window.location
        }, 2000);
      } else {
        setError(data.message || "Échec de l'inscription.");
      }
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setError('Impossible de joindre le serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container auth-container-large">
        {/* Panneau gauche - Profil */}
        <div className="auth-left-panel">
          <div className="auth-brand">
            <i className="fas fa-crown text-warning fs-4"></i>
          </div>
          <div className="auth-profile-section">
            <div className="auth-avatar">
              <i className="fas fa-user-plus"></i>
            </div>
            <h4 className="auth-profile-name">Inscription</h4>
            <p className="auth-profile-role">Rejoignez-nous</p>
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
            <h1 className="auth-title">Créer un compte</h1>
            <p className="auth-subtitle">Remplissez le formulaire pour vous inscrire</p>

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

            <form onSubmit={handleRegister} className="auth-form">
              {/* Nom complet */}
              <div className="auth-input-group">
                <div className="auth-input-icon">
                  <i className="fas fa-user"></i>
                </div>
                <input 
                  type="text" 
                  className="auth-input" 
                  id="fullname"
                  placeholder="Nom complet"
                  value={formData.fullname}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="auth-input-group">
                <div className="auth-input-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <input 
                  type="email" 
                  className="auth-input" 
                  id="email"
                  placeholder="Adresse e-mail"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Rôle */}
              <div className="auth-input-group">
                <div className="auth-input-icon">
                  <i className="fas fa-user-tag"></i>
                </div>
                <select 
                  className="auth-input auth-select" 
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="student">Étudiant</option>
                  <option value="teacher">Enseignant</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              {/* Champs spécifiques aux étudiants */}
              {formData.role === 'student' && (
                <div className="auth-student-fields">
                  <div className="auth-section-title">
                    <i className="fas fa-graduation-cap me-2"></i>
                    Informations académiques
                  </div>
                  
                  {/* CIN */}
                  <div className="auth-input-group">
                    <div className="auth-input-icon">
                      <i className="fas fa-id-card"></i>
                    </div>
                    <input 
                      type="text" 
                      className="auth-input" 
                      id="cin"
                      placeholder="CIN (Carte d'identité nationale)"
                      value={formData.cin}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Année et Classe */}
                  <div className="auth-row">
                    <div className="auth-input-group auth-half">
                      <div className="auth-input-icon">
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                      <select 
                        className="auth-input auth-select" 
                        id="annee"
                        value={formData.annee}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Année d'étude...</option>
                        <option value="1ère année">1ère année</option>
                        <option value="2ème année">2ème année</option>
                        <option value="3ème année">3ème année</option>
                      </select>
                    </div>
                    <div className="auth-input-group auth-half">
                      <div className="auth-input-icon">
                        <i className="fas fa-chalkboard"></i>
                      </div>
                      <input 
                        type="text" 
                        className="auth-input" 
                        id="classe"
                        placeholder="Classe (ex: L2DSI1)"
                        value={formData.classe}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Filière */}
                  <div className="auth-input-group">
                    <div className="auth-input-icon">
                      <i className="fas fa-code-branch"></i>
                    </div>
                    <select 
                      className="auth-input auth-select" 
                      id="filiere"
                      value={formData.filiere}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionner une filière...</option>
                      <option value="Développement des Systèmes d'information">Développement des Systèmes d'information</option>
                      <option value="Réseaux et Systèmes">Réseaux et Systèmes</option>
                      <option value="Multimédia et Web">Multimédia et Web</option>
                      <option value="Intelligence Artificielle">Intelligence Artificielle</option>
                      <option value="Sécurité Informatique">Sécurité Informatique</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Mot de passe */}
              <div className="auth-row">
                <div className="auth-input-group auth-half">
                  <div 
                    className="auth-input-icon auth-toggle-password" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className={`fas ${showPassword ? 'fa-unlock' : 'fa-lock'}`}></i>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="auth-input" 
                    id="password"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="auth-input-group auth-half">
                  <div 
                    className="auth-input-icon auth-toggle-password" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-unlock' : 'fa-lock'}`}></i>
                  </div>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    className="auth-input" 
                    id="confirmPassword"
                    placeholder="Confirmer"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus me-2"></i>
                    Créer mon compte
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>Vous avez déjà un compte ?</p>
              <Link to="/login" className="auth-link">Se connecter</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;