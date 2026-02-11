import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OfferDetails = () => {
  const { id } = useParams();
  const offerId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  const isStudent = !!user && user.role === 'student';

  const applyButtonLabel = useMemo(() => {
    if (applying) return 'Envoi...';
    if (offer && offer.status !== 'open') return 'Offre fermée';
    return 'Postuler';
  }, [applying, offer]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/offers/${offerId}`);
        const data = await res.json();
        if (!cancelled) {
          if (data.ok) setOffer(data.offer);
          else setError(data.message || 'Offre introuvable');
        }
      } catch (e) {
        if (!cancelled) setError('Erreur réseau');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (Number.isFinite(offerId)) load();
    else {
      setLoading(false);
      setError('Identifiant offre invalide');
    }

    return () => {
      cancelled = true;
    };
  }, [offerId]);

  useEffect(() => {
    let cancelled = false;

    const loadFavorite = async () => {
      if (authLoading || !isStudent || !Number.isFinite(offerId)) {
        setFavorite(false);
        return;
      }
      try {
        const res = await fetch('/api/favorites/ids');
        const data = await res.json();
        if (!cancelled && res.ok && data.ok) {
          const ids = new Set((data.ids || []).map((n) => Number(n)));
          setFavorite(ids.has(offerId));
        }
      } catch {
        // ignore
      }
    };

    loadFavorite();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isStudent, offerId]);

  const handleApply = async () => {
    if (authLoading) return;

    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (user.role !== 'student') {
      alert('Seul un étudiant peut postuler à une offre.');
      return;
    }

    try {
      setApplying(true);
      const res = await fetch(`/api/offers/${offerId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        alert('Candidature envoyée avec succès.');
      } else {
        alert(data.message || 'Impossible de postuler');
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setApplying(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!isStudent) {
      alert('Seul un étudiant peut ajouter des favoris.');
      return;
    }

    const next = !favorite;
    setFavorite(next);

    try {
      setFavoriteBusy(true);
      const res = await fetch(`/api/favorites/${offerId}`, { method: next ? 'POST' : 'DELETE' });
      const data = await res.json();
      if (!(res.ok && data.ok)) {
        setFavorite(!next);
        alert(data.message || 'Action impossible');
      }
    } catch {
      setFavorite(!next);
      alert('Erreur réseau');
    } finally {
      setFavoriteBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 mt-4">
        <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
        <span>Chargement...</span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-4">{error}</div>;
  }

  if (!offer) return null;

  return (
    <div className="mt-4">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item"><Link to="/">Accueil</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Offre</li>
        </ol>
      </nav>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div>
                  <h1 className="h4 mb-1">{offer.title}</h1>
                  <div className="text-muted">
                    <strong>{offer.company}</strong>
                    {offer.location ? ` — ${offer.location}` : ''}
                  </div>
                </div>
                <span className={`badge ${offer.status === 'open' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                  {offer.status === 'open' ? 'Ouverte' : 'Fermée'}
                </span>
              </div>

              <hr />

              <h5>Description</h5>
              <p style={{ whiteSpace: 'pre-wrap' }} className="mb-0">{offer.description}</p>

              {offer.requirements && (
                <>
                  <hr />
                  <h5>Exigences</h5>
                  <p style={{ whiteSpace: 'pre-wrap' }} className="mb-0">{offer.requirements}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Candidature</h5>
              {offer.deadline && <div className="text-muted mb-2">Date limite: {offer.deadline}</div>}

              {!user && (
                <div className="alert alert-warning">
                  Vous devez vous connecter avant de pouvoir postuler.
                </div>
              )}

              <button
                className="btn btn-primary w-100"
                onClick={handleApply}
                disabled={applying || offer.status !== 'open'}
              >
                {applyButtonLabel}
              </button>

              {user && isStudent && (
                <button
                  className={`btn w-100 mt-2 ${favorite ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={handleToggleFavorite}
                  disabled={favoriteBusy}
                >
                  <i className="fas fa-heart me-2"></i>
                  {favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                </button>
              )}

              {!user && (
                <div className="small text-muted mt-2">
                  Après connexion, vous reviendrez automatiquement sur cette page.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetails;
