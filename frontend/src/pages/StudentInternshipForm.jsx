import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function StudentInternshipForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [classmates, setClassmates] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingClassmates, setLoadingClassmates] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Extraire nom et prénom du fullname (format: "Prénom Nom" ou "Nom Prénom")
  const getNameParts = (fullname) => {
    if (!fullname) return { firstName: '', lastName: '' };
    const parts = fullname.trim().split(' ');
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    // Convention: premier mot = prénom, reste = nom
    return { 
      firstName: parts[0], 
      lastName: parts.slice(1).join(' ') 
    };
  };

  const [formData, setFormData] = useState({
    student_name: '',
    student_surname: '',
    student_class: '',
    student_phone: '',
    student_email: '',
    has_partner: false,
    partner_user_id: '',
    partner_name: '',
    partner_surname: '',
    partner_phone: '',
    partner_email: '',
    partner_class: '',
    has_subject: false,
    isett_supervisor_id: '',
    subject_title: '',
    host_company: '',
    pfe_unit_remark: '',
  });

  // Charger le profil complet de l'utilisateur depuis la base de données
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await fetch('/api/auth/profile');
        const data = await response.json();
        if (data.ok && data.profile) {
          const profile = data.profile;
          const parts = getNameParts(profile.fullname);
          setFormData(prev => ({
            ...prev,
            student_name: parts.lastName || '',
            student_surname: parts.firstName || '',
            student_email: profile.email || '',
            student_class: profile.classe || '',
            student_phone: profile.phone || prev.student_phone,
          }));
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        // Fallback sur les données du contexte user
        if (user) {
          const parts = getNameParts(user.fullname);
          setFormData(prev => ({
            ...prev,
            student_name: parts.lastName || '',
            student_surname: parts.firstName || '',
            student_email: user.email || '',
            student_class: user.classe || '',
          }));
        }
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, []);

  // Charger la liste des encadrants disponibles (enseignants avec propositions approuvées)
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        // Passer le paramètre has_partner pour filtrer selon les règles d'encadrement
        const response = await fetch(`/api/auth/available-supervisors?has_partner=${formData.has_partner}`);
        const data = await response.json();
        if (data.ok) {
          setTeachers(data.supervisors || []);
        } else {
          // Fallback sur l'ancienne API si la nouvelle n'existe pas encore
          const fallbackResponse = await fetch('/api/auth/teachers');
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.ok) {
            setTeachers(fallbackData.teachers || []);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des encadrants:', err);
        // Fallback
        try {
          const fallbackResponse = await fetch('/api/auth/teachers');
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.ok) {
            setTeachers(fallbackData.teachers || []);
          }
        } catch (e) {
          console.error('Fallback also failed:', e);
        }
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchSupervisors();
  }, [formData.has_partner]); // Recharger quand has_partner change

  // Charger la liste des camarades de classe (pour choisir un binôme)
  useEffect(() => {
    const fetchClassmates = async () => {
      if (!formData.has_partner) {
        setClassmates([]);
        return;
      }
      
      setLoadingClassmates(true);
      try {
        const response = await fetch('/api/auth/classmates');
        const data = await response.json();
        if (data.ok) {
          setClassmates(data.classmates || []);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des camarades:', err);
      } finally {
        setLoadingClassmates(false);
      }
    };
    fetchClassmates();
  }, [formData.has_partner]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.student_name && formData.student_surname && 
               formData.student_class && formData.student_phone && formData.student_email;
      case 2:
        if (formData.has_partner) {
          // Le binôme doit être sélectionné depuis la liste
          return formData.partner_user_id && formData.partner_name && formData.partner_surname;
        }
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({ ok: false }));

      if (response.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter, puis réessayer.');
        return;
      }

      if (!response.ok) {
        setError(data.message || `Erreur ${response.status}: ${response.statusText}`);
        return;
      }

      if (data.ok) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.message || 'Erreur lors de la soumission');
      }
    } catch (_err) {
      setError('Erreur de connexion au serveur. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header avec gradient */}
      <div className="card border-0 shadow-sm mb-4" style={{ 
        background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
        borderRadius: '15px'
      }}>
        <div className="card-body text-white py-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h2 className="mb-2 fw-bold">
                <i className="fas fa-graduation-cap me-3"></i>
                Demande de Stage
              </h2>
              <p className="mb-0 opacity-75">
                Remplissez ce formulaire pour soumettre votre demande de stage de fin d'études
              </p>
            </div>
            <div className="col-md-4 text-end d-none d-md-block">
              <i className="fas fa-file-signature" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
        <div className="card-body py-4">
          <div className="d-flex justify-content-between align-items-center position-relative">
            {/* Progress Line */}
            <div className="position-absolute" style={{ 
              top: '24px', 
              left: '15%', 
              right: '15%', 
              height: '4px', 
              background: '#e9ecef',
              zIndex: 0
            }}>
              <div style={{ 
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #0d6efd, #6610f2)',
                transition: 'width 0.3s ease',
                borderRadius: '2px'
              }}></div>
            </div>

            {/* Step 1 */}
            <div 
              className="text-center" 
              style={{ zIndex: 1, flex: 1, cursor: 'pointer' }}
              onClick={() => setCurrentStep(1)}
            >
              <div 
                className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-sm ${
                  currentStep >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'
                }`}
                style={{ 
                  width: '55px', 
                  height: '55px', 
                  transition: 'all 0.3s ease',
                  transform: currentStep === 1 ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: currentStep === 1 ? '0 4px 15px rgba(13, 110, 253, 0.4)' : 'none'
                }}
              >
                <i className="fas fa-user fa-lg"></i>
              </div>
              <div className={`small fw-semibold ${currentStep >= 1 ? 'text-primary' : 'text-muted'}`}>
                Informations<br/>personnelles
              </div>
            </div>

            {/* Step 2 - Binôme CLIQUABLE */}
            <div 
              className="text-center" 
              style={{ zIndex: 1, flex: 1, cursor: 'pointer' }}
              onClick={() => setCurrentStep(2)}
              title="Cliquez pour ajouter un binôme"
            >
              <div 
                className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-sm ${
                  currentStep >= 2 ? 'bg-primary text-white' : 'bg-light text-muted border border-2 border-primary border-opacity-25'
                }`}
                style={{ 
                  width: '55px', 
                  height: '55px', 
                  transition: 'all 0.3s ease',
                  transform: currentStep === 2 ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: currentStep === 2 ? '0 4px 15px rgba(13, 110, 253, 0.4)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (currentStep !== 2) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(13, 110, 253, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentStep !== 2) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <i className="fas fa-users fa-lg"></i>
              </div>
              <div className={`small fw-semibold ${currentStep >= 2 ? 'text-primary' : 'text-muted'}`}>
                <span className="d-block">Binôme</span>
                <span className="badge bg-info bg-opacity-75 text-white" style={{ fontSize: '0.65rem' }}>
                  <i className="fas fa-hand-pointer me-1"></i>Cliquez ici
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div 
              className="text-center" 
              style={{ zIndex: 1, flex: 1, cursor: 'pointer' }}
              onClick={() => setCurrentStep(3)}
            >
              <div 
                className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-sm ${
                  currentStep >= 3 ? 'bg-primary text-white' : 'bg-light text-muted'
                }`}
                style={{ 
                  width: '55px', 
                  height: '55px', 
                  transition: 'all 0.3s ease',
                  transform: currentStep === 3 ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: currentStep === 3 ? '0 4px 15px rgba(13, 110, 253, 0.4)' : 'none'
                }}
              >
                <i className="fas fa-building fa-lg"></i>
              </div>
              <div className={`small fw-semibold ${currentStep >= 3 ? 'text-primary' : 'text-muted'}`}>
                Détails du<br/>stage
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert" style={{ borderRadius: '10px' }}>
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)' }}>
          <div className="card-body text-white py-5 text-center">
            <div className="mb-4">
              <div className="rounded-circle bg-white d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-check-circle text-success" style={{ fontSize: '3rem' }}></i>
              </div>
            </div>
            <h3 className="fw-bold mb-3">
              <i className="fas fa-paper-plane me-2"></i>
              Demande soumise avec succès !
            </h3>
            <p className="mb-4 opacity-90">
              Votre demande de stage a été enregistrée. Vous recevrez une notification lorsqu'elle sera traitée.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button 
                type="button" 
                className="btn btn-light btn-lg px-4"
                onClick={() => navigate('/student')}
                style={{ borderRadius: '10px' }}
              >
                <i className="fas fa-home me-2"></i>
                Retour au tableau de bord
              </button>
              <button 
                type="button" 
                className="btn btn-outline-light btn-lg px-4"
                onClick={() => {
                  setSuccess(false);
                  setCurrentStep(1);
                  setFormData({
                    student_name: formData.student_name,
                    student_surname: formData.student_surname,
                    student_class: formData.student_class,
                    student_phone: '',
                    student_email: formData.student_email,
                    has_partner: false,
                    partner_user_id: '',
                    partner_name: '',
                    partner_surname: '',
                    partner_phone: '',
                    partner_email: '',
                    partner_class: '',
                    has_subject: false,
                    isett_supervisor_id: '',
                    subject_title: '',
                    host_company: '',
                    pfe_unit_remark: '',
                  });
                }}
                style={{ borderRadius: '10px' }}
              >
                <i className="fas fa-plus me-2"></i>
                Nouvelle demande
              </button>
            </div>
          </div>
        </div>
      )}

      {!success && (
      <div>
        {/* Step 1: Informations personnelles */}
        {currentStep === 1 && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <div className="card-header bg-white border-0 py-3" style={{ borderRadius: '15px 15px 0 0' }}>
              <h5 className="mb-0">
                <i className="fas fa-user-circle text-primary me-2"></i>
                Vos Informations
              </h5>
            </div>
            <div className="card-body p-4">
              {/* Info automatique */}
              <div className="alert alert-info border-0 mb-4" style={{ borderRadius: '10px', background: 'rgba(13, 110, 253, 0.1)' }}>
                <i className="fas fa-info-circle me-2"></i>
                Certaines informations sont pré-remplies à partir de votre profil.
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-id-card text-muted me-2"></i>
                    Nom <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light"
                    name="student_name"
                    value={formData.student_name}
                    onChange={handleChange}
                    readOnly
                    required
                    style={{ borderRadius: '10px' }}
                  />
                  <small className="text-muted">
                    <i className="fas fa-lock me-1"></i>
                    Depuis votre compte
                  </small>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-id-card text-muted me-2"></i>
                    Prénom <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light"
                    name="student_surname"
                    value={formData.student_surname}
                    onChange={handleChange}
                    readOnly
                    required
                    style={{ borderRadius: '10px' }}
                  />
                  <small className="text-muted">
                    <i className="fas fa-lock me-1"></i>
                    Depuis votre compte
                  </small>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-graduation-cap text-muted me-2"></i>
                    Classe <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${user?.classe ? 'bg-light' : ''}`}
                    name="student_class"
                    value={formData.student_class}
                    onChange={handleChange}
                    placeholder="Ex: L2DSI1 G2"
                    required
                    readOnly={!!user?.classe}
                    style={{ borderRadius: '10px' }}
                  />
                  {user?.classe && (
                    <small className="text-muted">
                      <i className="fas fa-lock me-1"></i>
                      Depuis votre profil
                    </small>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-phone text-muted me-2"></i>
                    Téléphone <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control form-control-lg"
                    name="student_phone"
                    value={formData.student_phone}
                    onChange={handleChange}
                    placeholder="+216 XX XXX XXX"
                    required
                    style={{ borderRadius: '10px' }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-envelope text-muted me-2"></i>
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg bg-light"
                    name="student_email"
                    value={formData.student_email}
                    onChange={handleChange}
                    readOnly
                    required
                    style={{ borderRadius: '10px' }}
                  />
                  <small className="text-muted">
                    <i className="fas fa-lock me-1"></i>
                    Email de votre compte
                  </small>
                </div>
              </div>
            </div>
            <div className="card-footer bg-white border-0 py-3 d-flex justify-content-end" style={{ borderRadius: '0 0 15px 15px' }}>
              <button 
                type="button" 
                className="btn btn-primary btn-lg px-4"
                onClick={nextStep}
                disabled={!validateStep(1)}
                style={{ borderRadius: '10px' }}
              >
                Suivant
                <i className="fas fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Binôme */}
        {currentStep === 2 && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <div className="card-header bg-white border-0 py-3" style={{ borderRadius: '15px 15px 0 0' }}>
              <h5 className="mb-0">
                <i className="fas fa-users text-primary me-2"></i>
                Votre Binôme
              </h5>
            </div>
            <div className="card-body p-4">
              {/* Toggle binôme - CLIQUABLE */}
              <div 
                className={`p-4 rounded-3 mb-4 ${formData.has_partner ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                  border: formData.has_partner ? '2px solid #0d6efd' : '2px dashed #adb5bd',
                  transform: 'scale(1)',
                }}
                onClick={() => setFormData(prev => ({ ...prev, has_partner: !prev.has_partner }))}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="d-flex align-items-center">
                  <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${formData.has_partner ? 'bg-primary text-white' : 'bg-white text-muted border'}`}
                       style={{ width: '60px', height: '60px', transition: 'all 0.3s' }}>
                    <i className={`fas ${formData.has_partner ? 'fa-check fa-lg' : 'fa-user-plus fa-lg'}`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className={`mb-1 fw-bold ${formData.has_partner ? 'text-primary' : ''}`}>
                      {formData.has_partner ? '✓ Binôme sélectionné' : 'J\'ai un binôme'}
                    </h5>
                    <small className="text-muted">
                      <i className="fas fa-hand-pointer me-1"></i>
                      Cliquez ici si vous réalisez votre stage en binôme
                    </small>
                  </div>
                  <div className="ms-3">
                    <div className={`rounded-pill px-3 py-2 ${formData.has_partner ? 'bg-primary text-white' : 'bg-light text-muted'}`}>
                      {formData.has_partner ? (
                        <><i className="fas fa-users me-2"></i>Oui</>
                      ) : (
                        <><i className="fas fa-user me-2"></i>Non</>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {formData.has_partner && (
                <div className="border rounded-3 p-4" style={{ borderColor: '#dee2e6', animation: 'fadeIn 0.3s' }}>
                  <h6 className="text-primary mb-4">
                    <i className="fas fa-user-friends me-2"></i>
                    Choisir votre binôme
                  </h6>
                  
                  {/* Sélection du binôme depuis la liste des camarades */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-users text-muted me-2"></i>
                      Sélectionner un camarade de classe <span className="text-danger">*</span>
                    </label>
                    {loadingClassmates ? (
                      <div className="d-flex align-items-center text-muted">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Chargement des camarades de classe...
                      </div>
                    ) : classmates.length > 0 ? (
                      <select
                        className="form-select form-select-lg"
                        name="partner_user_id"
                        value={formData.partner_user_id}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const selectedClassmate = classmates.find(c => c.id.toString() === selectedId);
                          
                          if (selectedClassmate) {
                            // Extraire nom et prénom du fullname
                            const parts = selectedClassmate.fullname.trim().split(' ');
                            const firstName = parts[0] || '';
                            const lastName = parts.slice(1).join(' ') || '';
                            
                            setFormData(prev => ({
                              ...prev,
                              partner_user_id: selectedId,
                              partner_name: lastName,
                              partner_surname: firstName,
                              partner_email: selectedClassmate.email || '',
                              partner_class: selectedClassmate.classe || user?.classe || '',
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              partner_user_id: '',
                              partner_name: '',
                              partner_surname: '',
                              partner_email: '',
                              partner_class: '',
                            }));
                          }
                        }}
                        style={{ borderRadius: '10px' }}
                        required={formData.has_partner}
                      >
                        <option value="">-- Choisir un camarade --</option>
                        {classmates.map(classmate => (
                          <option key={classmate.id} value={classmate.id}>
                            {classmate.fullname} ({classmate.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="alert alert-warning mb-0">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Aucun camarade de classe disponible. 
                        {!user?.classe && (
                          <span> Veuillez d'abord renseigner votre classe dans votre profil.</span>
                        )}
                        {user?.classe && (
                          <span> Tous vos camarades ont peut-être déjà une demande de stage en cours.</span>
                        )}
                      </div>
                    )}
                    <small className="text-muted mt-1 d-block">
                      <i className="fas fa-info-circle me-1"></i>
                      Seuls les étudiants de votre classe ({user?.classe || 'non définie'}) qui n'ont pas encore de demande de stage sont affichés
                    </small>
                  </div>

                  {/* Informations du binôme sélectionné */}
                  {formData.partner_user_id && (
                    <div className="row g-4 border-top pt-4">
                      <div className="col-12">
                        <div className="alert alert-success border-0" style={{ borderRadius: '10px' }}>
                          <i className="fas fa-check-circle me-2"></i>
                          Binôme sélectionné : <strong>{formData.partner_surname} {formData.partner_name}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Nom du binôme</label>
                        <input
                          type="text"
                          className="form-control form-control-lg bg-light"
                          name="partner_name"
                          value={formData.partner_name}
                          readOnly
                          style={{ borderRadius: '10px' }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Prénom du binôme</label>
                        <input
                          type="text"
                          className="form-control form-control-lg bg-light"
                          name="partner_surname"
                          value={formData.partner_surname}
                          readOnly
                          style={{ borderRadius: '10px' }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Classe</label>
                        <input
                          type="text"
                          className="form-control bg-light"
                          name="partner_class"
                          value={formData.partner_class}
                          readOnly
                          style={{ borderRadius: '10px' }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Téléphone</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="partner_phone"
                          value={formData.partner_phone}
                          onChange={handleChange}
                          placeholder="+216 XX XXX XXX"
                          style={{ borderRadius: '10px' }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Email</label>
                        <input
                          type="email"
                          className="form-control bg-light"
                          name="partner_email"
                          value={formData.partner_email}
                          readOnly
                          style={{ borderRadius: '10px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!formData.has_partner && (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-user fa-3x mb-3 opacity-25"></i>
                  <p className="mb-0">Vous effectuerez votre stage en solo</p>
                </div>
              )}
            </div>
            <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between" style={{ borderRadius: '0 0 15px 15px' }}>
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-lg px-4"
                onClick={prevStep}
                style={{ borderRadius: '10px' }}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Retour
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-lg px-4"
                onClick={nextStep}
                disabled={!validateStep(2)}
                style={{ borderRadius: '10px' }}
              >
                Suivant
                <i className="fas fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Détails du stage */}
        {currentStep === 3 && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <div className="card-header bg-white border-0 py-3" style={{ borderRadius: '15px 15px 0 0' }}>
              <h5 className="mb-0">
                <i className="fas fa-building text-primary me-2"></i>
                Détails du Stage
              </h5>
            </div>
            <div className="card-body p-4">
              {/* Toggle sujet - CLIQUABLE */}
              <div 
                className={`p-4 rounded-3 mb-4 ${formData.has_subject ? 'border-success bg-success bg-opacity-10' : 'border-secondary'}`}
                style={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                  border: formData.has_subject ? '2px solid #198754' : '2px dashed #adb5bd',
                  transform: 'scale(1)',
                }}
                onClick={() => setFormData(prev => ({ ...prev, has_subject: !prev.has_subject }))}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="d-flex align-items-center">
                  <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${formData.has_subject ? 'bg-success text-white' : 'bg-white text-muted border'}`}
                       style={{ width: '60px', height: '60px', transition: 'all 0.3s' }}>
                    <i className={`fas ${formData.has_subject ? 'fa-check fa-lg' : 'fa-lightbulb fa-lg'}`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className={`mb-1 fw-bold ${formData.has_subject ? 'text-success' : ''}`}>
                      {formData.has_subject ? '✓ Sujet défini' : 'J\'ai déjà un sujet de stage'}
                    </h5>
                    <small className="text-muted">
                      <i className="fas fa-hand-pointer me-1"></i>
                      Cliquez ici si vous avez déjà défini votre sujet
                    </small>
                  </div>
                  <div className="ms-3">
                    <div className={`rounded-pill px-3 py-2 ${formData.has_subject ? 'bg-success text-white' : 'bg-light text-muted'}`}>
                      {formData.has_subject ? (
                        <><i className="fas fa-lightbulb me-2"></i>Oui</>
                      ) : (
                        <><i className="fas fa-question me-2"></i>Non</>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-chalkboard-teacher text-muted me-2"></i>
                    Encadreur ISETT
                  </label>
                  <select
                    className="form-select form-select-lg"
                    name="isett_supervisor_id"
                    value={formData.isett_supervisor_id}
                    onChange={handleChange}
                    disabled={loadingTeachers}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="">-- Sélectionner un enseignant --</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={String(teacher.id)}>
                        {teacher.fullname}{teacher.email ? ` (${teacher.email})` : ''}
                      </option>
                    ))}
                  </select>
                  {loadingTeachers && (
                    <small className="text-muted">
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Chargement...
                    </small>
                  )}
                  {!loadingTeachers && teachers.length === 0 && (
                    <small className="text-warning">
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      Aucun enseignant disponible
                    </small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-file-alt text-muted me-2"></i>
                    Intitulé du sujet
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    name="subject_title"
                    value={formData.subject_title}
                    onChange={handleChange}
                    placeholder="Titre de votre projet de stage"
                    style={{ borderRadius: '10px' }}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-building text-muted me-2"></i>
                    Entreprise d'accueil
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    name="host_company"
                    value={formData.host_company}
                    onChange={handleChange}
                    placeholder="Nom de l'entreprise où vous effectuerez votre stage"
                    style={{ borderRadius: '10px' }}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-comment-alt text-muted me-2"></i>
                    Remarques (Cellule PFE)
                  </label>
                  <textarea
                    className="form-control"
                    name="pfe_unit_remark"
                    rows="4"
                    value={formData.pfe_unit_remark}
                    onChange={handleChange}
                    placeholder="Informations complémentaires, questions ou remarques..."
                    style={{ borderRadius: '10px' }}
                  ></textarea>
                </div>
              </div>

              {/* Résumé */}
              <div className="alert border-0 mt-4" style={{ borderRadius: '10px', background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(102, 16, 242, 0.1) 100%)' }}>
                <h6 className="fw-bold mb-3">
                  <i className="fas fa-clipboard-check me-2 text-primary"></i>
                  Résumé de votre demande
                </h6>
                <div className="row small">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Étudiant:</strong> {formData.student_surname} {formData.student_name}</p>
                    <p className="mb-1"><strong>Classe:</strong> {formData.student_class || 'Non spécifiée'}</p>
                    <p className="mb-1"><strong>Email:</strong> {formData.student_email}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Binôme:</strong> {formData.has_partner ? `${formData.partner_surname} ${formData.partner_name}` : 'Aucun'}</p>
                    <p className="mb-1"><strong>Sujet défini:</strong> {formData.has_subject ? 'Oui' : 'Non'}</p>
                    <p className="mb-1"><strong>Entreprise:</strong> {formData.host_company || 'Non spécifiée'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between" style={{ borderRadius: '0 0 15px 15px' }}>
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-lg px-4"
                onClick={prevStep}
                style={{ borderRadius: '10px' }}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Retour
              </button>
              <div className="d-flex gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-danger btn-lg px-4"
                  onClick={() => navigate('/student')}
                  style={{ borderRadius: '10px' }}
                >
                  <i className="fas fa-times me-2"></i>
                  Annuler
                </button>
                {loading ? (
                  <button 
                    key="btn-loading"
                    type="button" 
                    className="btn btn-success btn-lg px-4"
                    disabled
                    style={{ borderRadius: '10px' }}
                  >
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Envoi...
                  </button>
                ) : (
                  <button 
                    key="btn-submit"
                    type="button" 
                    className="btn btn-success btn-lg px-4"
                    onClick={handleSubmit}
                    style={{ borderRadius: '10px' }}
                  >
                    <i className="fas fa-paper-plane me-2"></i>
                    Soumettre
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

export default StudentInternshipForm;