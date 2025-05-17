-- Migration to add market size column to procedure tables
-- Date: 2025-05-17

-- For dental procedures
ALTER TABLE dental_procedures 
ADD COLUMN IF NOT EXISTS market_size_usd_millions DECIMAL;

-- Update dental procedures with market size data from standardized categories
UPDATE dental_procedures dp
SET market_size_usd_millions = spc.market_size_usd_millions
FROM standardized_procedure_categories spc
WHERE dp.category = spc.name OR dp.clinical_category = spc.name;

-- For aesthetic procedures
ALTER TABLE aesthetic_procedures 
ADD COLUMN IF NOT EXISTS market_size_usd_millions DECIMAL;

-- Update aesthetic procedures with market size data from standardized categories
UPDATE aesthetic_procedures ap
SET market_size_usd_millions = spc.market_size_usd_millions
FROM standardized_procedure_categories spc
WHERE ap.category = spc.name;

-- Add a comment explaining what this column represents
COMMENT ON COLUMN dental_procedures.market_size_usd_millions IS 'Total market size in millions USD';
COMMENT ON COLUMN aesthetic_procedures.market_size_usd_millions IS 'Total market size in millions USD';
