import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '../components/Pagination';

const getTypeLabel = (type) => {
  switch (type) {
    case 'initiation':
      return "Stage d'initiation";
    case 'perfectionnement':
      return 'Stage de perfectionnement';
    case 'pfe':
      return 'Stage PFE';
    default:
      return type;
  }
};

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'initiation':
      return 'bg-primary';
    case 'perfectionnement':
      return 'bg-warning text-dark';
    case 'pfe':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

function StudentFavorites() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page')) || 1;

  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/favorites?page=${page}&limit=9`);
      const data = await res.json();
      if (res.ok && data.ok) {
        setOffers(data.offers || []);
        setPagination(data.pagination || null);
      } else {
        setError(data.message || 'Impossible de charger vos favoris');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const removeFavorite = async (offerId) => {
    if (!confirm('Retirer cette offre de vos favoris ?')) return;
    try {
      const res = await fetch(`/api/favorites/${offerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== offerId));
      }
    } catch {
      // ignore
    }
  };

  const handlePageChange = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(nextPage));
    setSearchParams(params);
  };

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 mb-0">
          <i className="fas fa-heart me-2 text-danger"></i>
          Mes favoris
        </h1>
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

      {!loading && !error && offers.length === 0 && (
        <div className="alert alert-info">Vous n’avez aucun favori pour le moment.</div>
      )}

      {!loading && !error && offers.length > 0 && (
        <>
          <div className="row g-3">
            {offers.map((offer) => (
              <div key={offer.id} className="col-12 col-md-6 col-xl-4">
                <div className="card h-100">
                  {offer.image && (
                    <img
                      src={offer.image}
                      className="card-img-top"
                      alt={offer.title}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                      <span className={`badge ${getTypeBadgeClass(offer.type)}`}>{getTypeLabel(offer.type)}</span>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFavorite(offer.id)}
                        title="Retirer des favoris"
                      >
                        <i className="fas fa-heart-broken"></i>
                      </button>
                    </div>

                    <h5 className="card-title mb-1">{offer.title}</h5>
                    <div className="text-muted mb-2">
                      <strong>{offer.company}</strong>
                      {offer.location ? ` — ${offer.location}` : ''}
                    </div>
                    <div className="mt-auto">
                      <Link className="btn btn-outline-primary w-100" to={`/offers/${offer.id}`}>
                        Voir détails
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}

export default StudentFavorites;
