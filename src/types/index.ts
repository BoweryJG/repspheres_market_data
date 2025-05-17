// Legacy category interfaces
export interface DentalCategory {
  id: number;
  name: string;
  description?: string;
  market_size_usd_millions?: number;
  avg_growth_rate?: number;
  [key: string]: any;
}

export interface AestheticCategory {
  id: number;
  name: string;
  description?: string;
  market_size_usd_millions?: number;
  avg_growth_rate?: number;
  [key: string]: any;
}

// New hierarchical category system
export interface CategoryHierarchy {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  applicable_to: 'dental' | 'aesthetic' | 'both';
  description?: string;
  avg_growth_rate?: number;
  market_size_usd_millions?: number;
  icon_name?: string;
  color_code?: string;
  display_order?: number;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Added fields for UI rendering
  children?: CategoryHierarchy[];
  level?: number;
  isExpanded?: boolean;
  procedureCount?: number;
}

export interface ProcedureBase {
  id: number;
  name?: string;
  procedure_name?: string;
  description?: string;
  category?: string;
  category_id?: number;
  yearly_growth_percentage?: number | string;
  average_cost_usd?: number | string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface DentalProcedure extends ProcedureBase {
  expanded_description?: string;
  clinical_category?: string;
  clinical_category_id?: number;
  complexity?: string;
  procedure_duration_min?: number;
  recovery_time_days?: number;
  risks?: string;
  contraindications?: string;
}

export interface AestheticProcedure extends ProcedureBase {
  downtime?: string;
  number_of_sessions?: number;
  results_duration?: string;
  body_areas_applicable?: string;
  skin_types_applicable?: string;
}

export interface Company {
  id: number;
  name: string;
  description?: string;
  website?: string;
  website_url?: string;
  headquarters?: string;
  logo_url?: string;
  social_links?: any;
  founded_year?: number;
  ceo?: string;
  employee_count?: number;
  num_employees?: number;
  company_category_id?: number;
  dental_category_id?: number;
  aesthetic_category_id?: number;
  key_products?: string;
  specialties?: string[];
  products?: string[];
  market_share_pct?: number;
  market_size_2025_usd_billion?: number;
  projected_growth_pct?: number;
  revenue?: string;
  last_year_sales_usd_million?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}
