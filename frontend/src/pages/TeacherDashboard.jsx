import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function TeacherDashboard() {
  const location = useLocation();
  const [myProposals, setMyProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');

  const [actionBusyId, setActionBusyId] = useState(null);

  useEffect(() => {
    fetchMyProposals();
    // Clear location state after reading
    if (location.state?.successMessage) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchMyProposals = async () => {
    try {
      const response = await fetch('/api/proposals/me');
      const data = await response.json();
      if (data.ok) {
        setMyProposals(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canModify = (status) => status !== 'assigned';

  const handleArchive = async (id) => {
    if (!confirm('Archiver cette proposition ?')) return;
    try {
      setActionBusyId(id);
      const res = await fetch(`/api/proposals/${id}/archive`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) await fetchMyProposals();
      else alert(data.message || 'Impossible d\'archiver');
    } catch {
      alert('Erreur réseau');
    } finally {
      setActionBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette proposition ?')) return;
    try {
      setActionBusyId(id);
      const res = await fetch(`/api/proposals/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.ok) await fetchMyProposals();
      else alert(data.message || 'Impossible de supprimer');
    } catch {
      alert('Erreur réseau');
    } finally {
      setActionBusyId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: { class: 'bg-info', text: 'Disponible' },
      assigned: { class: 'bg-success', text: 'Assigné' },
      archived: { class: 'bg-secondary', text: 'Archivé' },
    };
    return badges[status] || { class: 'bg-secondary', text: status };
  };

  return (
    <>
      <h1 className="mt-4">Tableau de Bord Enseignant</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item active">Dashboard</li>
      </ol>

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
        </div>
      )}

      <div className="row">
        <div className="col-xl-3 col-md-6">
          <div className="card bg-primary text-white mb-4">
            <div className="card-body">
              <i className="fas fa-lightbulb fa-2x"></i>
              <div className="mt-2">Mes Propositions</div>
              <h2 className="mb-0">{myProposals.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-info text-white mb-4">
            <div className="card-body">
              <i className="fas fa-eye fa-2x"></i>
              <div className="mt-2">Disponibles</div>
              <h2 className="mb-0">{myProposals.filter(p => p.status === 'available').length}</h2>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-success text-white mb-4">
            <div className="card-body">
              <i className="fas fa-user-check fa-2x"></i>
              <div className="mt-2">Assignés</div>
              <h2 className="mb-0">{myProposals.filter(p => p.status === 'assigned').length}</h2>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-secondary text-white mb-4">
            <div className="card-body">
              <i className="fas fa-archive fa-2x"></i>
              <div className="mt-2">Archivés</div>
              <h2 className="mb-0">{myProposals.filter(p => p.status === 'archived').length}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-xl-12">
          <div className="card mb-4">
            <div className="card-header">
              <i className="fas fa-plus-circle me-1"></i>
              Actions rapides
            </div>
            <div className="card-body">
              <Link to="/teacher/new-proposal" className="btn btn-primary btn-lg">
                <i className="fas fa-lightbulb me-2"></i>
                Nouvelle Proposition de Sujet
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <i className="fas fa-list me-1"></i>
          Mes Propositions de Sujets
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : myProposals.length === 0 ? (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              Vous n'avez pas encore proposé de sujet de stage.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Intitulé</th>
                    <th>Entreprise</th>
                    <th>Email envoyé</th>
                    <th>Statut</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myProposals.map((prop) => (
                    <tr key={prop.id}>
                      <td>{new Date(prop.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>{prop.subject_title}</td>
                      <td>{prop.host_company || <em className="text-muted">Non spécifié</em>}</td>
                      <td>
                        {prop.email_sent ? (
                          <span className="badge bg-success">
                            <i className="fas fa-check me-1"></i>Oui
                          </span>
                        ) : (
                          <span className="badge bg-secondary">Non</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(prop.status).class}`}>
                          {getStatusBadge(prop.status).text}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm" role="group">
                          <Link
                            to={`/teacher/proposals/${prop.id}/edit`}
                            className="btn btn-outline-primary"
                            aria-disabled={!canModify(prop.status)}
                            onClick={(e) => {
                              if (!canModify(prop.status)) e.preventDefault();
                            }}
                            title={canModify(prop.status) ? 'Éditer' : 'Non modifiable (assigné)'}
                          >
                            <i className="fas fa-pen me-1"></i>Éditer
                          </Link>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleArchive(prop.id)}
                            disabled={!canModify(prop.status) || actionBusyId === prop.id || prop.status === 'archived'}
                            title={prop.status === 'archived' ? 'Déjà archivé' : 'Archiver'}
                          >
                            <i className="fas fa-archive me-1"></i>Archiver
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(prop.id)}
                            disabled={!canModify(prop.status) || actionBusyId === prop.id}
                            title={canModify(prop.status) ? 'Supprimer' : 'Non modifiable (assigné)'}
                          >
                            <i className="fas fa-trash me-1"></i>Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TeacherDashboard;
