import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function StudentDashboard() {
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await fetch('/api/internships/me');
      const data = await response.json();
      if (data.ok) {
        setMyRequests(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-warning', text: 'En attente' },
      approved: { class: 'bg-success', text: 'Approuvé' },
      rejected: { class: 'bg-danger', text: 'Rejeté' },
    };
    return badges[status] || { class: 'bg-secondary', text: status };
  };

  return (
    <>
      <h1 className="mt-4">Tableau de Bord Étudiant</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item active">Dashboard</li>
      </ol>

      <div className="row">
        <div className="col-xl-3 col-md-6">
          <div className="card bg-primary text-white mb-4">
            <div className="card-body">
              <i className="fas fa-file-alt fa-2x"></i>
              <div className="mt-2">Mes Demandes</div>
              <h2 className="mb-0">{myRequests.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-success text-white mb-4">
            <div className="card-body">
              <i className="fas fa-check-circle fa-2x"></i>
              <div className="mt-2">Approuvées</div>
              <h2 className="mb-0">{myRequests.filter(r => r.status === 'approved').length}</h2>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-warning text-white mb-4">
            <div className="card-body">
              <i className="fas fa-clock fa-2x"></i>
              <div className="mt-2">En attente</div>
              <h2 className="mb-0">{myRequests.filter(r => r.status === 'pending').length}</h2>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-danger text-white mb-4">
            <div className="card-body">
              <i className="fas fa-times-circle fa-2x"></i>
              <div className="mt-2">Rejetées</div>
              <h2 className="mb-0">{myRequests.filter(r => r.status === 'rejected').length}</h2>
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
              <Link to="/student/new-request" className="btn btn-primary btn-lg">
                <i className="fas fa-file-alt me-2"></i>
                Nouvelle Demande de Stage
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <i className="fas fa-list me-1"></i>
          Mes Demandes de Stage
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              Vous n'avez pas encore soumis de demande de stage.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sujet</th>
                    <th>Entreprise</th>
                    <th>Binôme</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map((req) => (
                    <tr key={req.id}>
                      <td>{new Date(req.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>{req.subject_title || <em className="text-muted">Non spécifié</em>}</td>
                      <td>{req.host_company || <em className="text-muted">Non spécifié</em>}</td>
                      <td>
                        {req.has_partner ? (
                          <span className="badge bg-info">
                            <i className="fas fa-users me-1"></i>Oui
                          </span>
                        ) : (
                          <span className="badge bg-secondary">Non</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(req.status).class}`}>
                          {getStatusBadge(req.status).text}
                        </span>
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

export default StudentDashboard;
