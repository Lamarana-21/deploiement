import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="mt-4">
      <h1 className="mb-4">À propos de notre plateforme</h1>
      
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-bullseye text-primary me-2"></i>
                Notre Mission
              </h5>
              <p className="card-text">
                Notre plateforme de gestion des stages a pour mission de faciliter la mise en relation 
                entre les étudiants à la recherche de stages et les entreprises proposant des opportunités 
                de formation professionnelle.
              </p>
              <p className="card-text">
                Nous simplifions le processus de recherche et de candidature pour permettre aux étudiants 
                de se concentrer sur l'essentiel : trouver le stage qui correspond à leurs aspirations 
                professionnelles.
              </p>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-graduation-cap text-success me-2"></i>
                Types de stages proposés
              </h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="border rounded p-3 h-100">
                    <h6 className="text-primary">
                      <i className="fas fa-seedling me-2"></i>
                      Stage d'initiation
                    </h6>
                    <p className="small text-muted mb-0">
                      Premier contact avec le monde professionnel. Idéal pour les étudiants 
                      en début de cursus.
                    </p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="border rounded p-3 h-100">
                    <h6 className="text-warning">
                      <i className="fas fa-chart-line me-2"></i>
                      Stage de perfectionnement
                    </h6>
                    <p className="small text-muted mb-0">
                      Approfondissement des compétences techniques et professionnelles 
                      acquises en formation.
                    </p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="border rounded p-3 h-100">
                    <h6 className="text-danger">
                      <i className="fas fa-award me-2"></i>
                      Stage PFE
                    </h6>
                    <p className="small text-muted mb-0">
                      Projet de fin d'études permettant de mettre en pratique l'ensemble 
                      des connaissances acquises.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-users text-info me-2"></i>
                Pour qui ?
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <h6><i className="fas fa-user-graduate me-2"></i>Étudiants</h6>
                  <ul>
                    <li>Parcourez les offres de stage disponibles</li>
                    <li>Postulez en quelques clics</li>
                    <li>Suivez l'état de vos candidatures</li>
                    <li>Gérez vos demandes de stage</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6><i className="fas fa-chalkboard-teacher me-2"></i>Enseignants</h6>
                  <ul>
                    <li>Proposez des sujets de stage</li>
                    <li>Encadrez les étudiants</li>
                    <li>Suivez les projets en cours</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card bg-primary text-white mb-4">
            <div className="card-body text-center">
              <i className="fas fa-rocket fa-3x mb-3"></i>
              <h5>Prêt à commencer ?</h5>
              <p>Créez votre compte gratuitement et accédez à toutes les offres de stage.</p>
              <Link to="/register" className="btn btn-light">
                <i className="fas fa-user-plus me-2"></i>
                Créer un compte
              </Link>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h6><i className="fas fa-envelope me-2"></i>Contact</h6>
              <p className="small text-muted">
                Une question ? N'hésitez pas à nous contacter.
              </p>
              <Link to="/contact" className="btn btn-outline-primary btn-sm">
                Nous contacter
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h6><i className="fas fa-question-circle me-2"></i>Besoin d'aide ?</h6>
              <p className="small text-muted">
                Consultez notre FAQ pour trouver des réponses à vos questions.
              </p>
              <Link to="/faq" className="btn btn-outline-secondary btn-sm">
                Voir la FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
