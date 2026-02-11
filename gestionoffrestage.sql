-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : dim. 28 déc. 2025 à 23:04
-- Version du serveur : 8.3.0
-- Version de PHP : 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestionoffrestage`
--

-- --------------------------------------------------------

--
-- Structure de la table `internship_offers`
--

DROP TABLE IF EXISTS `internship_offers`;
CREATE TABLE IF NOT EXISTS `internship_offers` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `company` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `requirements` text,
  `type` enum('initiation','perfectionnement','pfe') NOT NULL DEFAULT 'pfe',
  `image` varchar(255) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` enum('open','closed') DEFAULT 'open',
  `created_by` int UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_offer_created_by` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `internship_offers`
--

INSERT INTO `internship_offers` (`id`, `title`, `company`, `location`, `description`, `requirements`, `type`, `image`, `deadline`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Aplication mobile', 'Okenet', 'Djerba', 'C\'est un ck,kdhsnhx ,ksjhbkqk xhjngbjhkjq', 'Connaissance en Uml obligatoire', 'initiation', 'https://starlink.com/zw/roam?srsltid=AfmBOorU1ZbUbT-UnsdguQju-KhfEhHUOvVTGW_u9bv2ISMS75czC70Q', '2026-02-12', 'open', 7, '2025-12-28 02:06:24', '2025-12-28 02:06:24'),
(2, 'Plan Pro - Licence, Master, Ingenieurie', 'Innovation Formation', 'Sousse - Tunisie', 'Ce projet vise a concevoir et developper une application web et mobile permettant la planification.', 'HTML, CSS, JavaScript, React, Node.js', 'pfe', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', '2025-11-04', 'open', NULL, '2025-12-28 02:08:35', '2025-12-28 02:08:35'),
(3, 'Shop Ease - Licence, Master, Ingenieurie', 'Innovation Formation', 'Sousse - Tunisie', 'Ce projet consiste a concevoir et developper un site web dynamique et securise pour une boutique.', 'PHP, MySQL, Bootstrap', 'pfe', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', '2025-11-04', 'open', NULL, '2025-12-28 02:08:35', '2025-12-28 02:08:35'),
(4, 'Employee Metrics - Dashboard RH', 'Innovation Formation', 'Sousse - Tunisie', 'Ce projet a pour objectif de developper un tableau de bord interactif des performances.', 'React, Chart.js, Node.js', 'pfe', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', '2025-11-04', 'open', NULL, '2025-12-28 02:08:35', '2025-12-28 02:08:35'),
(5, 'Gestion de Stock - Stage Initiation', 'TechSoft Tunisia', 'Tunis - Tunisie', 'Developpement dune application de gestion de stock pour une PME.', 'Bases en HTML/CSS', 'initiation', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400', '2025-12-15', 'open', NULL, '2025-12-28 02:08:35', '2025-12-28 02:08:35'),
(6, 'Application Mobile E-Learning', 'EduTech Solutions', 'Sfax - Tunisie', 'Stage de perfectionnement pour developper une application mobile.', 'JavaScript, React Native', 'perfectionnement', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400', '2025-12-20', 'open', NULL, '2025-12-28 02:08:35', '2025-12-28 02:08:35'),
(7, 'Plan Pro - Licence, Master, Ingenieurie', 'Innovation Formation', 'Sousse - Tunisie', 'Ce projet vise a concevoir et developper une application web et mobile permettant la planification et la gestion des taches professionnelles.', 'HTML, CSS, JavaScript, React, Node.js', 'pfe', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', '2025-11-04', 'open', NULL, '2025-12-28 02:09:24', '2025-12-28 02:09:24'),
(8, 'Shop Ease - Licence, Master, Ingenieurie', 'Innovation Formation', 'Sousse - Tunisie', 'Ce projet consiste a concevoir et developper un site web dynamique et securise pour une boutique en ligne.', 'PHP, MySQL, Bootstrap, JavaScript', 'pfe', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop', '2025-11-04', 'open', NULL, '2025-12-28 02:09:24', '2025-12-28 02:09:24'),
(9, 'Employee Metrics - Dashboard RH', 'Innovation Formation', 'Sousse - Tunisie', 'Ce projet a pour objectif de developper un tableau de bord interactif offrant une vue complete des performances des employes.', 'React, Chart.js, Node.js, MongoDB', 'pfe', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', '2025-11-04', 'open', NULL, '2025-12-28 02:09:24', '2025-12-28 02:09:24'),
(10, 'Gestion de Stock - Stage Initiation', 'TechSoft Tunisia', 'Tunis - Tunisie', 'Developpement dune application de gestion de stock pour une PME. Apprentissage des bases du developpement web.', 'Bases en HTML/CSS, Motivation', 'initiation', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop', '2025-12-15', 'open', NULL, '2025-12-28 02:09:24', '2025-12-28 02:09:24'),
(11, 'Application Mobile E-Learning', 'EduTech Solutions', 'Sfax - Tunisie', 'Stage de perfectionnement pour developper une application mobile dapprentissage en ligne avec React Native.', 'JavaScript, React, Bases en mobile', 'perfectionnement', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop', '2025-12-20', 'open', NULL, '2025-12-28 02:09:24', '2025-12-28 02:09:24'),
(12, 'Plan Pro - Licence, Master, Ingenieurie', 'Innovation Formation', 'Sousse - Tunisie', 'Ce projet vise a concevoir et developper une application web et mobile permettant la planification et la gestion des taches professionnelles.', 'HTML, CSS, JavaScript, React, Node.js', 'pfe', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', '2025-11-04', 'open', NULL, '2025-12-28 02:09:54', '2025-12-28 03:37:41'),
(13, 'Shop Ease - Licence, Master, Ingenieurie', 'Innovation Formation', 'Sousse - Tunisie', 'Ce projet consiste a concevoir et developper un site web dynamique et securise pour une boutique en ligne.', 'PHP, MySQL, Bootstrap, JavaScript', 'pfe', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop', '2025-11-04', 'open', NULL, '2025-12-28 02:09:54', '2025-12-28 03:37:52'),
(14, 'Employee Metrics - Dashboard RH', 'Innovation Formation', 'Sousse - Tunisie', 'Ce projet a pour objectif de developper un tableau de bord interactif offrant une vue complete des performances des employes.', 'React, Chart.js, Node.js, MongoDB', 'pfe', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', '2025-11-04', 'open', NULL, '2025-12-28 02:09:54', '2025-12-28 03:37:53'),
(15, 'Gestion de Stock - Stage Initiation', 'TechSoft Tunisia', 'Tunis - Tunisie', 'Developpement dune application de gestion de stock pour une PME. Apprentissage des bases du developpement web.', 'Bases en HTML/CSS, Motivation', 'initiation', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop', '2025-12-15', 'open', NULL, '2025-12-28 02:09:54', '2025-12-28 03:37:54'),
(16, 'Application Mobile E-Learning', 'EduTech Solutions', 'Sfax - Tunisie', 'Stage de perfectionnement pour developper une application mobile dapprentissage en ligne avec React Native.', 'JavaScript, React, Bases en mobile', 'perfectionnement', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop', '2025-12-20', 'open', NULL, '2025-12-28 02:09:54', '2025-12-28 03:37:55');

-- --------------------------------------------------------

--
-- Structure de la table `internship_requests`
--

DROP TABLE IF EXISTS `internship_requests`;
CREATE TABLE IF NOT EXISTS `internship_requests` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_name` varchar(150) NOT NULL,
  `student_surname` varchar(150) NOT NULL,
  `has_partner` tinyint(1) DEFAULT '0',
  `partner_name` varchar(150) DEFAULT NULL,
  `partner_surname` varchar(150) DEFAULT NULL,
  `partner_phone` varchar(50) DEFAULT NULL,
  `partner_email` varchar(255) DEFAULT NULL,
  `partner_class` varchar(100) DEFAULT NULL,
  `has_subject` tinyint(1) DEFAULT '0',
  `isett_supervisor` varchar(150) DEFAULT NULL,
  `supervisor_id` int UNSIGNED DEFAULT NULL,
  `subject_title` text,
  `host_company` varchar(255) DEFAULT NULL,
  `student_class` varchar(100) NOT NULL,
  `student_phone` varchar(50) NOT NULL,
  `student_email` varchar(255) NOT NULL,
  `pfe_unit_remark` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `user_id` int UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `teacher_opinion` text,
  `teacher_validation` enum('pending','validated','invalidated') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `fk_internship_user` (`user_id`),
  KEY `fk_request_supervisor` (`supervisor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `internship_requests`
--

INSERT INTO `internship_requests` (`id`, `student_name`, `student_surname`, `has_partner`, `partner_name`, `partner_surname`, `partner_phone`, `partner_email`, `partner_class`, `has_subject`, `isett_supervisor`, `supervisor_id`, `subject_title`, `host_company`, `student_class`, `student_phone`, `student_email`, `pfe_unit_remark`, `status`, `user_id`, `created_at`, `updated_at`, `teacher_opinion`, `teacher_validation`) VALUES
(1, 'Alseny', 'cisse', 0, NULL, NULL, NULL, NULL, NULL, 1, 'Madame Mouna', NULL, 'Dsire un projet sur le projet ', 'isetdjerba', 'DSI22', '+21656867872', 'alsenycisse215@gmail.com', 'lkjvhgjojmljohlui\nlkbjvythgiolkjmm\nlkjgvythghh', 'approved', NULL, '2025-12-27 00:16:10', '2025-12-27 01:18:15', NULL, 'pending'),
(2, 'sa', ' emil', 1, 'Alseny', 'cisse', '56867872', 'alsenycisse215@gmail.com', 'l1', 0, 'Madame Mouna', NULL, 'tryufgiu', 'isetdjerba', 'DSI22', '+21656867872', 'saemil@gmail.com', 'rsdtfyguhijok', 'rejected', 3, '2025-12-27 01:22:14', '2025-12-28 03:06:10', NULL, 'pending'),
(3, 'Alseny', 'Alseny cisse', 0, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, 'isetdjerba', 'DSI22', '+21656867872', 'alsenycisse215@gmail.com', NULL, 'approved', 8, '2025-12-28 02:36:48', '2025-12-28 03:06:05', NULL, 'pending'),
(4, 'emil', 'Sa', 0, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, 'isetdjerba', 'DSI2', '+21656867', 'saemil@gmail.com', NULL, 'pending', 3, '2025-12-28 03:07:37', '2025-12-28 03:07:37', NULL, 'pending'),
(5, 'keita', 'Moussa', 0, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, 'isetdjerba', 'DSI22', '+21656867', 'moussa@gmail.com', NULL, 'approved', 11, '2025-12-28 23:50:26', '2025-12-28 23:57:07', NULL, 'pending');

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int UNSIGNED NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text,
  `link_url` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_read` (`user_id`,`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `offer_applications`
--

DROP TABLE IF EXISTS `offer_applications`;
CREATE TABLE IF NOT EXISTS `offer_applications` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `offer_id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_offer_user` (`offer_id`,`user_id`),
  KEY `fk_app_offer` (`offer_id`),
  KEY `fk_app_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `offer_applications`
--

INSERT INTO `offer_applications` (`id`, `offer_id`, `user_id`, `status`, `created_at`) VALUES
(1, 15, 8, 'pending', '2025-12-28 02:35:55'),
(2, 15, 9, 'pending', '2025-12-28 03:25:02'),
(3, 12, 10, 'pending', '2025-12-28 04:34:45'),
(4, 9, 10, 'pending', '2025-12-28 04:35:03'),
(5, 16, 2, 'pending', '2025-12-28 20:40:04'),
(6, 12, 11, 'pending', '2025-12-28 23:51:16');

-- --------------------------------------------------------

--
-- Structure de la table `offer_favorites`
--

DROP TABLE IF EXISTS `offer_favorites`;
CREATE TABLE IF NOT EXISTS `offer_favorites` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `offer_id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_fav_offer_user` (`offer_id`,`user_id`),
  KEY `fk_fav_offer` (`offer_id`),
  KEY `fk_fav_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `offer_favorites`
--

INSERT INTO `offer_favorites` (`id`, `offer_id`, `user_id`, `created_at`) VALUES
(1, 12, 2, '2025-12-28 20:12:19'),
(2, 13, 2, '2025-12-28 20:13:43'),
(3, 14, 2, '2025-12-28 20:13:45');

-- --------------------------------------------------------

--
-- Structure de la table `subject_proposals`
--

DROP TABLE IF EXISTS `subject_proposals`;
CREATE TABLE IF NOT EXISTS `subject_proposals` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `teacher_name` varchar(150) NOT NULL,
  `teacher_surname` varchar(150) NOT NULL,
  `subject_title` text NOT NULL,
  `host_company` varchar(255) DEFAULT NULL,
  `description` text,
  `remark` text,
  `email_sent` tinyint(1) DEFAULT '0',
  `status` enum('available','assigned','archived') DEFAULT 'available',
  `user_id` int UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_proposal_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `subject_proposals`
--

INSERT INTO `subject_proposals` (`id`, `teacher_name`, `teacher_surname`, `subject_title`, `host_company`, `description`, `remark`, `email_sent`, `status`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'dtfyghjk', 'dfcgvhb', 'dfcguhi', 'sdrtfyguhij', 'sdxfcyghijok', 'dfghijokpl', 1, 'archived', 4, '2025-12-27 01:15:20', '2025-12-28 03:06:21');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `fullname` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `cv_url` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') DEFAULT 'student',
  `reset_token_hash` varchar(255) DEFAULT NULL,
  `reset_token_expires_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `cv_url`, `password_hash`, `role`, `reset_token_hash`, `reset_token_expires_at`, `created_at`) VALUES
(1, 'alseny', 'alseny@gmail.com', NULL, '$2a$10$E1TWdKyHBw4xlEsCVussgesATO031SXA9Wivz/u815B1gow0wvTj2', 'student', NULL, NULL, '2025-12-26 22:34:32'),
(2, 'lamarana', 'lamarana@gmail.com', '/uploads/cv/cv-2-1766950646236.pdf', '$2a$10$mgIrdaqAwZ61cQ65qa2LkOMhbyU/AQFRPAi53.3Y.ihCzyWaQ6yse', 'student', NULL, NULL, '2025-12-26 22:36:15'),
(3, 'Sa emil', 'saemil@gmail.com', NULL, '$2a$10$YPWC6MpOOE9OBQESmivxqeEypDnboWmumeaIS8Y3Y.wO9J7PLDpEy', 'student', NULL, NULL, '2025-12-27 00:40:18'),
(4, 'oumouratou', 'oumouratou@gmail.com', NULL, '$2a$10$s.5ceZ.52J3CtDGqt4Aje.qadsTSFcxpZNZI0vSsVXoLzV/mSm89G', 'teacher', NULL, NULL, '2025-12-27 01:13:37'),
(5, 'ousmane diallo', 'mlamaranapalaga21@gmail.com', NULL, '$2a$10$h9oFon2lalwFQQZXG0oWnOUZmUcHiptXmv/Rd84yfynFrWhnRtZEC', 'admin', NULL, NULL, '2025-12-27 01:17:04'),
(6, 'Mamadou Lamarana Diallo', 'mlamaranapalaga22@gmail.com', NULL, '$2a$10$DVNcb.j9z5mI.TwPw.cqduuc0BLAB7Sl3uPn5bm5GbWis32U.g7lO', 'admin', NULL, NULL, '2025-12-28 00:33:16'),
(7, 'Alseny ciss', 'alsenycisse25@gmail.com', NULL, '$2a$10$sVSIqUqduOVqoe8h0Nku5e6oVTUg22qZsZwWvMraRWK3IHurpZkcu', 'admin', NULL, NULL, '2025-12-28 02:03:08'),
(8, 'Saran', 'saran@gmail.com', NULL, '$2a$10$l2yJZdo2d2BVDOhh8EwTluTEr7Jkx07M0PJjatp2CSJa3RLajzykS', 'student', NULL, NULL, '2025-12-28 02:33:47'),
(9, 'Traore Ibrahima', 'traoreibrahima215@gmail.com', NULL, '$2a$10$SNoofXOJd9SHiVd1TrzWKeu5cul8WuN5WtYGXGYx2SfA48GzNOCWK', 'student', NULL, NULL, '2025-12-28 03:17:30'),
(10, 'Tairou Diallo', 'tailrou@gmail.com', NULL, '$2a$10$6DfMN8PuIztNpGWSYu3odeO2e9L5cbnT9fdoPgi.GudPOYGV1c6Ya', 'student', NULL, NULL, '2025-12-28 04:34:14'),
(11, 'Moussa keita', 'moussa@gmail.com', '/uploads/cv/cv-11-1766953035705.pdf', '$2a$10$HPv1zAEt3CZLr9OeaU5sauceDl8GbwlU0y1fbGLRSS7MZQOdN0zAi', 'student', NULL, NULL, '2025-12-28 20:42:11');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `internship_offers`
--
ALTER TABLE `internship_offers`
  ADD CONSTRAINT `fk_offer_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `internship_requests`
--
ALTER TABLE `internship_requests`
  ADD CONSTRAINT `fk_internship_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_request_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `offer_applications`
--
ALTER TABLE `offer_applications`
  ADD CONSTRAINT `fk_app_offer` FOREIGN KEY (`offer_id`) REFERENCES `internship_offers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_app_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `offer_favorites`
--
ALTER TABLE `offer_favorites`
  ADD CONSTRAINT `fk_fav_offer` FOREIGN KEY (`offer_id`) REFERENCES `internship_offers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `subject_proposals`
--
ALTER TABLE `subject_proposals`
  ADD CONSTRAINT `fk_proposal_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
