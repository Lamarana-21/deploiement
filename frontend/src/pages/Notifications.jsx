import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '../components/Pagination';

function Notifications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page')) || 1;

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/notifications?page=${page}&limit=10`);
      const data = await res.json();
      if (res.ok && data.ok) {
        setNotifications(data.notifications || []);
        setPagination(data.pagination || null);
      } else {
        setError(data.message || 'Impossible de charger les notifications');
      }
    } catch (e) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const markRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
      }
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
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
          <i className="fas fa-bell me-2"></i>
          Notifications
        </h1>
        <button className="btn btn-outline-secondary" onClick={markAllRead}>
          Marquer tout comme lu
        </button>
      </div>

      {loading && (
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <span>Chargement...</span>
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && notifications.length === 0 && (
        <div className="alert alert-info">Aucune notification.</div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <>
          <div className="list-group">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`list-group-item d-flex justify-content-between align-items-start gap-3 ${n.is_read ? '' : 'list-group-item-warning'}`}
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    <strong>{n.title}</strong>
                    {!n.is_read && <span className="badge text-bg-warning">Nouveau</span>}
                  </div>
                  {n.body && <div className="text-muted">{n.body}</div>}
                  <div className="small text-muted">{new Date(n.created_at).toLocaleString('fr-FR')}</div>
                  {n.link_url && (
                    <div className="mt-2">
                      <Link to={n.link_url} className="btn btn-sm btn-outline-primary" onClick={() => markRead(n.id)}>
                        Ouvrir
                      </Link>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => markRead(n.id)}
                    disabled={!!n.is_read}
                  >
                    Marquer lu
                  </button>
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

export default Notifications;
