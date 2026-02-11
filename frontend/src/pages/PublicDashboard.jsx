import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';

const PublicDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const isStudent = !!user && user.role === 'student';
  
  // Get filter from URL
  const typeFilter = searchParams.get('type') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;

  const offersCountLabel = useMemo(() => {
    if (loading) return '';
    if (!pagination) return '';
    const { total } = pagination;
    if (total === 0) return 'Aucune offre disponible';
    if (total === 1) return '1 offre disponible';
    return `${total} offres disponibles`;
  }, [pagination, loading]);

  // Get type label
  const getTypeLabel = (type) => {
    switch (type) {
      case 'initiation': return "Stage d'initiation";
      case 'perfectionnement': return 'Stage de perfectionnement';
      case 'pfe': return 'Stage PFE';
      default: return type;
    }
  };

  // Get type badge class
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'initiation': return 'bg-primary';
      case 'perfectionnement': return 'bg-warning text-dark';
      case 'pfe': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  // Handle type filter change
  const handleTypeFilter = (type) => {
    const params = new URLSearchParams(searchParams);
    if (type) {
      params.set('type', type);
    } else {
      params.delete('type');
    }
    params.delete('page'); // Reset to page 1 when filter changes
    setSearchParams(params);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to page 1 when search changes
    setSearchParams(params);
    setSearchTerm(searchInput.trim());
  };

  // Handle page change
  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({});
    setSearchTerm('');
    setSearchInput('');
  };

  // Clear search only
  const clearSearch = () => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.delete('page');
    setSearchParams(params);
    setSearchTerm('');
  };

  // Load offers from API
  const loadOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '9'); // 9 offers per page (3x3 grid)
      if (typeFilter) params.set('type', typeFilter);
      if (searchTerm) params.set('search', searchTerm);
      
      const res = await fetch(`/api/offers?${params.toString()}`);
      const data = await res.json();
      
      if (data.ok) {
        setOffers(data.offers || []);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Impossible de charger les offres');
      }
    } catch (e) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [currentPage, typeFilter, searchTerm]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    let cancelled = false;

    const loadFavoriteIds = async () => {
      if (authLoading || !isStudent) {
        setFavoriteIds(new Set());
        return;
      }
      try {
        const res = await fetch('/api/favorites/ids');
        const data = await res.json();
        if (!cancelled && res.ok && data.ok) {
          setFavoriteIds(new Set((data.ids || []).map((n) => Number(n))));
        }
      } catch {
        // ignore
      }
    };

    loadFavoriteIds();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isStudent]);

  const toggleFavorite = async (offerId) => {
    if (!isStudent) return;
    const isFav = favoriteIds.has(offerId);

    // optimistic UI
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(offerId);
      else next.add(offerId);
      return next;
    });

    try {
      const res = await fetch(`/api/favorites/${offerId}`, { method: isFav ? 'DELETE' : 'POST' });
      const data = await res.json();
      if (!(res.ok && data.ok)) {
        // rollback
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (isFav) next.add(offerId);
          else next.delete(offerId);
          return next;
        });
        alert(data.message || 'Action impossible');
      }
    } catch {
      // rollback
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(offerId);
        else next.delete(offerId);
        return next;
      });
      alert('Erreur réseau');
    }
  };

  // Update searchTerm from URL
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearchTerm(urlSearch);
    setSearchInput(urlSearch);
  }, [searchParams]);

  return (
    <>
      <div className="card mt-4">
        <div className="card-body">
          <div className="row align-items-center g-3">
            <div className="col-lg-8">
              <h1 className="h3 mb-1">
                <i className="fas fa-briefcase me-2"></i>
                Offres de stage
              </h1>
              <div className="text-muted">
                Consultez les offres disponibles. Pour postuler, vous devez vous connecter.
              </div>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="small text-muted mb-2">{offersCountLabel}</div>
              <div className="d-flex gap-2 justify-content-lg-end">
                <Link className="btn btn-outline-primary" to="/login">Se connecter</Link>
                <Link className="btn btn-primary" to="/register">Créer un compte</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card mt-3">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3 align-items-center">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Rechercher par titre, entreprise, lieu..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  {searchInput && (
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={clearSearch}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                  <button className="btn btn-primary" type="submit">
                    Rechercher
                  </button>
                </div>
              </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => handleTypeFilter(e.target.value)}
              >
                <option value="">Tous les types de stage</option>
                <option value="initiation">Stage d'initiation</option>
                <option value="perfectionnement">Stage de perfectionnement</option>
                <option value="pfe">Stage PFE</option>
              </select>
            </div>
            <div className="col-md-2">
              {(typeFilter || searchTerm) && (
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={clearFilters}
                >
                  <i className="fas fa-filter-circle-xmark me-1"></i>
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
          </form>
          
          {/* Active filters display */}
          {(typeFilter || searchTerm) && (
            <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
              <span className="text-muted small">Filtres actifs :</span>
              {typeFilter && (
                <span className={`badge ${getTypeBadgeClass(typeFilter)}`}>
                  {getTypeLabel(typeFilter)}
                  <button 
                    className="btn-close btn-close-white ms-2" 
                    style={{ fontSize: '0.6rem' }}
                    onClick={() => handleTypeFilter('')}
                  ></button>
                </span>
              )}
              {searchTerm && (
                <span className="badge bg-secondary">
                  Recherche: "{searchTerm}"
                  <button 
                    className="btn-close btn-close-white ms-2" 
                    style={{ fontSize: '0.6rem' }}
                    onClick={clearSearch}
                  ></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {!loading && !error && (
        <div className="row g-3 mt-3">
          <div className="col-12 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="text-muted small">Sur cette page</div>
                <div className="h3 mb-0">{offers.length}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="text-muted small">Total offres</div>
                <div className="h3 mb-0">{pagination?.total || 0}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="text-muted small">Page</div>
                <div className="h3 mb-0">{pagination?.page || 1} / {pagination?.totalPages || 1}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="text-muted small">Candidature</div>
                <div className="h6 mb-0">Connexion requise</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="d-flex align-items-center gap-2 mt-4">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <span>Chargement...</span>
        </div>
      )}

      {!loading && error && <div className="alert alert-danger mt-4">{error}</div>}

      {!loading && !error && offers.length === 0 && (
        <div className="alert alert-info mt-4">
          <i className="fas fa-info-circle me-2"></i>
          {typeFilter || searchTerm 
            ? 'Aucune offre ne correspond à vos critères de recherche.' 
            : 'Aucune offre disponible pour le moment.'}
          {(typeFilter || searchTerm) && (
            <button className="btn btn-link p-0 ms-2" onClick={clearFilters}>
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {!loading && !error && offers.length > 0 && (
        <>
        <div className="row g-3 mt-2">
          {offers.map((offer) => (
            <div key={offer.id} className="col-12 col-md-6 col-xl-4">
              <div className="card h-100">
                {offer.image && (
                  <img src={offer.image} className="card-img-top" alt={offer.title} style={{ height: '200px', objectFit: 'cover' }} />
                )}
                <div className="card-body d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                    <span className="badge text-bg-success">Développement</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge ${getTypeBadgeClass(offer.type)}`}>
                        {getTypeLabel(offer.type)}
                      </span>
                      {isStudent && (
                        <button
                          type="button"
                          className={`btn btn-sm ${favoriteIds.has(offer.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                          onClick={() => toggleFavorite(offer.id)}
                          title={favoriteIds.has(offer.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          aria-label={favoriteIds.has(offer.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <i className="fas fa-heart"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <h5 className="card-title mb-1">{offer.title}</h5>
                  <div className="text-muted mb-2 small">
                    {offer.deadline ? `Date limite: ${offer.deadline}` : 'Ouvert'}
                  </div>
                  <div className="text-muted mb-3">
                    <strong>{offer.company}</strong>
                    {offer.location ? ` — ${offer.location}` : ''}
                  </div>

                  <div className="mt-auto">
                    <Link className="btn btn-outline-primary w-100" to={`/offers/${offer.id}`}>
                      Voir détails
                    </Link>
                    <div className="small text-muted mt-2 text-center">Connexion requise pour postuler</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}

      {/* Comment ça marche */}
      <div className="card mt-4">
        <div className="card-body">
          <h2 className="h4 mb-3">
            <i className="fas fa-lightbulb text-warning me-2"></i>
            Comment ça marche ?
          </h2>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="border rounded p-3 h-100">
                <div className="fw-bold mb-1">
                  <span className="badge bg-primary me-2">1</span>
                  Parcourir les offres
                </div>
                <div className="text-muted">Consultez les offres et ouvrez les détails.</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="border rounded p-3 h-100">
                <div className="fw-bold mb-1">
                  <span className="badge bg-success me-2">2</span>
                  Se connecter
                </div>
                <div className="text-muted">Créez un compte ou connectez-vous.</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="border rounded p-3 h-100">
                <div className="fw-bold mb-1">
                  <span className="badge bg-warning text-dark me-2">3</span>
                  Postuler
                </div>
                <div className="text-muted">Un étudiant peut postuler en un clic.</div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <Link to="/comment-ca-marche" className="btn btn-outline-primary">
              <i className="fas fa-info-circle me-2"></i>
              En savoir plus
            </Link>
          </div>
        </div>
      </div>

      {/* Types de stages */}
      <div className="card mt-4">
        <div className="card-body">
          <h2 className="h4 mb-3">
            <i className="fas fa-layer-group text-info me-2"></i>
            Types de stages
          </h2>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="card bg-primary bg-opacity-10 h-100">
                <div className="card-body text-center">
                  <i className="fas fa-seedling fa-2x text-primary mb-2"></i>
                  <h5>Stage d'initiation</h5>
                  <p className="text-muted small mb-2">Premier contact avec le monde professionnel</p>
                  <Link 
                    to="/offres?type=initiation" 
                    className="btn btn-primary btn-sm"
                  >
                    Voir les offres
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card bg-warning bg-opacity-10 h-100">
                <div className="card-body text-center">
                  <i className="fas fa-chart-line fa-2x text-warning mb-2"></i>
                  <h5>Stage perfectionnement</h5>
                  <p className="text-muted small mb-2">Approfondissement des compétences</p>
                  <Link 
                    to="/offres?type=perfectionnement" 
                    className="btn btn-warning btn-sm"
                  >
                    Voir les offres
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card bg-danger bg-opacity-10 h-100">
                <div className="card-body text-center">
                  <i className="fas fa-award fa-2x text-danger mb-2"></i>
                  <h5>Stage PFE</h5>
                  <p className="text-muted small mb-2">Projet de fin d'études</p>
                  <Link 
                    to="/offres?type=pfe" 
                    className="btn btn-danger btn-sm"
                  >
                    Voir les offres
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liens rapides */}
      <div className="row g-3 mt-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="fas fa-question-circle fa-2x text-primary mb-2"></i>
              <h5>FAQ</h5>
              <p className="text-muted small">Trouvez des réponses à vos questions</p>
              <Link to="/faq" className="btn btn-outline-primary btn-sm">
                Consulter la FAQ
              </Link>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="fas fa-building fa-2x text-success mb-2"></i>
              <h5>À propos</h5>
              <p className="text-muted small">En savoir plus sur notre plateforme</p>
              <Link to="/a-propos" className="btn btn-outline-success btn-sm">
                Découvrir
              </Link>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="fas fa-envelope fa-2x text-warning mb-2"></i>
              <h5>Contact</h5>
              <p className="text-muted small">Besoin d'aide ? Contactez-nous</p>
              <Link to="/contact" className="btn btn-outline-warning btn-sm">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicDashboard;
