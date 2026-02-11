import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function TeacherProposalForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  const [charCount, setCharCount] = useState({ description: 0, remark: 0 });
  
  useEffect(() => {
    console.log(`Current step is now: ${step}`);
  }, [step]);

  // Extraire nom et prénom du fullname
  const getNameParts = (fullname) => {
    if (!fullname) return { firstName: '', lastName: '' };
    const parts = fullname.trim().split(' ');
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    return { 
      firstName: parts[0], 
      lastName: parts.slice(1).join(' ') 
    };
  };

  const nameParts = getNameParts(user?.fullname);

  const [formData, setFormData] = useState({
    teacher_name: nameParts.lastName,
    teacher_surname: nameParts.firstName,
    subject_title: '',
    host_company: '',
    description: '',
    remark: '',
    email_sent: false,
  });

  // Mettre à jour le formulaire si l'utilisateur change
  useEffect(() => {
    if (user) {
      const parts = getNameParts(user.fullname);
      setFormData(prev => ({
        ...prev,
        teacher_name: parts.lastName || prev.teacher_name,
        teacher_surname: parts.firstName || prev.teacher_surname,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Compteur de caractères
    if (name === 'description' || name === 'remark') {
      setCharCount(prev => ({ ...prev, [name]: value.length }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.ok) {
        const msg = data.updated
          ? 'Proposition mise à jour avec succès !'
          : 'Proposition soumise avec succès !';
        setSuccess(msg);
        setTimeout(() => {
          navigate('/teacher', {
            state: {
              successMessage: data.updated
                ? 'Proposition mise à jour avec succès !'
                : 'Proposition soumise avec succès ! L\'administration a été notifiée.',
            },
          });
        }, 1500);
      } else {
        // 409: l'enseignant a déjà une proposition active
        if (response.status === 409 && data?.existingId) {
          setError((data.message || "Vous avez déjà une proposition en cours.") + ' Redirection vers l\'édition...');
          setTimeout(() => {
            navigate(`/teacher/proposals/${data.existingId}/edit`);
          }, 1200);
        } else {
          setError(data.message || 'Erreur lors de la soumission');
        }
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Validation étape 1
    if (step === 1) {
      if (!formData.subject_title || formData.subject_title.trim() === '') {
        setError('Veuillez renseigner l\'intitulé du sujet');
        return;
      }
    }

    setError('');
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const getStepIcon = (stepNum) => {
    if (step > stepNum) return <i className="fas fa-check"></i>;
    return stepNum;
  };

  return (
    <div>
      {/* En-tête avec gradient */}
      <div className="proposal-header mb-4">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <h1 className="proposal-title">
              <i className="fas fa-lightbulb text-warning me-3"></i>
              Proposition de Sujet de Stage
            </h1>
            <p className="proposal-subtitle mb-0">
              Proposez un nouveau sujet de stage pour les étudiants de l'établissement
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <div className="teacher-badge">
              <i className="fas fa-chalkboard-teacher me-2"></i>
              {user?.fullname}
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div className="step-indicator mb-4">
        <div className="step-progress">
          <div className="step-progress-bar" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        </div>
        <div className="steps-container">
          <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">{getStepIcon(1)}</div>
            <span className="step-label">Informations</span>
          </div>
          <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">{getStepIcon(2)}</div>
            <span className="step-label">Détails</span>
          </div>
          <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
            <div className="step-circle">{getStepIcon(3)}</div>
            <span className="step-label">Confirmation</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success d-flex align-items-center" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Étape 1: Informations de base */}
        <div className={`step-content ${step === 1 ? 'active' : ''}`} style={{ display: step === 1 ? 'block' : 'none' }}>
          <div className="row">
            {/* Carte Enseignant */}
            <div className="col-lg-4 mb-4">
              <div className="card proposal-card h-100">
                <div className="card-header bg-gradient-primary text-white">
                  <i className="fas fa-user-tie me-2"></i>
                  Profil Enseignant
                </div>
                <div className="card-body text-center py-4">
                  <div className="teacher-avatar mb-3">
                    <i className="fas fa-chalkboard-teacher"></i>
                  </div>
                  <h5 className="mb-1">{formData.teacher_surname} {formData.teacher_name}</h5>
                  <p className="text-muted mb-3">{user?.email}</p>
                  <span className="badge bg-primary-soft text-primary">
                    <i className="fas fa-check-circle me-1"></i>
                    Enseignant vérifié
                  </span>
                </div>
              </div>
            </div>

            {/* Carte Sujet */}
            <div className="col-lg-8 mb-4">
              <div className="card proposal-card h-100">
                <div className="card-header bg-gradient-info text-white">
                  <i className="fas fa-file-alt me-2"></i>
                  Informations du Sujet
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <label htmlFor="subject_title" className="form-label fw-semibold">
                      <i className="fas fa-heading text-primary me-2"></i>
                      Intitulé du sujet <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="subject_title"
                      name="subject_title"
                      value={formData.subject_title}
                      onChange={handleChange}
                      placeholder="Ex: Développement d'une application mobile de gestion..."
                      required
                    />
                    <div className="form-text">
                      <i className="fas fa-info-circle me-1"></i>
                      Choisissez un titre clair et descriptif
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="host_company" className="form-label fw-semibold">
                      <i className="fas fa-building text-success me-2"></i>
                      Entreprise partenaire
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="fas fa-briefcase text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="host_company"
                        name="host_company"
                        value={formData.host_company}
                        onChange={handleChange}
                        placeholder="Nom de l'entreprise (optionnel)"
                      />
                    </div>
                    <div className="form-text">
                      <i className="fas fa-lightbulb me-1"></i>
                      Laissez vide si le stage peut être effectué dans n'importe quelle entreprise
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Étape 2: Détails */}
        <div className={`step-content ${step === 2 ? 'active' : ''}`} style={{ display: step === 2 ? 'block' : 'none' }}>
          <div className="card proposal-card mb-4">
            <div className="card-header bg-gradient-warning text-dark">
              <i className="fas fa-pencil-alt me-2"></i>
              Description détaillée
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label htmlFor="description" className="form-label fw-semibold">
                  <i className="fas fa-align-left text-info me-2"></i>
                  Description du sujet
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="6"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez en détail le sujet de stage :
• Objectifs du stage
• Technologies ou outils à utiliser
• Compétences requises
• Résultats attendus..."
                ></textarea>
                <div className="d-flex justify-content-between mt-2">
                  <small className="text-muted">
                    <i className="fas fa-keyboard me-1"></i>
                    Soyez le plus précis possible
                  </small>
                  <small className={charCount.description > 500 ? 'text-success' : 'text-muted'}>
                    {charCount.description} caractères
                  </small>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="remark" className="form-label fw-semibold">
                  <i className="fas fa-comment-dots text-secondary me-2"></i>
                  Remarques complémentaires
                </label>
                <textarea
                  className="form-control"
                  id="remark"
                  name="remark"
                  rows="3"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="Informations supplémentaires, contraintes particulières, prérequis..."
                ></textarea>
                <div className="d-flex justify-content-end mt-2">
                  <small className="text-muted">{charCount.remark} caractères</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Étape 3: Confirmation */}
        <div className={`step-content ${step === 3 ? 'active' : ''}`} style={{ display: step === 3 ? 'block' : 'none' }}>
          <div className="card proposal-card mb-4">
            <div className="card-header bg-gradient-success text-white">
              <i className="fas fa-clipboard-check me-2"></i>
              Récapitulatif de votre proposition
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-lg-6">
                  <div className="recap-section mb-4">
                    <h6 className="recap-title">
                      <i className="fas fa-user-tie text-primary me-2"></i>
                      Enseignant
                    </h6>
                    <p className="recap-content">{formData.teacher_surname} {formData.teacher_name}</p>
                  </div>
                  
                  <div className="recap-section mb-4">
                    <h6 className="recap-title">
                      <i className="fas fa-heading text-info me-2"></i>
                      Intitulé du sujet
                    </h6>
                    <p className="recap-content fw-semibold">{formData.subject_title || <em className="text-muted">Non renseigné</em>}</p>
                  </div>

                  <div className="recap-section mb-4">
                    <h6 className="recap-title">
                      <i className="fas fa-building text-success me-2"></i>
                      Entreprise
                    </h6>
                    <p className="recap-content">{formData.host_company || <em className="text-muted">Non spécifiée</em>}</p>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="recap-section mb-4">
                    <h6 className="recap-title">
                      <i className="fas fa-align-left text-warning me-2"></i>
                      Description
                    </h6>
                    <div className="recap-content recap-description">
                      {formData.description || <em className="text-muted">Aucune description</em>}
                    </div>
                  </div>

                  {formData.remark && (
                    <div className="recap-section mb-4">
                      <h6 className="recap-title">
                        <i className="fas fa-comment-dots text-secondary me-2"></i>
                        Remarques
                      </h6>
                      <p className="recap-content">{formData.remark}</p>
                    </div>
                  )}
                </div>
              </div>

              <hr />

              <div className="notification-option p-3 rounded bg-light">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="email_sent"
                    name="email_sent"
                    checked={formData.email_sent}
                    onChange={handleChange}
                    style={{ width: '3em', height: '1.5em' }}
                  />
                  <label className="form-check-label ms-2" htmlFor="email_sent">
                    <i className="fas fa-envelope text-primary me-2"></i>
                    <strong>Notifier l'administration par email</strong>
                    <br />
                    <small className="text-muted">Un email sera envoyé pour informer de votre proposition</small>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons de navigation */}
        <div className="d-flex justify-content-between mt-4">
          <div>
            {step > 1 && (
              <button type="button" className="btn btn-outline-secondary btn-lg" onClick={(e) => prevStep(e)}>
                <i className="fas fa-arrow-left me-2"></i>
                Précédent
              </button>
            )}
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-light btn-lg" onClick={() => navigate('/teacher')}>
              <i className="fas fa-times me-2"></i>
              Annuler
            </button>
            {step < 3 ? (
              <button key="btn-next" type="button" className="btn btn-primary btn-lg" onClick={(e) => nextStep(e)}>
                Suivant
                <i className="fas fa-arrow-right ms-2"></i>
              </button>
            ) : loading ? (
              <button key="btn-loading" type="button" className="btn btn-success btn-lg" disabled>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Envoi en cours...
              </button>
            ) : (
              <button key="btn-submit" type="submit" className="btn btn-success btn-lg">
                <i className="fas fa-paper-plane me-2"></i>
                Soumettre la proposition
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default TeacherProposalForm;
