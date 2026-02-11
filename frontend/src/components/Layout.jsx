import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarToggled, setSidebarToggled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadUnread = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }
      try {
        const res = await fetch('/api/notifications/unread-count');
        const data = await res.json();
        if (!cancelled && res.ok && data.ok) {
          setUnreadCount(data.count || 0);
        }
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    };

    loadUnread();
    const id = setInterval(loadUnread, 15000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'student':
        return 'Étudiant';
      case 'teacher':
        return 'Enseignant';
      case 'admin':
        return 'Administrateur';
      default:
        return role || '';
    }
  };

  // Define menu items based on role
  const getMenuItems = () => {
    if (!user) {
      // Menu for visitors (not logged in)
      return (
        <>
          <div className="sb-sidenav-menu-heading">Navigation</div>
          <Link className="nav-link" to="/offres">
            <div className="sb-nav-link-icon"><i className="fas fa-home"></i></div>
            Accueil
          </Link>
          
          <div className="sb-sidenav-menu-heading">Filtrer par type</div>
          <Link className="nav-link" to="/offres?type=initiation">
            <div className="sb-nav-link-icon"><i className="fas fa-seedling text-primary"></i></div>
            Stage d'initiation
          </Link>
          <Link className="nav-link" to="/offres?type=perfectionnement">
            <div className="sb-nav-link-icon"><i className="fas fa-chart-line text-warning"></i></div>
            Stage perfectionnement
          </Link>
          <Link className="nav-link" to="/offres?type=pfe">
            <div className="sb-nav-link-icon"><i className="fas fa-award text-danger"></i></div>
            Stage PFE
          </Link>
          
          <div className="sb-sidenav-menu-heading">Informations</div>
          <Link className="nav-link" to="/comment-ca-marche">
            <div className="sb-nav-link-icon"><i className="fas fa-info-circle"></i></div>
            Comment ça marche ?
          </Link>
          <Link className="nav-link" to="/faq">
            <div className="sb-nav-link-icon"><i className="fas fa-question-circle"></i></div>
            FAQ
          </Link>
          <Link className="nav-link" to="/a-propos">
            <div className="sb-nav-link-icon"><i className="fas fa-building"></i></div>
            À propos
          </Link>
          <Link className="nav-link" to="/contact">
            <div className="sb-nav-link-icon"><i className="fas fa-envelope"></i></div>
            Contact
          </Link>
          
          <div className="sb-sidenav-menu-heading">Connexion</div>
          <Link className="nav-link" to="/login">
            <div className="sb-nav-link-icon"><i className="fas fa-sign-in-alt"></i></div>
            Se connecter
          </Link>
          <Link className="nav-link" to="/register">
            <div className="sb-nav-link-icon"><i className="fas fa-user-plus"></i></div>
            Créer un compte
          </Link>
        </>
      );
    }

    switch (user.role) {
      case 'student':
        return (
          <>
            <div className="sb-sidenav-menu-heading">Étudiant</div>
            <Link className="nav-link" to="/student">
              <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"></i></div>
              Tableau de bord
            </Link>
            <Link className="nav-link" to="/offres">
              <div className="sb-nav-link-icon"><i className="fas fa-briefcase"></i></div>
              Offres de stage
            </Link>
            <Link className="nav-link" to="/student/favorites">
              <div className="sb-nav-link-icon"><i className="fas fa-heart"></i></div>
              Mes favoris
            </Link>
            <Link className="nav-link" to="/student/applications">
              <div className="sb-nav-link-icon"><i className="fas fa-clipboard-list"></i></div>
              Mes candidatures
            </Link>
            <Link className="nav-link" to="/student/new-request">
              <div className="sb-nav-link-icon"><i className="fas fa-file-alt"></i></div>
              Nouvelle Demande
            </Link>
          </>
        );
      
      case 'teacher':
        return (
          <>
            <div className="sb-sidenav-menu-heading">Enseignant</div>
            <Link className="nav-link" to="/teacher">
              <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"></i></div>
              Tableau de bord
            </Link>
            <Link className="nav-link" to="/teacher/new-proposal">
              <div className="sb-nav-link-icon"><i className="fas fa-lightbulb"></i></div>
              Nouvelle Proposition
            </Link>
          </>
        );
      
      case 'admin':
        return (
          <>
            <div className="sb-sidenav-menu-heading">Administration</div>
            <Link className="nav-link" to="/admin">
              <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"></i></div>
              Tableau de bord
            </Link>
            <Link className="nav-link" to="/admin/offers">
              <div className="sb-nav-link-icon"><i className="fas fa-briefcase"></i></div>
              Gestion des offres
            </Link>
            <Link className="nav-link" to="/admin/proposals">
              <div className="sb-nav-link-icon"><i className="fas fa-clipboard-check"></i></div>
              Propositions enseignants
            </Link>
            <Link className="nav-link" to="/admin/applications">
              <div className="sb-nav-link-icon"><i className="fas fa-file-alt"></i></div>
              Gestion des candidatures
            </Link>
            <Link className="nav-link" to="/admin/messages">
              <div className="sb-nav-link-icon"><i className="fas fa-envelope-open-text"></i></div>
              Messages de contact
            </Link>
            <Link className="nav-link" to="/admin/new-offer">
              <div className="sb-nav-link-icon"><i className="fas fa-plus-circle"></i></div>
              Nouvelle Offre
            </Link>
          </>
        );
      
      default:
        return null;
    }
  };

  // Ajouter la classe sb-nav-fixed au body quand le Layout est monté
  useEffect(() => {
    document.body.classList.add('sb-nav-fixed');
    // Apply sidebar toggle state
    if (sidebarToggled) {
      document.body.classList.add('sb-sidenav-toggled');
    } else {
      document.body.classList.remove('sb-sidenav-toggled');
    }
    return () => {
      document.body.classList.remove('sb-nav-fixed');
      document.body.classList.remove('sb-sidenav-toggled');
    };
  }, [sidebarToggled]);

  // Handle sidebar toggle - managed by React instead of external script
  const handleSidebarToggle = useCallback((e) => {
    e.preventDefault();
    setSidebarToggled(prev => {
      const newValue = !prev;
      localStorage.setItem('sb|sidebar-toggle', String(newValue));
      return newValue;
    });
  }, []);

  return (
    <>
      <nav className="sb-topnav navbar navbar-expand navbar-dark bg-dark">
        <Link className="navbar-brand ps-3" to="/">Gestion des Offres de Stage</Link>
        <button 
          className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" 
          id="sidebarToggle" 
          onClick={handleSidebarToggle}
          type="button"
        >
          <i className="fas fa-bars"></i>
        </button>
        <form className="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
          <div className="input-group">
            <input className="form-control" type="text" placeholder="Rechercher..." aria-label="Rechercher" aria-describedby="btnNavbarSearch" />
            <button className="btn btn-primary" id="btnNavbarSearch" type="button"><i className="fas fa-search"></i></button>
          </div>
        </form>
        <ul className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
          {user && (
            <li className="nav-item me-2">
              <Link className="nav-link position-relative" to="/notifications" title="Notifications">
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger"
                    style={{ fontSize: '0.65rem' }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </li>
          )}
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i className="fas fa-user fa-fw me-1"></i>
              {user ? user.fullname : 'Invité'}
            </a>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
              {user ? (
                <>
                  <li><span className="dropdown-item-text"><strong>{user.fullname}</strong></span></li>
                  <li><span className="dropdown-item-text text-muted">{getRoleLabel(user.role)}</span></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to="/profile"><i className="fas fa-user-circle me-2"></i>Mon Profil</Link></li>
                  <li><Link className="dropdown-item" to="/notifications"><i className="fas fa-bell me-2"></i>Notifications</Link></li>
                  <li><a className="dropdown-item" href="#!"><i className="fas fa-cog me-2"></i>Paramètres</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>Déconnexion
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link className="dropdown-item" to="/login"><i className="fas fa-sign-in-alt me-2"></i>Se connecter</Link></li>
                  <li><Link className="dropdown-item" to="/register"><i className="fas fa-user-plus me-2"></i>Créer un compte</Link></li>
                </>
              )}
            </ul>
          </li>
        </ul>
      </nav>
      <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
          <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
            <div className="sb-sidenav-menu">
              <div className="nav">
                {getMenuItems()}
              </div>
            </div>
            <div className="sb-sidenav-footer">
              <div className="small">Connecté en tant que:</div>
              {user ? user.fullname : 'Invité'}
            </div>
          </nav>
        </div>
        <div id="layoutSidenav_content">
          <main className="flex-grow-1">
            <div className="container-fluid px-3 px-sm-4 pb-4">
              <Outlet />
            </div>
          </main>
          <footer className="py-2 py-sm-3 bg-dark text-white-50 mt-auto">
            <div className="container-fluid px-3 px-sm-4">
              <div className="row align-items-center small">
                <div className="col-12 col-md-6 mb-2 mb-md-0">
                  © {new Date().getFullYear()} <strong className="text-white">Gestion des Offres de Stage</strong>
                  <span className="ms-2 d-none d-sm-inline">Plateforme de stages ISETT</span>
                </div>
                <div className="col-12 col-md-6 text-md-end">
                  <Link className="text-white-50 me-2" to="/a-propos" style={{ textDecoration: 'none' }}>À propos</Link>
                  <span className="d-none d-sm-inline">·</span>
                  <Link className="text-white-50 mx-1 mx-sm-2" to="/contact" style={{ textDecoration: 'none' }}>Contact</Link>
                  <span className="d-none d-sm-inline">·</span>
                  <Link className="text-white-50 ms-1 ms-sm-2" to="/faq" style={{ textDecoration: 'none' }}>FAQ</Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Layout;
