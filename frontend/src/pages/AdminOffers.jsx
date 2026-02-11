import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('https://lamarana-kepler.onrender.com/api/offers/admin/all');
      const data = await res.json();
      if (res.ok && data.ok) setOffers(data.offers || []);
      else setError(data.message || 'Impossible de charger les offres');
    } catch (e) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (offer) => {
    const nextStatus = offer.status === 'open' ? 'closed' : 'open';
    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
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

  const deleteOffer = async (offer) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'offre "${offer.title}" ?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        await load();
      } else {
        alert(data.message || 'Suppression impossible');
      }
    } catch (e) {
      alert('Erreur réseau');
    }
  };

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 mb-0">Gestion des offres</h1>
        <Link className="btn btn-primary" to="/admin/new-offer">
          <i className="fas fa-plus me-1"></i> Nouvelle offre
        </Link>
      </div>

      {loading && (
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <span>Chargement...</span>
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && offers.length === 0 && (
        <div className="alert alert-info">Aucune offre pour le moment.</div>
      )}

      {!loading && !error && offers.length > 0 && (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Entreprise</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Candidatures</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id}>
                    <td>{o.title}</td>
                    <td className="text-muted">{o.company}</td>
                    <td>
                      <span className="badge text-bg-info">
                        {o.type === 'pfe' ? 'PFE' : o.type === 'initiation' ? 'Initiation' : 'Perfectionnement'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${o.status === 'open' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                        {o.status === 'open' ? 'Ouverte' : 'Fermée'}
                      </span>
                    </td>
                    <td>{o.applications_count}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link className="btn btn-outline-primary" to={`/admin/offers/${o.id}/edit`} title="Modifier">
                          <i className="fas fa-edit"></i>
                        </Link>
                        <Link className="btn btn-outline-info" to={`/admin/offers/${o.id}/applications`} title="Candidatures">
                          <i className="fas fa-users"></i>
                        </Link>
                        <button 
                          className={`btn ${o.status === 'open' ? 'btn-outline-warning' : 'btn-outline-success'}`} 
                          onClick={() => toggleStatus(o)}
                          title={o.status === 'open' ? 'Fermer' : 'Ouvrir'}
                        >
                          <i className={`fas ${o.status === 'open' ? 'fa-lock' : 'fa-lock-open'}`}></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger" 
                          onClick={() => deleteOffer(o)}
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i>
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

export default AdminOffers;
