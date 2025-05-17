import { supabase } from './supabaseClient';
import { useState, useEffect } from 'react';

// Types
export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  content?: string;
  image_url?: string;
  published_date: string;
  source: string;
  author?: string;
  url?: string;
  industry: 'dental' | 'aesthetic';
  featured?: boolean;
}

export interface NewsCategory {
  id: number;
  name: string;
  industry: 'dental' | 'aesthetic';
}

export interface ProcedureCategory {
  id: number;
  category_name: string;
  applicable_to: 'dental' | 'aesthetic' | 'both';
  market_size_usd_millions: number;
  avg_growth_rate: number;
}

export interface NewsByProcedureCategory {
  procedure_category: ProcedureCategory;
  articles: NewsArticle[];
}

// Hook to fetch news articles by industry
export const useNewsByIndustry = (industry: 'dental' | 'aesthetic', limit: number = 10) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('news_articles')
          .select('*')
          .eq('industry', industry)
          .order('published_date', { ascending: false })
          .limit(limit);
        
        if (fetchError) throw fetchError;
        
        setArticles(data || []);
      } catch (err: any) {
        console.error(`Error fetching ${industry} news:`, err);
        setError(err.message || 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [industry, limit]);

  return { articles, loading, error };
};

// Hook to fetch news by procedure category
export const useNewsByProcedureCategory = (
  procedureCategoryId: number | string,
  limit: number = 5
) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsByProcedureCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, get the procedure category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('standardized_procedure_categories')
          .select('*')
          .eq('id', procedureCategoryId)
          .single();
        
        if (categoryError) throw categoryError;
        
        // Then, get the news categories mapped to this procedure category
        const { data: mappingData, error: mappingError } = await supabase
          .from('news_to_procedure_category_mapping')
          .select('news_category_id')
          .eq('procedure_category_id', procedureCategoryId);
        
        if (mappingError) throw mappingError;
        
        if (!mappingData || mappingData.length === 0) {
          setArticles([]);
          return;
        }
        
        // Get the news category IDs
        const newsCategoryIds = mappingData.map(m => m.news_category_id);
        
        // Get articles directly from news_articles table based on category
        // Since news_article_categories is empty, we'll use the category field in news_articles
        const { data: newsData, error: newsError } = await supabase
          .from('news_articles')
          .select('*')
          .eq('industry', categoryData.applicable_to)
          .order('published_date', { ascending: false })
          .limit(limit);
        
        if (newsError) throw newsError;
        
        setArticles(newsData || []);
      } catch (err: any) {
        console.error(`Error fetching news for procedure category ${procedureCategoryId}:`, err);
        setError(err.message || 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsByProcedureCategory();
  }, [procedureCategoryId, limit]);

  return { articles, loading, error };
};

// Hook to fetch top procedure categories with news
export const useTopProcedureCategoriesWithNews = (
  industry: 'dental' | 'aesthetic',
  limit: number = 3
) => {
  const [categories, setCategories] = useState<ProcedureCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get top procedure categories by market size
        const { data: categoryData, error: categoryError } = await supabase
          .from('standardized_procedure_categories')
          .select('*')
          .eq('applicable_to', industry)
          .order('market_size_usd_millions', { ascending: false })
          .limit(limit);
        
        if (categoryError) throw categoryError;
        
        setCategories(categoryData || []);
      } catch (err: any) {
        console.error(`Error fetching top ${industry} categories:`, err);
        setError(err.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchTopCategories();
  }, [industry, limit]);

  return { categories, loading, error };
};

// Function to fetch featured news
export const fetchFeaturedNews = async (limit: number = 5): Promise<NewsArticle[]> => {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('featured', true)
      .order('published_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (err) {
    console.error('Error fetching featured news:', err);
    return [];
  }
};
