import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const badgeClass = (status) => {
  switch (status) {
    case 'accepted':
      return 'text-bg-success';
    case 'rejected':
      return 'text-bg-danger';
    default:
      return 'text-bg-secondary';
  }
};

const AdminOfferApplications = () => {
  const { id } = useParams();
  const offerId = Number(id);

  const [offer, setOffer] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`https://lamarana-kepler.onrender.com/api/offers/${offerId}/applications`);
      const data = await res.json();
      if (res.ok && data.ok) {
        setOffer(data.offer);
        setApplications(data.applications || []);
      } else {
        setError(data.message || 'Impossible de charger les candidatures');
      }
    } catch (e) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(offerId)) load();
    else {
      setLoading(false);
      setError('Identifiant offre invalide');
    }
  }, [offerId]);

  const updateStatus = async (applicationId, status) => {
    try {
      const res = await fetch(`/api/offers/${offerId}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
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

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="h4 mb-0">Candidatures</h1>
          {offer && (
            <div className="text-muted">
              <strong>{offer.title}</strong> — {offer.company}
            </div>
          )}
        </div>
        <Link className="btn btn-outline-secondary" to="/admin/offers">Retour</Link>
      </div>

      {loading && (
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <span>Chargement...</span>
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && applications.length === 0 && (
        <div className="alert alert-info">Aucune candidature pour cette offre.</div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td>{a.fullname}</td>
                    <td className="text-muted">{a.email}</td>
                    <td><span className={`badge ${badgeClass(a.status)}`}>{a.status}</span></td>
                    <td className="text-muted">{a.created_at}</td>
                    <td className="text-end d-flex gap-2 justify-content-end">
                      <button className="btn btn-sm btn-outline-success" onClick={() => updateStatus(a.id, 'accepted')}>
                        Accepter
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => updateStatus(a.id, 'rejected')}>
                        Refuser
                      </button>
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

export default AdminOfferApplications;
