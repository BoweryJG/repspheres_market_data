export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      procedures: {
        Row: {
          id: number
          procedure_name: string
          industry: string
          category: string
          normalized_category: string
          description: string
          technology_type: string
          yearly_growth_percentage: number
          market_size_2025_usd_millions: number
          complexity: string
          duration_minutes: number
          pain_level: string
          patient_satisfaction: number
          risks: string
          downtime: string
          contraindications: string
          fda_status: string
          average_cost_usd: number
          company_name: string
          trending_score: number
          is_featured: boolean
          market_growth_cagr: number
          market_rank: number
          popularity_score: number
          is_trending: boolean
          demand_score: number
          roi_score: number
          regional_popularity: Json
          age_demographics: Json
          insurance_coverage_pct: number
          primary_concern: string
          clinical_category_id: number
          aesthetic_category_id: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          procedure_name: string
          industry: string
          category: string
          normalized_category?: string
          description: string
          technology_type: string
          yearly_growth_percentage: number
          market_size_2025_usd_millions: number
          complexity: string
          duration_minutes: number
          pain_level: string
          patient_satisfaction: number
          risks: string
          downtime: string
          contraindications: string
          fda_status: string
          average_cost_usd: number
          company_name: string
          trending_score: number
          is_featured?: boolean
          market_growth_cagr: number
          market_rank: number
          popularity_score: number
          is_trending?: boolean
          demand_score: number
          roi_score: number
          regional_popularity?: Json
          age_demographics?: Json
          insurance_coverage_pct: number
          primary_concern: string
          clinical_category_id: number
          aesthetic_category_id: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          procedure_name?: string
          industry?: string
          category?: string
          normalized_category?: string
          description?: string
          technology_type?: string
          yearly_growth_percentage?: number
          market_size_2025_usd_millions?: number
          complexity?: string
          duration_minutes?: number
          pain_level?: string
          patient_satisfaction?: number
          risks?: string
          downtime?: string
          contraindications?: string
          fda_status?: string
          average_cost_usd?: number
          company_name?: string
          trending_score?: number
          is_featured?: boolean
          market_growth_cagr?: number
          market_rank?: number
          popularity_score?: number
          is_trending?: boolean
          demand_score?: number
          roi_score?: number
          regional_popularity?: Json
          age_demographics?: Json
          insurance_coverage_pct?: number
          primary_concern?: string
          clinical_category_id?: number
          aesthetic_category_id?: number
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
    }
    Views: {
      // Add views if any
    }
    Functions: {
      // Add functions if needed
    }
    Enums: {
      // Add enums if any
    }
  }
}
