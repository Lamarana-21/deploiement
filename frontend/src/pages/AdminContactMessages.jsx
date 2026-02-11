import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const badgeClass = (status) => {
  switch (status) {
    case 'unread':
      return 'text-bg-danger';
    case 'read':
      return 'text-bg-warning';
    case 'replied':
      return 'text-bg-success';
    case 'archived':
      return 'text-bg-secondary';
    default:
      return 'text-bg-secondary';
  }
};

const statusLabel = (status) => {
  switch (status) {
    case 'unread':
      return 'Non lu';
    case 'read':
      return 'Lu';
    case 'replied':
      return 'Répondu';
    case 'archived':
      return 'Archivé';
    default:
      return status;
  }
};

const subjectLabel = (subject) => {
  switch (subject) {
    case 'question':
      return '💬 Question générale';
    case 'technique':
      return '🔧 Problème technique';
    case 'stage':
      return '📋 Question sur les stages';
    case 'compte':
      return '👤 Problème de compte';
    case 'suggestion':
      return '💡 Suggestion';
    case 'autre':
      return '📝 Autre';
    default:
      return subject;
  }
};

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [counts, setCounts] = useState({ total: 0, unread: 0, read: 0, replied: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/contact?${params}`, {
        credentials: 'include'
      });
      
      // Vérifier si la réponse est OK avant de parser le JSON
      if (!res.ok) {
        if (res.status === 401) {
          setError('Vous devez être connecté en tant qu\'administrateur');
          return;
        }
        if (res.status === 403) {
          setError('Accès réservé aux administrateurs');
          return;
        }
      }
      
      const data = await res.json();
      if (res.ok && data.ok) {
        setMessages(data.messages || []);
        setCounts(data.counts || {});
      } else {
        setError(data.message || 'Impossible de charger les messages');
      }
    } catch (e) {
      console.error('Erreur chargement messages:', e);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const openMessage = async (msg) => {
    try {
      const res = await fetch(`/api/contact/${msg.id}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSelectedMessage(data.message);
        setShowModal(true);
        // Rafraîchir la liste pour mettre à jour le statut
        load();
      }
    } catch (e) {
      alert('Erreur lors du chargement du message');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      if (res.ok) {
        load();
        if (selectedMessage?.id === id) {
          setSelectedMessage(prev => ({ ...prev, status }));
        }
      }
    } catch (e) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || replyText.length < 10) {
      alert('La réponse doit contenir au moins 10 caractères');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/contact/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyMessage: replyText }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        alert('Réponse envoyée avec succès !');
        setReplyText('');
        setSelectedMessage(prev => ({ ...prev, status: 'replied' }));
        load();
      } else {
        alert(data.message || 'Erreur lors de l\'envoi');
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setShowModal(false);
        setSelectedMessage(null);
        load();
      }
    } catch (e) {
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <style>{`
        .contact-admin-page {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stats-card {
          border: none;
          border-radius: 12px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stats-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .stats-card.active {
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.5);
        }

        .message-row {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .message-row:hover {
          background-color: #f8f9fa;
        }

        .message-row.unread {
          background-color: #fff3cd;
          font-weight: 600;
        }

        .message-row.unread:hover {
          background-color: #ffe69c;
        }

        .message-preview {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #6c757d;
        }

        .modal-backdrop-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1040;
          animation: fadeIn 0.2s ease;
        }

        .message-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          z-index: 1050;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        .message-modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 16px 16px 0 0;
        }

        .message-modal-body {
          padding: 1.5rem;
        }

        .message-content {
          background: #f8f9fa;
          padding: 1.25rem;
          border-radius: 12px;
          border-left: 4px solid #667eea;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .reply-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e9ecef;
        }

        .reply-textarea {
          border: 2px solid #e9ecef;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .reply-textarea:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
        }

        .action-btn {
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .sender-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .sender-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
          font-weight: bold;
        }
      `}</style>

      <div className="contact-admin-page mt-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="h4 mb-1">
              <i className="fas fa-envelope-open-text text-primary me-2"></i>
              Messages de contact
            </h1>
            <p className="text-muted mb-0">Gérez les messages reçus via le formulaire de contact</p>
          </div>
          <Link className="btn btn-outline-secondary" to="/admin">
            <i className="fas fa-arrow-left me-2"></i>Retour
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md">
            <div 
              className={`stats-card card h-100 ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <div className="card-body text-center py-3">
                <div className="h3 mb-1 text-primary">{counts.total}</div>
                <small className="text-muted">Total</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md">
            <div 
              className={`stats-card card h-100 ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              <div className="card-body text-center py-3">
                <div className="h3 mb-1 text-danger">{counts.unread}</div>
                <small className="text-muted">Non lus</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md">
            <div 
              className={`stats-card card h-100 ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              <div className="card-body text-center py-3">
                <div className="h3 mb-1 text-warning">{counts.read}</div>
                <small className="text-muted">Lus</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md">
            <div 
              className={`stats-card card h-100 ${filter === 'replied' ? 'active' : ''}`}
              onClick={() => setFilter('replied')}
            >
              <div className="card-body text-center py-3">
                <div className="h3 mb-1 text-success">{counts.replied}</div>
                <small className="text-muted">Répondus</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md">
            <div 
              className={`stats-card card h-100 ${filter === 'archived' ? 'active' : ''}`}
              onClick={() => setFilter('archived')}
            >
              <div className="card-body text-center py-3">
                <div className="h3 mb-1 text-secondary">{counts.archived}</div>
                <small className="text-muted">Archivés</small>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch} className="d-flex gap-2">
              <div className="flex-grow-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par nom, email, sujet ou message..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-search"></i>
              </button>
              {search && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => { setSearch(''); load(); }}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Messages List */}
        {loading && (
          <div className="d-flex align-items-center gap-2 justify-content-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <span>Chargement...</span>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="alert alert-info">
            <i className="fas fa-inbox me-2"></i>
            Aucun message {filter !== 'all' ? `avec le statut "${statusLabel(filter)}"` : ''}.
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Expéditeur</th>
                    <th>Sujet</th>
                    <th>Message</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr 
                      key={msg.id} 
                      className={`message-row ${msg.status === 'unread' ? 'unread' : ''}`}
                      onClick={() => openMessage(msg)}
                    >
                      <td>
                        <div className="fw-semibold">{msg.name}</div>
                        <small className="text-muted">{msg.email}</small>
                      </td>
                      <td>{subjectLabel(msg.subject)}</td>
                      <td className="message-preview">{msg.message}</td>
                      <td>
                        <span className={`badge ${badgeClass(msg.status)}`}>
                          {statusLabel(msg.status)}
                        </span>
                      </td>
                      <td className="text-muted">
                        <small>{formatDate(msg.created_at)}</small>
                      </td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => { e.stopPropagation(); openMessage(msg); }}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Message Modal */}
        {showModal && selectedMessage && (
          <>
            <div className="modal-backdrop-custom" onClick={() => setShowModal(false)}></div>
            <div className="message-modal">
              <div className="message-modal-header">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">{subjectLabel(selectedMessage.subject)}</h5>
                    <small className="opacity-75">{formatDate(selectedMessage.created_at)}</small>
                  </div>
                  <button 
                    className="btn btn-link text-white p-0"
                    onClick={() => setShowModal(false)}
                  >
                    <i className="fas fa-times fa-lg"></i>
                  </button>
                </div>
              </div>
              <div className="message-modal-body">
                {/* Sender Info */}
                <div className="sender-info">
                  <div className="sender-avatar">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold">{selectedMessage.name}</div>
                    <div className="text-muted">
                      <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                    </div>
                    {selectedMessage.phone && (
                      <div className="text-muted">
                        <i className="fas fa-phone me-1"></i>
                        <a href={`tel:${selectedMessage.phone}`}>{selectedMessage.phone}</a>
                      </div>
                    )}
                  </div>
                  <span className={`badge ${badgeClass(selectedMessage.status)}`}>
                    {statusLabel(selectedMessage.status)}
                  </span>
                </div>

                {/* Message Content */}
                <div className="message-content">
                  {selectedMessage.message}
                </div>

                {/* Actions */}
                <div className="d-flex gap-2 mt-3 flex-wrap">
                  {selectedMessage.status !== 'replied' && (
                    <button 
                      className="action-btn btn btn-success"
                      onClick={() => updateStatus(selectedMessage.id, 'replied')}
                    >
                      <i className="fas fa-check me-1"></i>Marquer comme répondu
                    </button>
                  )}
                  {selectedMessage.status !== 'archived' && (
                    <button 
                      className="action-btn btn btn-secondary"
                      onClick={() => updateStatus(selectedMessage.id, 'archived')}
                    >
                      <i className="fas fa-archive me-1"></i>Archiver
                    </button>
                  )}
                  {selectedMessage.status === 'archived' && (
                    <button 
                      className="action-btn btn btn-outline-primary"
                      onClick={() => updateStatus(selectedMessage.id, 'unread')}
                    >
                      <i className="fas fa-undo me-1"></i>Restaurer
                    </button>
                  )}
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="action-btn btn btn-primary"
                  >
                    <i className="fas fa-reply me-1"></i>Répondre par email
                  </a>
                  {selectedMessage.phone && (
                    <a 
                      href={`tel:${selectedMessage.phone}`}
                      className="action-btn btn btn-outline-success"
                    >
                      <i className="fas fa-phone me-1"></i>Appeler
                    </a>
                  )}
                  <button 
                    className="action-btn btn btn-outline-danger ms-auto"
                    onClick={() => deleteMessage(selectedMessage.id)}
                  >
                    <i className="fas fa-trash me-1"></i>Supprimer
                  </button>
                </div>

                {/* Reply Section */}
                {selectedMessage.status !== 'replied' && selectedMessage.status !== 'archived' && (
                  <div className="reply-section">
                    <h6 className="mb-3">
                      <i className="fas fa-paper-plane me-2 text-primary"></i>
                      Répondre directement
                    </h6>
                    <textarea
                      className="form-control reply-textarea"
                      rows="4"
                      placeholder="Écrivez votre réponse ici..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                    <div className="d-flex justify-content-end mt-3">
                      <button 
                        className="btn btn-primary"
                        onClick={sendReply}
                        disabled={sending || replyText.length < 10}
                      >
                        {sending ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Envoi...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Envoyer la réponse
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedMessage.admin_notes && (
                  <div className="mt-4 p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">
                      <i className="fas fa-sticky-note me-2"></i>Notes admin
                    </h6>
                    <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                      {selectedMessage.admin_notes}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminContactMessages;
