-- Schema for GestionOffreStage (Stage Management System)
-- Run via: npm run db:init

CREATE DATABASE IF NOT EXISTS `GestionOffreStage` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `GestionOffreStage`;

-- Users table (auth)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `fullname` VARCHAR(150) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'teacher', 'admin') DEFAULT 'student',
  `cin` VARCHAR(50) NULL,
  `annee` VARCHAR(50) NULL,
  `filiere` VARCHAR(255) NULL,
  `diplome` VARCHAR(255) NULL,
  `classe` VARCHAR(100) NULL,
  `cv_url` VARCHAR(255) NULL,
  `avatar_url` VARCHAR(255) NULL,
  `reset_token_hash` VARCHAR(255) NULL,
  `reset_token_expires_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_users_email` (`email`)
) ENGINE=InnoDB;

-- Internship requests (Module Étudiant)
CREATE TABLE IF NOT EXISTS `internship_requests` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_name` VARCHAR(150) NOT NULL,
  `student_surname` VARCHAR(150) NOT NULL,
  `has_partner` TINYINT(1) DEFAULT 0,
  `partner_name` VARCHAR(150) NULL,
  `partner_surname` VARCHAR(150) NULL,
  `partner_phone` VARCHAR(50) NULL,
  `partner_email` VARCHAR(255) NULL,
  `partner_class` VARCHAR(100) NULL,
  `has_subject` TINYINT(1) DEFAULT 0,
  `isett_supervisor` VARCHAR(150) NULL,
  `subject_title` TEXT NULL,
  `host_company` VARCHAR(255) NULL,
  `student_class` VARCHAR(100) NOT NULL,
  `student_phone` VARCHAR(50) NOT NULL,
  `student_email` VARCHAR(255) NOT NULL,
  `pfe_unit_remark` TEXT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `user_id` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_internship_user` (`user_id`),
  CONSTRAINT `fk_internship_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Subject proposals (Module Enseignant)
CREATE TABLE IF NOT EXISTS `subject_proposals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `teacher_name` VARCHAR(150) NOT NULL,
  `teacher_surname` VARCHAR(150) NOT NULL,
  `subject_title` TEXT NOT NULL,
  `host_company` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `remark` TEXT NULL,
  `email_sent` TINYINT(1) DEFAULT 0,
  `status` ENUM('available', 'assigned', 'archived') DEFAULT 'available',
  `user_id` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_proposal_user` (`user_id`),
  CONSTRAINT `fk_proposal_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Drop and recreate internship_offers to ensure schema is up to date
DROP TABLE IF EXISTS `offer_applications`;
DROP TABLE IF EXISTS `internship_offers`;

-- Internship offers (Created by Admin, visible on public home)
CREATE TABLE `internship_offers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NULL,
  `description` TEXT NOT NULL,
  `requirements` TEXT NULL,
  `type` ENUM('initiation', 'perfectionnement', 'pfe') NOT NULL DEFAULT 'pfe',
  `image` VARCHAR(255) NULL,
  `deadline` DATE NULL,
  `status` ENUM('open', 'closed') DEFAULT 'open',
  `created_by` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_offer_created_by` (`created_by`),
  CONSTRAINT `fk_offer_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Offer applications (Students apply to offers)
CREATE TABLE `offer_applications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `offer_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `status` ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_offer_user` (`offer_id`, `user_id`),
  KEY `fk_app_offer` (`offer_id`),
  KEY `fk_app_user` (`user_id`),
  CONSTRAINT `fk_app_offer` FOREIGN KEY (`offer_id`) REFERENCES `internship_offers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_app_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Offer favorites (Students can save offers)
CREATE TABLE IF NOT EXISTS `offer_favorites` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `offer_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_fav_offer_user` (`offer_id`, `user_id`),
  KEY `fk_fav_offer` (`offer_id`),
  KEY `fk_fav_user` (`user_id`),
  CONSTRAINT `fk_fav_offer` FOREIGN KEY (`offer_id`) REFERENCES `internship_offers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Notifications (in-app)
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NULL,
  `link_url` VARCHAR(255) NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_read` (`user_id`, `is_read`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
