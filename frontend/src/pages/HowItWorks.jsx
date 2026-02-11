import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <div className="mt-4">
      <h1 className="mb-4">
        <i className="fas fa-info-circle text-primary me-2"></i>
        Comment ça marche ?
      </h1>

      <div className="row mb-5">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body text-center py-4">
              <h4>Trouvez votre stage en 3 étapes simples</h4>
              <p className="text-muted mb-0">
                Notre plateforme simplifie votre recherche de stage
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Étapes pour les étudiants */}
      <h3 className="mb-4">
        <i className="fas fa-user-graduate text-primary me-2"></i>
        Pour les Étudiants
      </h3>

      <div className="row mb-5">
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-primary">
            <div className="card-body text-center">
              <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                1
              </div>
              <h5>Créez votre compte</h5>
              <p className="text-muted">
                Inscrivez-vous gratuitement en quelques clics. Renseignez vos informations 
                personnelles et votre parcours académique.
              </p>
              <Link to="/register" className="btn btn-outline-primary btn-sm">
                S'inscrire maintenant
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100 border-success">
            <div className="card-body text-center">
              <div className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                2
              </div>
              <h5>Parcourez les offres</h5>
              <p className="text-muted">
                Explorez les offres de stage disponibles. Filtrez par type de stage 
                (initiation, perfectionnement, PFE) ou par entreprise.
              </p>
              <Link to="/offres" className="btn btn-outline-success btn-sm">
                Voir les offres
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100 border-warning">
            <div className="card-body text-center">
              <div className="rounded-circle bg-warning text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                3
              </div>
              <h5>Postulez et suivez</h5>
              <p className="text-muted">
                Postulez aux offres qui vous intéressent et suivez l'état de vos 
                candidatures depuis votre tableau de bord.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Types de stages */}
      <h3 className="mb-4">
        <i className="fas fa-layer-group text-info me-2"></i>
        Types de stages disponibles
      </h3>

      <div className="row mb-5">
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header bg-primary text-white">
              <i className="fas fa-seedling me-2"></i>
              Stage d'initiation
            </div>
            <div className="card-body">
              <p><strong>Durée :</strong> 1-2 mois</p>
              <p><strong>Niveau :</strong> 1ère et 2ème année</p>
              <p className="text-muted">
                Premier contact avec le monde professionnel. Découverte de l'entreprise 
                et des métiers. Observation et participation aux tâches simples.
              </p>
              <Link to="/offres?type=initiation" className="btn btn-primary btn-sm">
                Voir les offres
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header bg-warning text-dark">
              <i className="fas fa-chart-line me-2"></i>
              Stage de perfectionnement
            </div>
            <div className="card-body">
              <p><strong>Durée :</strong> 1-2 mois</p>
              <p><strong>Niveau :</strong> 2ème et 3ème année</p>
              <p className="text-muted">
                Approfondissement des compétences techniques. Réalisation de tâches 
                concrètes sous supervision. Application des connaissances théoriques.
              </p>
              <Link to="/offres?type=perfectionnement" className="btn btn-warning btn-sm">
                Voir les offres
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header bg-danger text-white">
              <i className="fas fa-award me-2"></i>
              Stage PFE
            </div>
            <div className="card-body">
              <p><strong>Durée :</strong> 4-6 mois</p>
              <p><strong>Niveau :</strong> Dernière année</p>
              <p className="text-muted">
                Projet de fin d'études. Réalisation d'un projet complet avec autonomie. 
                Rédaction d'un rapport et soutenance devant un jury.
              </p>
              <Link to="/offres?type=pfe" className="btn btn-danger btn-sm">
                Voir les offres
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Processus de candidature */}
      <h3 className="mb-4">
        <i className="fas fa-tasks text-success me-2"></i>
        Processus de candidature
      </h3>

      <div className="card mb-5">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-3 text-center mb-3 mb-md-0">
              <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-search fa-2x text-primary"></i>
              </div>
              <p className="mt-2 mb-0"><strong>Recherche</strong></p>
            </div>
            <div className="col-md-1 text-center d-none d-md-block">
              <i className="fas fa-arrow-right fa-2x text-muted"></i>
            </div>
            <div className="col-md-2 text-center mb-3 mb-md-0">
              <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-mouse-pointer fa-2x text-success"></i>
              </div>
              <p className="mt-2 mb-0"><strong>Candidature</strong></p>
            </div>
            <div className="col-md-1 text-center d-none d-md-block">
              <i className="fas fa-arrow-right fa-2x text-muted"></i>
            </div>
            <div className="col-md-2 text-center mb-3 mb-md-0">
              <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-hourglass-half fa-2x text-warning"></i>
              </div>
              <p className="mt-2 mb-0"><strong>Traitement</strong></p>
            </div>
            <div className="col-md-1 text-center d-none d-md-block">
              <i className="fas fa-arrow-right fa-2x text-muted"></i>
            </div>
            <div className="col-md-2 text-center">
              <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-check-circle fa-2x text-success"></i>
              </div>
              <p className="mt-2 mb-0"><strong>Réponse</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="card bg-primary text-white">
        <div className="card-body text-center py-5">
          <h3>Prêt à trouver votre stage ?</h3>
          <p className="mb-4">
            Rejoignez notre plateforme et accédez à toutes les offres de stage disponibles.
          </p>
          <Link to="/register" className="btn btn-light btn-lg me-2">
            <i className="fas fa-user-plus me-2"></i>
            Créer un compte
          </Link>
          <Link to="/offres" className="btn btn-outline-light btn-lg">
            <i className="fas fa-briefcase me-2"></i>
            Voir les offres
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
