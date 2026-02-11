-- Migration: Teacher Approval System
-- Date: 2026-01-05
-- Description: 
--   1. Ajoute un système d'approbation des propositions enseignantes
--   2. Les enseignants doivent être approuvés par l'admin avant d'apparaître comme encadrants
--   3. Un encadrant peut superviser max 2 étudiants (seulement s'ils sont binômes)

USE `GestionOffreStage`;

-- Modifier le statut des propositions pour inclure pending/approved/rejected
-- D'abord, on vérifie si la colonne approval_status existe
SET @column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'GestionOffreStage' 
    AND TABLE_NAME = 'subject_proposals' 
    AND COLUMN_NAME = 'approval_status'
);

-- Ajouter la colonne approval_status si elle n'existe pas
ALTER TABLE `subject_proposals` 
ADD COLUMN IF NOT EXISTS `approval_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER `status`;

-- Ajouter une colonne pour stocker la raison du rejet (optionnel)
ALTER TABLE `subject_proposals`
ADD COLUMN IF NOT EXISTS `rejection_reason` TEXT NULL AFTER `approval_status`;

-- Ajouter une colonne approved_at pour savoir quand la proposition a été approuvée
ALTER TABLE `subject_proposals`
ADD COLUMN IF NOT EXISTS `approved_at` DATETIME NULL AFTER `rejection_reason`;

-- Ajouter approved_by pour savoir quel admin a approuvé
ALTER TABLE `subject_proposals`
ADD COLUMN IF NOT EXISTS `approved_by` INT UNSIGNED NULL AFTER `approved_at`;

-- Ajouter une contrainte de clé étrangère pour approved_by
-- (On ignore l'erreur si elle existe déjà)
-- ALTER TABLE `subject_proposals`
-- ADD CONSTRAINT `fk_proposal_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- Modifier la table internship_requests pour ajouter la référence à l'encadrant (user_id de l'enseignant)
ALTER TABLE `internship_requests`
ADD COLUMN IF NOT EXISTS `supervisor_id` INT UNSIGNED NULL AFTER `isett_supervisor`;

-- Ajouter un index sur supervisor_id pour les recherches
-- CREATE INDEX IF NOT EXISTS `idx_internship_supervisor` ON `internship_requests` (`supervisor_id`);

-- Créer une vue pour compter les étudiants encadrés par chaque enseignant
-- Cette vue compte uniquement les demandes approuvées
CREATE OR REPLACE VIEW `supervisor_student_count` AS
SELECT 
    u.id AS supervisor_id,
    u.fullname AS supervisor_name,
    COUNT(DISTINCT ir.id) AS student_count,
    -- Compte le nombre de binômes (demandes avec partenaire)
    SUM(CASE WHEN ir.has_partner = 1 THEN 1 ELSE 0 END) AS binome_count,
    -- Compte le nombre d'étudiants solo
    SUM(CASE WHEN ir.has_partner = 0 THEN 1 ELSE 0 END) AS solo_count
FROM users u
LEFT JOIN internship_requests ir ON ir.supervisor_id = u.id AND ir.status = 'approved'
WHERE u.role = 'teacher'
GROUP BY u.id, u.fullname;

-- Message de fin
SELECT 'Migration teacher-approval-system completed successfully' AS status;
