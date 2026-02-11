import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL de base de ton API
  const API_BASE_URL = 'https://lamarana-kepler.onrender.com/api/offers';

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      // Utilisation de l'URL complète et des credentials pour la session
      const res = await fetch(`https://lamarana-kepler.onrender.com/api/offers/admin/all`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (res.ok && data.ok) {
        setOffers(data.offers || []);
      } else {
        setError(data.message || 'Impossible de charger les offres');
      }
    } catch (e) {
      console.error("Load Error:", e);
      setError('Erreur réseau : Impossible de contacter le serveur');
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
      const res = await fetch(`${API_BASE_URL}/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important pour l'autorisation Admin
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        await load();
      } else {
        alert(data.message || 'Action impossible');
      }
    } catch (e) {
      alert('Erreur réseau lors de la modification du statut');
    }
  };

  const deleteOffer = async (offer) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'offre "${offer.title}" ?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/${offer.id}`, {
        method: 'DELETE',
        credentials: 'include' // Important pour l'autorisation Admin
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        await load();
      } else {
        alert(data.message || 'Suppression impossible');
      }
    } catch (e) {
      alert('Erreur réseau lors de la suppression');
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
          <span>Chargement des offres...</span>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger d-flex align-items-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!loading && !error && offers.length === 0 && (
        <div className="alert alert-info">Aucune offre pour le moment.</div>
      )}

      {!loading && !error && offers.length > 0 && (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
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
                    <td className="fw-bold">{o.title}</td>
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
                    <td className="text-center">{o.applications_count || 0}</td>
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
                          title={o.status === 'open' ? 'Fermer l\'offre' : 'Ouvrir l\'offre'}
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