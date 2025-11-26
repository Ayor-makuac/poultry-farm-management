-- Poultry Farm Management System Database Initialization Script
-- Run this script in MySQL to create the database

CREATE DATABASE IF NOT EXISTS poultry_farm_db;
USE poultry_farm_db;

-- Note: Tables will be created automatically by Sequelize models
-- This script is just for database creation
-- The actual table creation is handled by Sequelize sync

SELECT 'Database poultry_farm_db created successfully!' AS message;

