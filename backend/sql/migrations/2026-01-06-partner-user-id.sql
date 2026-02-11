-- Migration: Add partner_user_id to internship_requests
-- Date: 2026-01-06
-- Description: 
--   Ajoute une colonne partner_user_id pour lier le binôme à un utilisateur existant
--   Cela permet de suivre qui est le binôme et d'éviter les doublons

USE `GestionOffreStage`;

-- Ajouter la colonne partner_user_id si elle n'existe pas
ALTER TABLE `internship_requests`
ADD COLUMN IF NOT EXISTS `partner_user_id` INT UNSIGNED NULL AFTER `partner_class`;

-- Message de fin
SELECT 'Migration partner-user-id completed successfully' AS status;
