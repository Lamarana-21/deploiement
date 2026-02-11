import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  
  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // CV upload states
  const [cvFile, setCvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/profile');
      const data = await res.json();
      
      if (data.ok) {
        setProfile(data.profile);
        setFullname(data.profile.fullname);
        setEmail(data.profile.email);
      } else {
        setError(data.message || 'Erreur de chargement');
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email })
      });
      
      const data = await res.json();
      
      if (data.ok) {
        setSuccess('Profil mis à jour avec succès !');
        // Mettre à jour l'affichage local + rafraîchir la session côté frontend
        setProfile((prev) => (prev ? { ...prev, fullname, email } : prev));
        await checkAuth();
      } else {
        setError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit avoir au moins 6 caractères');
      return;
    }
    
    setChangingPassword(true);
    
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      
      if (data.ok) {
        setPasswordSuccess('Mot de passe mis à jour avec succès !');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.message || 'Erreur lors du changement');
      }
    } catch (err) {
      setPasswordError('Erreur réseau');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCvUpload = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      setUploadError('Veuillez sélectionner un fichier.');
      return;
    }

    setUploadError('');
    setUploadSuccess('');
    setUploading(true);

    const formData = new FormData();
    formData.append('cv', cvFile);

    try {
      const res = await fetch('/api/upload/cv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.ok) {
        setUploadSuccess('CV téléversé avec succès !');
        // Refresh profile data to show the new CV link
        fetchProfile();
        // Reset file input visually by clearing the state
        document.getElementById('cvFile').value = null;
        setCvFile(null);
      } else {
        setUploadError(data.message || 'Erreur lors du téléversement.');
      }
    } catch (err) {
      setUploadError('Erreur réseau ou fichier trop volumineux.');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      setAvatarError('Veuillez sélectionner une image.');
      return;
    }

    setAvatarError('');
    setAvatarSuccess('');
    setAvatarUploading(true);

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.ok) {
        setAvatarSuccess('Photo de profil mise à jour !');
        await fetchProfile();
        await checkAuth();
        const input = document.getElementById('avatarFile');
        if (input) input.value = null;
        setAvatarFile(null);
      } else {
        setAvatarError(data.message || 'Erreur lors du téléversement.');
      }
    } catch (err) {
      setAvatarError('Erreur réseau ou fichier trop volumineux.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      student: { class: 'bg-primary', label: 'Étudiant' },
      teacher: { class: 'bg-info', label: 'Enseignant' },
      admin: { class: 'bg-danger', label: 'Administrateur' }
    };
    const badge = badges[role] || { class: 'bg-secondary', label: role };
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h1 className="mb-4">
        <i className="fas fa-user-circle me-2"></i>
        Mon Profil
      </h1>

      <div className="row">
        {/* Carte de profil - Style carte étudiant */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            {/* Bandeau bleu en haut */}
            <div style={{ 
              background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)', 
              height: '8px' 
            }}></div>
            
            <div className="card-body text-center py-4">
              {/* Photo de profil */}
              <div className="mb-3">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Photo de profil"
                    className="border border-3 border-primary"
                    style={{ 
                      width: '120px', 
                      height: '140px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <div 
                    className="bg-secondary text-white d-inline-flex align-items-center justify-content-center"
                    style={{ 
                      width: '120px', 
                      height: '140px', 
                      fontSize: '3rem',
                      borderRadius: '8px'
                    }}
                  >
                    {profile?.fullname?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              
              {/* Nom complet */}
              <h5 className="fw-bold text-dark mb-1" style={{ textTransform: 'uppercase' }}>
                {profile?.fullname}
              </h5>
              
              {/* CIN - Uniquement pour les étudiants */}
              {profile?.role === 'student' && (
                <p className="text-muted mb-2" style={{ fontSize: '0.95rem' }}>
                  <span className="fw-semibold">CIN :</span> {profile?.cin || profile?.email?.split('@')[0].toUpperCase()}
                </p>
              )}
              
              {/* Icônes infos */}
              <div className="d-flex justify-content-center gap-3 mb-3">
                <span title="Email vérifié">
                  <i className="fas fa-envelope text-primary"></i>
                </span>
                <span title="Profil actif">
                  <i className="fas fa-user-check text-success"></i>
                </span>
              </div>
              
              {/* Informations académiques - Uniquement pour les étudiants */}
              {profile?.role === 'student' && (
                <div className="text-center mb-3">
                  <p className="mb-1 text-muted" style={{ fontSize: '0.9rem' }}>
                    {profile?.annee || '2ème année'}
                  </p>
                  <p className="mb-1 fw-semibold text-primary" style={{ fontSize: '0.85rem' }}>
                    {profile?.filiere || 'Développement des Systèmes d\'information'}
                  </p>
                  <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>
                    {profile?.diplome || 'Licence Nationale Technologies de l\'Informatique'}
                  </p>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                    <span className="fw-semibold">Classe:</span> {profile?.classe || 'L2DSI1 G2'}
                  </p>
                </div>
              )}

              {/* Info supplémentaire pour enseignant */}
              {profile?.role === 'teacher' && (
                <div className="text-center mb-3">
                  <p className="mb-1 fw-semibold text-info" style={{ fontSize: '0.9rem' }}>
                    <i className="fas fa-chalkboard-teacher me-2"></i>
                    Encadrant de stages
                  </p>
                </div>
              )}

              {/* Info supplémentaire pour admin */}
              {profile?.role === 'admin' && (
                <div className="text-center mb-3">
                  <p className="mb-1 fw-semibold text-danger" style={{ fontSize: '0.9rem' }}>
                    <i className="fas fa-shield-alt me-2"></i>
                    Gestion de la plateforme
                  </p>
                </div>
              )}
              
              {/* Badge de rôle */}
              <div className="mb-3">
                {getRoleBadge(profile?.role)}
              </div>
              
              {/* Bouton Voir mon profil */}
              <button 
                className="btn btn-primary w-100"
                style={{ 
                  borderRadius: '20px',
                  padding: '10px 20px',
                  fontWeight: '500'
                }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <i className="fas fa-eye me-2"></i>
                Voir mon profil
              </button>
            </div>
            
            {/* Bandeau bleu en bas */}
            <div style={{ 
              background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)', 
              height: '4px' 
            }}></div>
          </div>
          
          {/* Info membre depuis */}
          <div className="card mt-3 shadow-sm">
            <div className="card-body text-center py-3">
              <div className="text-muted small">
                <i className="fas fa-calendar-alt me-2 text-primary"></i>
                Membre depuis {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Formulaires */}
        <div className="col-lg-8">
          {/* Photo de profil */}
          <div className="card mb-4">
            <div className="card-header">
              <i className="fas fa-image me-2"></i>
              Photo de profil
            </div>
            <div className="card-body">
              {avatarError && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {avatarError}
                  <button type="button" className="btn-close" onClick={() => setAvatarError('')}></button>
                </div>
              )}
              {avatarSuccess && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {avatarSuccess}
                  <button type="button" className="btn-close" onClick={() => setAvatarSuccess('')}></button>
                </div>
              )}

              <form onSubmit={handleAvatarUpload}>
                <div className="mb-3">
                  <label htmlFor="avatarFile" className="form-label">
                    {profile && profile.avatar_url ? 'Remplacer la photo (JPG/PNG/WEBP)' : 'Téléverser une photo (JPG/PNG/WEBP)'}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="avatarFile"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                    required
                  />
                  <small className="text-muted">Taille max: 2MB</small>
                </div>
                <button
                  type="submit"
                  className="btn btn-outline-primary"
                  disabled={avatarUploading || !avatarFile}
                >
                  {avatarUploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Téléversement...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload me-2"></i>
                      {profile && profile.avatar_url ? 'Remplacer' : 'Téléverser'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="card mb-4">
            <div className="card-header">
              <i className="fas fa-user-edit me-2"></i>
              Informations personnelles
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}
              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {success}
                  <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
              )}
              
              <form onSubmit={handleProfileUpdate}>
                <div className="mb-3">
                  <label htmlFor="fullname" className="form-label">Nom complet</label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullname"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Adresse email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Rôle</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={profile?.role === 'student' ? 'Étudiant' : profile?.role === 'teacher' ? 'Enseignant' : 'Administrateur'}
                    disabled
                  />
                  <small className="text-muted">Le rôle ne peut être modifié que par un administrateur</small>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* CV Upload */}
          {user && user.role === 'student' && (
            <div className="card mb-4">
              <div className="card-header">
                <i className="fas fa-file-pdf me-2"></i>
                Mon CV
              </div>
              <div className="card-body">
                {uploadError && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {uploadError}
                    <button type="button" className="btn-close" onClick={() => setUploadError('')}></button>
                  </div>
                )}
                {uploadSuccess && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {uploadSuccess}
                    <button type="button" className="btn-close" onClick={() => setUploadSuccess('')}></button>
                  </div>
                )}

                {profile && profile.cv_url && (
                  <div className="mb-3">
                    <p className="mb-1">CV actuel :</p>
                    <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                      <i className="fas fa-eye me-2"></i>
                      Voir mon CV
                    </a>
                  </div>
                )}

                <form onSubmit={handleCvUpload}>
                  <div className="mb-3">
                    <label htmlFor="cvFile" className="form-label">
                      {profile && profile.cv_url ? 'Remplacer le CV (PDF uniquement)' : 'Téléverser un CV (PDF uniquement)'}
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="cvFile"
                      accept=".pdf"
                      onChange={(e) => setCvFile(e.target.files[0])}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-info"
                    disabled={uploading || !cvFile}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Téléversement...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload me-2"></i>
                        {profile && profile.cv_url ? 'Remplacer' : 'Téléverser'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Changement de mot de passe */}
          <div className="card">
            <div className="card-header">
              <i className="fas fa-lock me-2"></i>
              Changer le mot de passe
            </div>
            <div className="card-body">
              {passwordError && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {passwordError}
                  <button type="button" className="btn-close" onClick={() => setPasswordError('')}></button>
                </div>
              )}
              {passwordSuccess && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {passwordSuccess}
                  <button type="button" className="btn-close" onClick={() => setPasswordSuccess('')}></button>
                </div>
              )}
              
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Mot de passe actuel</label>
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <small className="text-muted">Au moins 6 caractères</small>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-warning"
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Changement...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key me-2"></i>
                      Changer le mot de passe
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
