import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const statusBadgeClass = (status) => {
  switch (status) {
    case 'accepted':
      return 'text-bg-success';
    case 'rejected':
      return 'text-bg-danger';
    case 'pending':
      return 'text-bg-warning';
    default:
      return 'text-bg-secondary';
  }
};

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = async () => {
    const res = await fetch('/api/offers/me/applications');
    const data = await res.json();
    if (res.ok && data.ok) setApplications(data.applications || []);
    else throw new Error(data.message || 'Impossible de charger vos candidatures');
  };

  const handleWithdraw = async (applicationId) => {
    if (!confirm('Retirer cette candidature (uniquement si en attente) ?')) return;
    try {
      const res = await fetch(`/api/offers/me/applications/${applicationId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.ok) {
        await reload();
      } else {
        alert(data.message || 'Impossible de retirer');
      }
    } catch {
      alert('Erreur réseau');
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        await reload();
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Erreur réseau');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 mb-0">Mes candidatures</h1>
        <Link className="btn btn-outline-primary" to="/offres">
          <i className="fas fa-briefcase me-1"></i> Voir les offres
        </Link>
      </div>

      {loading && (
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <span>Chargement...</span>
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && applications.length === 0 && (
        <div className="alert alert-info">Vous n’avez pas encore postulé à une offre.</div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Offre</th>
                  <th>Entreprise</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td className="text-muted">{a.company}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(a.status)}`}>{a.status}</span>
                    </td>
                    <td className="text-muted">{a.created_at}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm" role="group">
                        <Link className="btn btn-outline-primary" to={`/offers/${a.offer_id}`}>
                          Détails
                        </Link>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleWithdraw(a.id)}
                          disabled={a.status !== 'pending'}
                          title="Retirer (seulement en attente)"
                        >
                          Retirer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
