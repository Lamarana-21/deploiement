import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

function TeacherEditProposal() {
  const { id } = useParams();
  const proposalId = Number(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    teacher_name: '',
    teacher_surname: '',
    subject_title: '',
    host_company: '',
    description: '',
    remark: '',
    email_sent: false,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/proposals/${proposalId}`);
        const data = await res.json();
        if (!cancelled) {
          if (res.ok && data.ok) {
            setForm({
              teacher_name: data.data.teacher_name || '',
              teacher_surname: data.data.teacher_surname || '',
              subject_title: data.data.subject_title || '',
              host_company: data.data.host_company || '',
              description: data.data.description || '',
              remark: data.data.remark || '',
              email_sent: !!data.data.email_sent,
            });
          } else {
            setError(data.message || 'Impossible de charger la proposition');
          }
        }
      } catch {
        if (!cancelled) setError('Erreur réseau');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (Number.isFinite(proposalId)) load();
    else {
      setLoading(false);
      setError('Identifiant invalide');
    }

    return () => {
      cancelled = true;
    };
  }, [proposalId]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        navigate('/teacher');
      } else {
        setError(data.message || 'Échec de la mise à jour');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 mb-0">
          <i className="fas fa-edit me-2"></i>
          Modifier une proposition
        </h1>
        <Link className="btn btn-outline-secondary" to="/teacher">
          Retour
        </Link>
      </div>

      {loading && (
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <span>Chargement...</span>
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="card">
          <div className="card-body">
            <form onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nom</label>
                  <input className="form-control" name="teacher_name" value={form.teacher_name} onChange={onChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Prénom</label>
                  <input className="form-control" name="teacher_surname" value={form.teacher_surname} onChange={onChange} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Intitulé</label>
                  <input className="form-control" name="subject_title" value={form.subject_title} onChange={onChange} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Entreprise (optionnel)</label>
                  <input className="form-control" name="host_company" value={form.host_company} onChange={onChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" value={form.description} onChange={onChange} rows={4} />
                </div>
                <div className="col-12">
                  <label className="form-label">Remarque</label>
                  <textarea className="form-control" name="remark" value={form.remark} onChange={onChange} rows={3} />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" name="email_sent" checked={form.email_sent} onChange={onChange} />
                    <label className="form-check-label">Email envoyé</label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherEditProposal;
