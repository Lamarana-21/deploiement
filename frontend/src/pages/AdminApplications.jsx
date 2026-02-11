import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  
  // Filtres
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://lamarana-kepler.onrender.com/api/offers/admin/applications');
      const data = await res.json();
      if (data.ok) {
        setApplications(data.applications || []);
        setStats(data.stats || { total: 0, pending: 0, accepted: 0, rejected: 0 });
      } else {
        setError(data.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Impossible de charger les candidatures');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, offerId, status) => {
    try {
      const res = await fetch(`/api/offers/${offerId}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchApplications();
        setNotice({ type: 'success', message: `Candidature ${status === 'accepted' ? 'acceptée' : status === 'rejected' ? 'refusée' : 'mise en attente'}` });
      } else {
        setNotice({ type: 'danger', message: data.message || 'Erreur lors de la mise à jour' });
      }
    } catch (err) {
      setNotice({ type: 'danger', message: 'Erreur de connexion' });
    }
  };

  const bulkUpdateStatus = async (status) => {
    if (selectedIds.size === 0) {
      setNotice({ type: 'warning', message: 'Veuillez sélectionner au moins une candidature' });
      return;
    }
    
    try {
      const res = await fetch('/api/offers/admin/applications/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationIds: Array.from(selectedIds), status }),
      });
      const data = await res.json();
      if (data.ok) {
        setSelectedIds(new Set());
        fetchApplications();
        setNotice({ type: 'success', message: `${data.updated} candidature(s) mise(s) à jour` });
      } else {
        setNotice({ type: 'danger', message: data.message || 'Erreur lors de la mise à jour' });
      }
    } catch (err) {
      setNotice({ type: 'danger', message: 'Erreur de connexion' });
    }
  };

  // Filtrer les applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchSearch = !searchTerm || 
        `${app.student_name} ${app.student_email} ${app.offer_title} ${app.offer_company}`.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [applications, statusFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(start, start + itemsPerPage);
  }, [filteredApplications, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedApplications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedApplications.map(a => a.id)));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning text-dark';
      case 'accepted': return 'bg-success';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Refusée';
      default: return status;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'pfe': return 'bg-danger';
      case 'perfectionnement': return 'bg-warning text-dark';
      case 'initiation': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'pfe': return 'PFE';
      case 'perfectionnement': return 'Perfectionnement';
      case 'initiation': return 'Initiation';
      default: return type;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="mt-4">
        <h1 className="mb-4 fw-bold">
          <i className="fas fa-file-alt me-2 text-primary"></i>
          Gestion des candidatures
        </h1>
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted">Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="mb-1 fw-bold">
            <i className="fas fa-file-alt me-2 text-primary"></i>
            Gestion des candidatures
          </h1>
          <p className="text-muted mb-0">
            Gérez toutes les candidatures aux offres de stage
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchApplications}>
            <i className="fas fa-sync-alt me-2"></i>
            Actualiser
          </button>
          <Link to="/admin/offers" className="btn btn-primary btn-sm">
            <i className="fas fa-briefcase me-2"></i>
            Gérer les offres
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div className={`alert alert-${notice.type} alert-dismissible fade show`} role="alert">
          {notice.message}
          <button type="button" className="btn-close" onClick={() => setNotice(null)}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #6c757d' }}>
            <div className="card-body py-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-0 small text-uppercase">Total</p>
                  <h3 className="mb-0 fw-bold">{stats.total}</h3>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: 'rgba(108, 117, 125, 0.1)' }}>
                  <i className="fas fa-inbox text-secondary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #ffc107' }}>
            <div className="card-body py-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-0 small text-uppercase">En attente</p>
                  <h3 className="mb-0 fw-bold text-warning">{stats.pending}</h3>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                  <i className="fas fa-clock text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #198754' }}>
            <div className="card-body py-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-0 small text-uppercase">Acceptées</p>
                  <h3 className="mb-0 fw-bold text-success">{stats.accepted}</h3>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)' }}>
                  <i className="fas fa-check-circle text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #dc3545' }}>
            <div className="card-body py-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-0 small text-uppercase">Refusées</p>
                  <h3 className="mb-0 fw-bold text-danger">{stats.rejected}</h3>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}>
                  <i className="fas fa-times-circle text-danger"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et actions groupées */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label small text-muted fw-semibold">Rechercher</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Nom, email, offre, entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted fw-semibold">Statut</label>
              <select 
                className="form-select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">🟡 En attente</option>
                <option value="accepted">🟢 Acceptées</option>
                <option value="rejected">🔴 Refusées</option>
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label small text-muted fw-semibold">Actions groupées ({selectedIds.size} sélectionnée(s))</label>
              <div className="btn-group w-100">
                <button 
                  className="btn btn-outline-success"
                  onClick={() => bulkUpdateStatus('accepted')}
                  disabled={selectedIds.size === 0}
                >
                  <i className="fas fa-check me-1"></i>
                  Accepter
                </button>
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => bulkUpdateStatus('rejected')}
                  disabled={selectedIds.size === 0}
                >
                  <i className="fas fa-times me-1"></i>
                  Refuser
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => bulkUpdateStatus('pending')}
                  disabled={selectedIds.size === 0}
                >
                  <i className="fas fa-undo me-1"></i>
                  En attente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table des candidatures */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
          <h6 className="mb-0 fw-semibold">
            <i className="fas fa-list me-2 text-primary"></i>
            Liste des candidatures
            <span className="badge bg-primary ms-2">{filteredApplications.length}</span>
          </h6>
          <small className="text-muted">
            Page {currentPage} sur {totalPages || 1}
          </small>
        </div>
        <div className="card-body p-0">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3 opacity-50"></i>
              <p className="text-muted mb-0">Aucune candidature trouvée</p>
              <small className="text-muted">Modifiez vos filtres ou attendez de nouvelles candidatures</small>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        checked={selectedIds.size === paginatedApplications.length && paginatedApplications.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Candidat</th>
                    <th>Offre</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>CV</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApplications.map((app) => (
                    <tr key={app.id} className={selectedIds.has(app.id) ? 'table-active' : ''}>
                      <td>
                        <input 
                          type="checkbox" 
                          className="form-check-input"
                          checked={selectedIds.has(app.id)}
                          onChange={() => toggleSelect(app.id)}
                        />
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              backgroundColor: 'rgba(13, 110, 253, 0.1)' 
                            }}
                          >
                            <i className="fas fa-user text-primary"></i>
                          </div>
                          <div>
                            <div className="fw-semibold">{app.student_name}</div>
                            <small className="text-muted">{app.student_email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-truncate" style={{ maxWidth: '200px' }} title={app.offer_title}>
                          {app.offer_title}
                        </div>
                        <small className="text-muted">{app.offer_company}</small>
                      </td>
                      <td>
                        <span className={`badge ${getTypeBadge(app.offer_type)}`}>
                          {getTypeLabel(app.offer_type)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">{formatDate(app.created_at)}</small>
                      </td>
                      <td>
                        {app.cv_url ? (
                          <a 
                            href={app.cv_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                            title="Voir le CV"
                          >
                            <i className="fas fa-file-pdf"></i>
                          </a>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-end">
                          {app.status !== 'accepted' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => updateApplicationStatus(app.id, app.offer_id, 'accepted')}
                              title="Accepter"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => updateApplicationStatus(app.id, app.offer_id, 'rejected')}
                              title="Refuser"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                          {app.status !== 'pending' && (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => updateApplicationStatus(app.id, app.offer_id, 'pending')}
                              title="Remettre en attente"
                            >
                              <i className="fas fa-undo"></i>
                            </button>
                          )}
                          <Link
                            to={`/admin/offers/${app.offer_id}/applications`}
                            className="btn btn-sm btn-outline-primary"
                            title="Voir toutes les candidatures de cette offre"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-white d-flex align-items-center justify-content-between">
            <small className="text-muted">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredApplications.length)} sur {filteredApplications.length}
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(1)}>
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                    <i className="fas fa-angle-left"></i>
                  </button>
                </li>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                    <i className="fas fa-angle-right"></i>
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(totalPages)}>
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminApplications;
