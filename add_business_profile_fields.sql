
-- Add business profile fields to restaurants table
ALTER TABLE restaurants 
ADD COLUMN phone VARCHAR(20),
ADD COLUMN business_email VARCHAR(255),
ADD COLUMN website VARCHAR(255),
ADD COLUMN business_type VARCHAR(100);

