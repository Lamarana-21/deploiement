import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div id="layoutError">
      <div id="layoutError_content">
        <main>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="text-center mt-4">
                  <img className="mb-4 img-error" src="/assets/img/error-404-monochrome.svg" alt="404 Error" />
                  <p className="lead">La page demandée est introuvable.</p>
                  <Link to="/">
                    <i className="fas fa-arrow-left me-1"></i>
                    Retour au tableau de bord
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <div id="layoutError_footer">
        <footer className="py-4 bg-light mt-auto">
          <div className="container-fluid px-4">
            <div className="row align-items-center small">
              <div className="col-md-6 text-muted">
                © 2026 Gestion des Offres de Stage — Plateforme de stages (étudiants, enseignants, administration).
              </div>
              <div className="col-md-6 text-md-end">
                <Link to="/a-propos">À propos</Link>
                {' '}·{' '}
                <Link to="/contact">Contact</Link>
                {' '}·{' '}
                <Link to="/faq">FAQ</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NotFound;
