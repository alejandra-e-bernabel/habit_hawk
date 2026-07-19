-- Migration to add user profile fields
-- Run this to add first_name, last_name, profile_icon_name, and profile_image_url to users table

ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN profile_icon_name VARCHAR(50);
ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(500);
