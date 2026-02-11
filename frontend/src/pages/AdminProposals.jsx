import React, { useEffect, useState } from 'react';

const AdminProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [rejectModal, setRejectModal] = useState({ show: false, proposal: null, reason: '' });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/proposals');
      const data = await res.json();
      if (res.ok && data.ok) {
        setProposals(data.data || []);
      } else {
        setError(data.message || 'Impossible de charger les propositions');
      }
    } catch (e) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (proposal) => {
    if (!window.confirm(`Approuver la proposition "${proposal.subject_title}" de ${proposal.teacher_surname} ${proposal.teacher_name} ?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_status: 'approved' }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        await load();
      } else {
        alert(data.message || 'Action impossible');
      }
    } catch (e) {
      alert('Erreur réseau');
    }
  };

  const openRejectModal = (proposal) => {
    setRejectModal({ show: true, proposal, reason: '' });
  };

  const handleReject = async () => {
    const { proposal, reason } = rejectModal;
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_status: 'rejected', rejection_reason: reason }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setRejectModal({ show: false, proposal: null, reason: '' });
        await load();
      } else {
        alert(data.message || 'Action impossible');
      }
    } catch (e) {
      alert('Erreur réseau');
    }
  };

  const getApprovalBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge bg-success"><i className="fas fa-check me-1"></i>Approuvée</span>;
      case 'rejected':
        return <span className="badge bg-danger"><i className="fas fa-times me-1"></i>Refusée</span>;
      default:
        return <span className="badge bg-warning text-dark"><i className="fas fa-clock me-1"></i>En attente</span>;
    }
  };

  const filteredProposals = proposals.filter(p => {
    if (filter === 'all') return true;
    return (p.approval_status || 'pending') === filter;
  });

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => !p.approval_status || p.approval_status === 'pending').length,
    approved: proposals.filter(p => p.approval_status === 'approved').length,
    rejected: proposals.filter(p => p.approval_status === 'rejected').length,
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header */}
      <div className="card border-0 shadow-sm mb-4" style={{ 
        background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
        borderRadius: '15px'
      }}>
        <div className="card-body text-white py-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h2 className="mb-2 fw-bold">
                <i className="fas fa-clipboard-check me-3"></i>
                Gestion des Propositions
              </h2>
              <p className="mb-0 opacity-75">
                Approuvez ou refusez les propositions de sujets des enseignants
              </p>
            </div>
            <div className="col-md-4 text-end d-none d-md-block">
              <i className="fas fa-user-check" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body text-center">
              <div className="text-primary mb-2">
                <i className="fas fa-list-alt fa-2x"></i>
              </div>
              <h3 className="mb-0">{stats.total}</h3>
              <small className="text-muted">Total</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', cursor: 'pointer' }} onClick={() => setFilter('pending')}>
            <div className="card-body text-center">
              <div className="text-warning mb-2">
                <i className="fas fa-clock fa-2x"></i>
              </div>
              <h3 className="mb-0">{stats.pending}</h3>
              <small className="text-muted">En attente</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', cursor: 'pointer' }} onClick={() => setFilter('approved')}>
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <i className="fas fa-check-circle fa-2x"></i>
              </div>
              <h3 className="mb-0">{stats.approved}</h3>
              <small className="text-muted">Approuvées</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', cursor: 'pointer' }} onClick={() => setFilter('rejected')}>
            <div className="card-body text-center">
              <div className="text-danger mb-2">
                <i className="fas fa-times-circle fa-2x"></i>
              </div>
              <h3 className="mb-0">{stats.rejected}</h3>
              <small className="text-muted">Refusées</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-4">
        <div className="btn-group">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('all')}
          >
            Toutes
          </button>
          <button 
            className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={() => setFilter('pending')}
          >
            En attente ({stats.pending})
          </button>
          <button 
            className={`btn ${filter === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setFilter('approved')}
          >
            Approuvées
          </button>
          <button 
            className={`btn ${filter === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={() => setFilter('rejected')}
          >
            Refusées
          </button>
        </div>
      </div>

      {loading && (
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <span>Chargement...</span>
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && filteredProposals.length === 0 && (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          Aucune proposition {filter !== 'all' ? 'avec ce statut' : ''} pour le moment.
        </div>
      )}

      {!loading && !error && filteredProposals.length > 0 && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ borderTopLeftRadius: '15px' }}>Enseignant</th>
                  <th>Sujet</th>
                  <th>Entreprise</th>
                  <th>Statut Approbation</th>
                  <th>Date</th>
                  <th className="text-end" style={{ borderTopRightRadius: '15px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm bg-primary-soft text-primary rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <i className="fas fa-chalkboard-teacher"></i>
                        </div>
                        <div>
                          <strong>{p.teacher_surname} {p.teacher_name}</strong>
                          {p.user_email && <br />}
                          {p.user_email && <small className="text-muted">{p.user_email}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="fw-semibold">{p.subject_title}</span>
                      {p.description && (
                        <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="text-muted">{p.host_company || '-'}</td>
                    <td>
                      {getApprovalBadge(p.approval_status)}
                      {p.rejection_reason && (
                        <div className="small text-danger mt-1" title={p.rejection_reason}>
                          <i className="fas fa-comment me-1"></i>
                          {p.rejection_reason.substring(0, 30)}...
                        </div>
                      )}
                    </td>
                    <td className="text-muted small">
                      {new Date(p.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="text-end">
                      {(!p.approval_status || p.approval_status === 'pending') && (
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-success" 
                            onClick={() => handleApprove(p)}
                            title="Approuver"
                          >
                            <i className="fas fa-check me-1"></i>
                            Approuver
                          </button>
                          <button 
                            className="btn btn-danger" 
                            onClick={() => openRejectModal(p)}
                            title="Refuser"
                          >
                            <i className="fas fa-times me-1"></i>
                            Refuser
                          </button>
                        </div>
                      )}
                      {p.approval_status === 'approved' && (
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => openRejectModal(p)}
                          title="Révoquer l'approbation"
                        >
                          <i className="fas fa-ban me-1"></i>
                          Révoquer
                        </button>
                      )}
                      {p.approval_status === 'rejected' && (
                        <button 
                          className="btn btn-sm btn-outline-success" 
                          onClick={() => handleApprove(p)}
                          title="Réapprouver"
                        >
                          <i className="fas fa-redo me-1"></i>
                          Réapprouver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de refus */}
      {rejectModal.show && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '15px' }}>
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  <i className="fas fa-times-circle text-danger me-2"></i>
                  Refuser la proposition
                </h5>
                <button type="button" className="btn-close" onClick={() => setRejectModal({ show: false, proposal: null, reason: '' })}></button>
              </div>
              <div className="modal-body">
                <p>
                  Vous allez refuser la proposition <strong>"{rejectModal.proposal?.subject_title}"</strong> de <strong>{rejectModal.proposal?.teacher_surname} {rejectModal.proposal?.teacher_name}</strong>.
                </p>
                <div className="mb-3">
                  <label className="form-label">Raison du refus (optionnel)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Expliquez pourquoi cette proposition est refusée..."
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary" onClick={() => setRejectModal({ show: false, proposal: null, reason: '' })}>
                  Annuler
                </button>
                <button type="button" className="btn btn-danger" onClick={handleReject}>
                  <i className="fas fa-times me-1"></i>
                  Confirmer le refus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProposals;
