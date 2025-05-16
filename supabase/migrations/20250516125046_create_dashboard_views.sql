-- Create views for the Intel Dashboard application
-- These views should be created in your Supabase project

-- View for industry metrics
CREATE OR REPLACE VIEW v_dashboard_industry_metrics AS
SELECT 
  industry,
  COUNT(DISTINCT article_id) AS total_articles,
  COUNT(DISTINCT procedure_id) AS total_procedures,
  COUNT(DISTINCT category_id) AS total_categories,
  COUNT(DISTINCT provider_id) AS total_providers,
  ROUND(
    (COUNT(DISTINCT CASE WHEN article_date >= CURRENT_DATE - INTERVAL '30 days' THEN article_id END)::NUMERIC / 
     NULLIF(COUNT(DISTINCT CASE WHEN article_date >= CURRENT_DATE - INTERVAL '60 days' AND article_date < CURRENT_DATE - INTERVAL '30 days' THEN article_id END), 0) - 1) * 100, 
    1
  ) AS article_growth_rate,
  ROUND(
    (COUNT(DISTINCT CASE WHEN procedure_created_at >= CURRENT_DATE - INTERVAL '30 days' THEN procedure_id END)::NUMERIC / 
     NULLIF(COUNT(DISTINCT CASE WHEN procedure_created_at >= CURRENT_DATE - INTERVAL '60 days' AND procedure_created_at < CURRENT_DATE - INTERVAL '30 days' THEN procedure_id END), 0) - 1) * 100, 
    1
  ) AS procedure_growth_rate,
  ROUND(
    (COUNT(DISTINCT CASE WHEN provider_created_at >= CURRENT_DATE - INTERVAL '30 days' THEN provider_id END)::NUMERIC / 
     NULLIF(COUNT(DISTINCT CASE WHEN provider_created_at >= CURRENT_DATE - INTERVAL '60 days' AND provider_created_at < CURRENT_DATE - INTERVAL '30 days' THEN provider_id END), 0) - 1) * 100, 
    1
  ) AS provider_growth_rate
FROM 
  articles
  JOIN article_procedures ON articles.id = article_procedures.article_id
  JOIN procedures ON article_procedures.procedure_id = procedures.id
  JOIN categories ON procedures.category_id = categories.id
  LEFT JOIN article_providers ON articles.id = article_providers.article_id
  LEFT JOIN providers ON article_providers.provider_id = providers.id
GROUP BY 
  industry;

-- View for procedures
CREATE OR REPLACE VIEW v_dashboard_procedures AS
SELECT 
  p.id,
  p.name,
  p.industry,
  COUNT(ap.article_id) AS article_mentions,
  ROUND(AVG(p.expected_growth_rate), 1) AS avg_expected_growth
FROM 
  procedures p
  JOIN article_procedures ap ON p.id = ap.procedure_id
  JOIN articles a ON ap.article_id = a.id
WHERE 
  a.article_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY 
  p.id, p.name, p.industry
ORDER BY 
  article_mentions DESC;

-- View for categories
CREATE OR REPLACE VIEW v_dashboard_categories AS
SELECT 
  c.id,
  c.name,
  p.industry,
  COUNT(DISTINCT a.id) AS article_count
FROM 
  categories c
  JOIN procedures p ON c.id = p.category_id
  JOIN article_procedures ap ON p.id = ap.procedure_id
  JOIN articles a ON ap.article_id = a.id
WHERE 
  a.article_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY 
  c.id, c.name, p.industry
ORDER BY 
  article_count DESC;

-- View for market trends
CREATE OR REPLACE VIEW v_dashboard_market_trends AS
SELECT 
  t.id,
  t.name AS trend_name,
  t.industry,
  t.expected_growth_rate,
  t.impact_score,
  COUNT(at.article_id) AS article_mentions
FROM 
  trends t
  JOIN article_trends at ON t.id = at.trend_id
  JOIN articles a ON at.article_id = a.id
WHERE 
  a.article_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY 
  t.id, t.name, t.industry, t.expected_growth_rate, t.impact_score
ORDER BY 
  t.impact_score DESC;

-- View for providers
CREATE OR REPLACE VIEW v_dashboard_providers AS
SELECT 
  p.id,
  p.name,
  p.industry,
  p.location,
  ROUND(AVG(p.rating), 1) AS average_rating,
  COUNT(ap.article_id) AS article_mentions
FROM 
  providers p
  JOIN article_providers ap ON p.id = ap.provider_id
  JOIN articles a ON ap.article_id = a.id
WHERE 
  a.article_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY 
  p.id, p.name, p.industry, p.location
ORDER BY 
  average_rating DESC;
