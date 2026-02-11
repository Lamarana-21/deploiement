-- Migration: Ajouter les champs académiques pour les étudiants
-- Date: 2025-01-04

USE `GestionOffreStage`;

-- Ajout des colonnes pour les informations académiques des étudiants
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `cin` VARCHAR(50) NULL AFTER `role`,
  ADD COLUMN IF NOT EXISTS `annee` VARCHAR(50) NULL AFTER `cin`,
  ADD COLUMN IF NOT EXISTS `filiere` VARCHAR(255) NULL AFTER `annee`,
  ADD COLUMN IF NOT EXISTS `diplome` VARCHAR(255) NULL AFTER `filiere`,
  ADD COLUMN IF NOT EXISTS `classe` VARCHAR(100) NULL AFTER `diplome`;

-- Index pour recherche par CIN (optionnel mais utile)
-- ALTER TABLE `users` ADD INDEX `idx_users_cin` (`cin`);
