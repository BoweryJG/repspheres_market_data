-- Add procedure_source column to all_procedures table
ALTER TABLE all_procedures 
ADD COLUMN procedure_source TEXT;

-- Populate it with 'dental' for all existing records
UPDATE all_procedures 
SET procedure_source = 'dental';

-- Make it non-nullable for future records
ALTER TABLE all_procedures 
ALTER COLUMN procedure_source SET NOT NULL;
