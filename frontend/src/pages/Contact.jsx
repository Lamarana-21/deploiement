import React, { useState, useEffect } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (res.ok && data.ok) {
        setSubmitStatus('success');
        // Vider tous les champs du formulaire
        setFormData({ 
          name: '', 
          email: '', 
          phone: '', 
          subject: '', 
          message: '' 
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.message || 'Une erreur est survenue');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Erreur de connexion au serveur');
    } finally {
      setIsSubmitting(false);
      // Reset status after 8 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        setErrorMessage('');
      }, 8000);
    }
  };

  const contactInfo = [
    {
      icon: 'fa-map-marker-alt',
      color: 'danger',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      title: 'Adresse',
      content: 'Institut Supérieur des Études Technologiques de Djerba',
      delay: 0
    },
    {
      icon: 'fa-phone',
      color: 'success',
      gradient: 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)',
      title: 'Téléphone',
      content: '+216 538 756 48',
      delay: 100
    },
    {
      icon: 'fa-envelope',
      color: 'primary',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      title: 'Email',
      content: 'isetjb@gmail.com',
      delay: 200
    },
    {
      icon: 'fa-clock',
      color: 'warning',
      gradient: 'linear-gradient(135deg, #f7b731 0%, #fa8231 100%)',
      title: 'Horaires',
      content: 'Lundi - Vendredi | 08:00 - 17:00',
      delay: 300
    }
  ];

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        .contact-page {
          animation: fadeInUp 0.6s ease-out;
        }

        .contact-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 2.5rem;
          color: white;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
        }

        .contact-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }

        .contact-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .contact-header p {
          opacity: 0.9;
          font-size: 1.1rem;
          position: relative;
          z-index: 1;
        }

        .contact-form-card {
          border: none;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          background: white;
        }

        .contact-form-card:hover {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
          transform: translateY(-5px);
        }

        .contact-form-card .card-body {
          padding: 2.5rem;
        }

        .form-floating-custom {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .form-floating-custom .form-control,
        .form-floating-custom .form-select {
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background-color: #f8f9fa;
        }

        .form-floating-custom .form-control:focus,
        .form-floating-custom .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
          background-color: white;
        }

        .form-floating-custom label {
          color: #6c757d;
          font-weight: 500;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.3s ease;
        }

        .form-floating-custom label .icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 6px;
          color: white;
          font-size: 0.7rem;
        }

        .form-floating-custom.focused label {
          color: #667eea;
        }

        .form-floating-custom.focused label .icon {
          animation: pulse 0.5s ease;
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .submit-btn .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          position: relative;
          z-index: 1;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s ease;
        }

        .submit-btn:hover::before {
          left: 100%;
        }

        .spinner-grow-sm {
          width: 1rem;
          height: 1rem;
        }

        .info-card {
          border: none;
          border-radius: 16px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          background: white;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
          cursor: pointer;
        }

        .info-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        }

        .info-card .card-body {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .info-card .icon-wrapper {
          width: 55px;
          height: 55px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.3rem;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .info-card:hover .icon-wrapper {
          transform: rotate(10deg) scale(1.1);
        }

        .info-card .info-content h6 {
          font-weight: 700;
          color: #343a40;
          margin-bottom: 0.25rem;
          font-size: 0.95rem;
        }

        .info-card .info-content p {
          color: #6c757d;
          font-size: 0.9rem;
          margin: 0;
          line-height: 1.4;
        }

        .alert-animated {
          animation: fadeInUp 0.4s ease-out;
          border: none;
          border-radius: 12px;
          padding: 1rem 1.5rem;
        }

        .alert-success-custom {
          background: linear-gradient(135deg, rgba(38, 222, 129, 0.1) 0%, rgba(32, 191, 107, 0.1) 100%);
          color: #20bf6b;
          border-left: 4px solid #20bf6b;
        }

        .alert-danger-custom {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 36, 0.1) 100%);
          color: #ee5a24;
          border-left: 4px solid #ee5a24;
        }

        .form-section-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #343a40;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .form-section-title::after {
          content: '';
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, #667eea, transparent);
          border-radius: 2px;
        }

        .character-count {
          font-size: 0.8rem;
          color: #6c757d;
          text-align: right;
          margin-top: 0.5rem;
          transition: color 0.3s ease;
        }

        .character-count.warning {
          color: #f7b731;
        }

        .character-count.danger {
          color: #ee5a24;
        }

        @media (max-width: 991.98px) {
          .contact-header {
            padding: 2rem 1.5rem;
          }
          
          .contact-header h1 {
            font-size: 2rem;
          }

          .contact-form-card .card-body {
            padding: 1.5rem;
          }
        }
      `}</style>

      <div className={`contact-page mt-4 ${isVisible ? 'visible' : ''}`}>
        {/* Header Section */}
        <div className="contact-header">
          <h1>
            <i className="fas fa-paper-plane me-3"></i>
            Contactez-nous
          </h1>
          <p className="mb-0">
            Nous sommes là pour vous aider. Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.
          </p>
        </div>

        <div className="row g-4">
          {/* Form Section */}
          <div className="col-lg-8">
            <div className="contact-form-card card">
              <div className="card-body">
                <div className="form-section-title">
                  <i className="fas fa-edit text-primary"></i>
                  Envoyez-nous un message
                </div>

                {submitStatus === 'success' && (
                  <div className="alert alert-animated alert-success-custom mb-4">
                    <i className="fas fa-check-circle me-2"></i>
                    <strong>Message envoyé avec succès !</strong> Nous vous répondrons dans les plus brefs délais.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="alert alert-animated alert-danger-custom mb-4">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    <strong>Erreur !</strong> {errorMessage || 'Une erreur est survenue. Veuillez réessayer.'}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className={`form-floating-custom ${focusedField === 'name' ? 'focused' : ''}`}>
                        <label htmlFor="name">
                          <span className="icon"><i className="fas fa-user"></i></span>
                          Nom complet <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onFocus={() => handleFocus('name')}
                          onBlur={handleBlur}
                          placeholder="Votre nom complet"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className={`form-floating-custom ${focusedField === 'email' ? 'focused' : ''}`}>
                        <label htmlFor="email">
                          <span className="icon"><i className="fas fa-at"></i></span>
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => handleFocus('email')}
                          onBlur={handleBlur}
                          placeholder="votre@email.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`form-floating-custom ${focusedField === 'phone' ? 'focused' : ''}`}>
                    <label htmlFor="phone">
                      <span className="icon"><i className="fas fa-phone"></i></span>
                      Téléphone <span className="text-muted">(optionnel)</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => handleFocus('phone')}
                      onBlur={handleBlur}
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>

                  <div className={`form-floating-custom ${focusedField === 'subject' ? 'focused' : ''}`}>
                    <label htmlFor="subject">
                      <span className="icon"><i className="fas fa-tag"></i></span>
                      Sujet <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => handleFocus('subject')}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="">Sélectionnez un sujet...</option>
                      <option value="question">💬 Question générale</option>
                      <option value="technique">🔧 Problème technique</option>
                      <option value="stage">📋 Question sur les stages</option>
                      <option value="compte">👤 Problème de compte</option>
                      <option value="suggestion">💡 Suggestion</option>
                      <option value="autre">📝 Autre</option>
                    </select>
                  </div>

                  <div className={`form-floating-custom ${focusedField === 'message' ? 'focused' : ''}`}>
                    <label htmlFor="message">
                      <span className="icon"><i className="fas fa-comment-alt"></i></span>
                      Message <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="message"
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => handleFocus('message')}
                      onBlur={handleBlur}
                      placeholder="Décrivez votre demande en détail..."
                      maxLength={1000}
                      required
                    ></textarea>
                    <div className={`character-count ${formData.message.length > 900 ? 'danger' : formData.message.length > 750 ? 'warning' : ''}`}>
                      {formData.message.length} / 1000 caractères
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="submit-btn w-100"
                    disabled={isSubmitting}
                  >
                    <span className="btn-content">
                      {isSubmitting ? (
                        <>
                          <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i>
                          Envoyer le message
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Info Cards Section */}
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-3">
              {contactInfo.map((info, index) => (
                <div 
                  key={index}
                  className="info-card card"
                  style={{ 
                    animationDelay: `${info.delay}ms`,
                    animation: isVisible ? `fadeInRight 0.5s ease-out ${info.delay}ms both` : 'none'
                  }}
                >
                  <div className="card-body">
                    <div 
                      className="icon-wrapper"
                      style={{ background: info.gradient }}
                    >
                      <i className={`fas ${info.icon}`}></i>
                    </div>
                    <div className="info-content">
                      <h6>{info.title}</h6>
                      <p>{info.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Social Links Card */}
              <div 
                className="info-card card mt-2"
                style={{ 
                  animation: isVisible ? 'fadeInRight 0.5s ease-out 400ms both' : 'none'
                }}
              >
                <div className="card-body flex-column align-items-start">
                  <h6 className="mb-3 w-100">
                    <i className="fas fa-share-alt me-2 text-primary"></i>
                    Suivez-nous
                  </h6>
                  <div className="d-flex gap-2 w-100">
                    <a href="#" className="btn btn-outline-primary btn-sm rounded-circle" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" className="btn btn-outline-info btn-sm rounded-circle" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" className="btn btn-outline-danger btn-sm rounded-circle" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="#" className="btn btn-outline-primary btn-sm rounded-circle" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
