import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const AdminEditOffer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    deadline: '',
    type: 'pfe',
    image: '',
    status: 'open',
  });

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://lamarana-kepler.onrender.com/api/offers/${id}`);
        const data = await res.json();
        if (res.ok && data.ok && data.offer) {
          const o = data.offer;
          setForm({
            title: o.title || '',
            company: o.company || '',
            location: o.location || '',
            description: o.description || '',
            requirements: o.requirements || '',
            deadline: o.deadline ? o.deadline.split('T')[0] : '',
            type: o.type || 'pfe',
            image: o.image || '',
            status: o.status || 'open',
          });
        } else {
          setError(data.message || 'Offre introuvable');
        }
      } catch (e) {
        setError('Erreur réseau');
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        navigate('/admin/offers');
      } else {
        setError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (e) {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-4 d-flex align-items-center gap-2">
        <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
        <span>Chargement de l'offre...</span>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center mb-3">
        <Link to="/admin/offers" className="btn btn-outline-secondary me-3">
          <i className="fas fa-arrow-left"></i>
        </Link>
        <h1 className="h4 mb-0">Modifier l'offre</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Titre *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Entreprise *</label>
                <input
                  type="text"
                  name="company"
                  className="form-control"
                  value={form.company}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Localisation *</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Date limite *</label>
                <input
                  type="date"
                  name="deadline"
                  className="form-control"
                  value={form.deadline}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Type de stage *</label>
                <select
                  name="type"
                  className="form-select"
                  value={form.type}
                  onChange={handleChange}
                  required
                >
                  <option value="initiation">Stage d'initiation</option>
                  <option value="perfectionnement">Stage de perfectionnement</option>
                  <option value="pfe">Stage PFE</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Statut *</label>
                <select
                  name="status"
                  className="form-select"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <option value="open">Ouverte</option>
                  <option value="closed">Fermée</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">URL de l'image</label>
              <input
                type="url"
                name="image"
                className="form-control"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {form.image && (
                <div className="mt-2">
                  <img
                    src={form.image}
                    alt="Aperçu"
                    style={{ maxHeight: '100px', borderRadius: '8px' }}
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                value={form.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Exigences</label>
              <textarea
                name="requirements"
                className="form-control"
                rows="3"
                value={form.requirements}
                onChange={handleChange}
                placeholder="Compétences requises, prérequis..."
              ></textarea>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i> Enregistrer
                  </>
                )}
              </button>
              <Link to="/admin/offers" className="btn btn-outline-secondary">
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditOffer;
