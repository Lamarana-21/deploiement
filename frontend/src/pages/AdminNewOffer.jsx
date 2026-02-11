import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminNewOffer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    deadline: '',
    description: '',
    requirements: '',
    type: 'pfe',
    image: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('https://lamarana-kepler.onrender.com/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          company: formData.company,
          location: formData.location,
          deadline: formData.deadline,
          description: formData.description,
          requirements: formData.requirements,
          type: formData.type,
          image: formData.image,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        alert('Offre créée avec succès');
        navigate('/');
      } else {
        alert(data.message || 'Création échouée');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h1 className="mb-3">Créer une offre de stage</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-floating mb-3">
          <input className="form-control" id="title" type="text" placeholder="Titre" value={formData.title} onChange={handleChange} required />
          <label htmlFor="title">Titre</label>
        </div>

        <div className="form-floating mb-3">
          <input className="form-control" id="company" type="text" placeholder="Entreprise" value={formData.company} onChange={handleChange} required />
          <label htmlFor="company">Entreprise</label>
        </div>

        <div className="form-floating mb-3">
          <input className="form-control" id="location" type="text" placeholder="Lieu" value={formData.location} onChange={handleChange} />
          <label htmlFor="location">Lieu (optionnel)</label>
        </div>

        <div className="form-floating mb-3">
          <input className="form-control" id="deadline" type="date" placeholder="Date limite" value={formData.deadline} onChange={handleChange} />
          <label htmlFor="deadline">Date limite (optionnel)</label>
        </div>

        <div className="form-floating mb-3">
          <select className="form-select" id="type" value={formData.type} onChange={handleChange}>
            <option value="initiation">Stage d'initiation</option>
            <option value="perfectionnement">Stage de perfectionnement</option>
            <option value="pfe">Stage PFE</option>
          </select>
          <label htmlFor="type">Type de stage</label>
        </div>

        <div className="form-floating mb-3">
          <input className="form-control" id="image" type="text" placeholder="URL de l'image" value={formData.image} onChange={handleChange} />
          <label htmlFor="image">URL de l'image (optionnel)</label>
        </div>

        <div className="form-floating mb-3">
          <textarea className="form-control" id="description" placeholder="Description" style={{ height: '160px' }} value={formData.description} onChange={handleChange} required />
          <label htmlFor="description">Description</label>
        </div>

        <div className="form-floating mb-3">
          <textarea className="form-control" id="requirements" placeholder="Exigences" style={{ height: '140px' }} value={formData.requirements} onChange={handleChange} />
          <label htmlFor="requirements">Exigences (optionnel)</label>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer'}
        </button>
      </form>
    </div>
  );
};

export default AdminNewOffer;
