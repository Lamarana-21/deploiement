import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Général',
      questions: [
        {
          q: "Qu'est-ce que cette plateforme ?",
          a: "C'est une plateforme de gestion des offres de stage qui permet aux étudiants de trouver des stages et aux entreprises de publier leurs offres. Elle facilite la mise en relation entre les différents acteurs du monde académique et professionnel."
        },
        {
          q: "Est-ce que l'inscription est gratuite ?",
          a: "Oui, l'inscription est totalement gratuite pour les étudiants et les enseignants. Créez votre compte en quelques minutes et accédez à toutes les fonctionnalités."
        },
        {
          q: "Quels types de stages sont proposés ?",
          a: "Nous proposons trois types de stages : les stages d'initiation (premier contact avec le monde professionnel), les stages de perfectionnement (approfondissement des compétences) et les stages PFE (projet de fin d'études)."
        }
      ]
    },
    {
      category: 'Étudiants',
      questions: [
        {
          q: "Comment postuler à une offre de stage ?",
          a: "Après vous être connecté à votre compte étudiant, parcourez les offres disponibles, cliquez sur celle qui vous intéresse, puis cliquez sur le bouton 'Postuler'. Votre candidature sera envoyée à l'administrateur qui la traitera."
        },
        {
          q: "Comment suivre mes candidatures ?",
          a: "Dans votre tableau de bord étudiant, accédez à la section 'Mes candidatures' pour voir l'état de toutes vos candidatures (en attente, acceptée, refusée)."
        },
        {
          q: "Puis-je postuler à plusieurs offres ?",
          a: "Oui, vous pouvez postuler à autant d'offres que vous le souhaitez. Cependant, vous ne pouvez postuler qu'une seule fois à chaque offre."
        },
        {
          q: "Comment créer une demande de stage ?",
          a: "Depuis votre tableau de bord, cliquez sur 'Nouvelle Demande' et remplissez le formulaire avec vos informations personnelles, votre classe, et les détails de votre demande de stage."
        }
      ]
    },
    {
      category: 'Enseignants',
      questions: [
        {
          q: "Comment proposer un sujet de stage ?",
          a: "Connectez-vous à votre compte enseignant, puis accédez à 'Nouvelle Proposition' pour soumettre un sujet de stage avec sa description et l'entreprise d'accueil si connue."
        },
        {
          q: "Puis-je modifier une proposition déjà soumise ?",
          a: "Contactez l'administrateur pour toute modification de proposition déjà soumise."
        }
      ]
    },
    {
      category: 'Compte',
      questions: [
        {
          q: "J'ai oublié mon mot de passe, que faire ?",
          a: "Cliquez sur 'Mot de passe oublié' sur la page de connexion et suivez les instructions pour réinitialiser votre mot de passe."
        },
        {
          q: "Comment modifier mes informations personnelles ?",
          a: "Accédez aux paramètres de votre compte depuis le menu déroulant en haut à droite pour modifier vos informations."
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="fas fa-question-circle text-primary me-2"></i>
          Foire Aux Questions
        </h1>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="fas fa-folder me-2"></i>
                  {category.category}
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="accordion accordion-flush">
                  {category.questions.map((item, qIndex) => {
                    const key = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === key;
                    return (
                      <div key={qIndex} className="accordion-item">
                        <h2 className="accordion-header">
                          <button
                            className={`accordion-button ${!isOpen ? 'collapsed' : ''}`}
                            type="button"
                            onClick={() => toggleQuestion(catIndex, qIndex)}
                          >
                            {item.q}
                          </button>
                        </h2>
                        <div className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}>
                          <div className="accordion-body text-muted">
                            {item.a}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-lg-4">
          <div className="card bg-light mb-4">
            <div className="card-body">
              <h5>
                <i className="fas fa-search me-2"></i>
                Vous ne trouvez pas votre réponse ?
              </h5>
              <p className="text-muted">
                Si vous n'avez pas trouvé la réponse à votre question, n'hésitez pas à nous contacter directement.
              </p>
              <Link to="/contact" className="btn btn-primary">
                <i className="fas fa-envelope me-2"></i>
                Nous contacter
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5>
                <i className="fas fa-book me-2"></i>
                Guide de démarrage
              </h5>
              <p className="text-muted small">
                Nouveau sur la plateforme ? Consultez notre guide pour bien débuter.
              </p>
              <Link to="/comment-ca-marche" className="btn btn-outline-primary btn-sm">
                Comment ça marche ?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
