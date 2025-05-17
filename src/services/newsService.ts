import { supabase } from './supabaseClient';
import { useState, useEffect } from 'react';
import axios from 'axios';

// News proxy service URL - change this to your Render URL when deployed
const NEWS_PROXY_URL = process.env.NODE_ENV === 'production' 
  ? 'https://repspheres-news-proxy.onrender.com' 
  : 'http://localhost:3001';

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

// Helper function to generate image for an article
export const generateImageForArticle = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(`${NEWS_PROXY_URL}/api/news/generate-image`, { prompt });
    return response.data.imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    // Return a default image if generation fails
    return 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1000&auto=format&fit=crop';
  }
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
        
        // Try fetching from the proxy service first
        try {
          const response = await axios.get(
            `${NEWS_PROXY_URL}/api/news/procedure-category/${procedureCategoryId}?limit=${limit}`
          );
          
          // Process the articles to ensure they have images
          const articlesWithImages = await Promise.all(
            response.data.map(async (article: NewsArticle) => {
              if (!article.image_url) {
                const imagePrompt = `${article.title} - ${article.industry} industry news`;
                article.image_url = await generateImageForArticle(imagePrompt);
              }
              return article;
            })
          );
          
          setArticles(articlesWithImages || []);
        } catch (proxyError) {
          console.error('Proxy service error, falling back to Supabase:', proxyError);
          
          // Fall back to direct Supabase query
          // First, get the procedure category details
          const { data: categoryData, error: categoryError } = await supabase
            .from('standardized_procedure_categories')
            .select('*')
            .eq('id', procedureCategoryId)
            .single();
          
          if (categoryError) throw categoryError;
          
          // Query the view directly
          const { data: newsData, error: newsError } = await supabase
            .from('v_news_by_procedure_category')
            .select('*')
            .eq('procedure_category_id', procedureCategoryId)
            .order('published_date', { ascending: false })
            .limit(limit);
          
          if (newsError) throw newsError;
          
          // Process the articles to ensure they have images
          const articlesWithImages = await Promise.all(
            (newsData || []).map(async (article: NewsArticle) => {
              if (!article.image_url) {
                const imagePrompt = `${article.title} - ${article.industry} industry news`;
                article.image_url = await generateImageForArticle(imagePrompt);
              }
              return article;
            })
          );
          
          setArticles(articlesWithImages || []);
        }
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
        
        const NEWS_PROXY_URL = process.env.NODE_ENV === 'production' 
          ? 'https://repspheres-news-proxy.onrender.com' 
          : 'http://localhost:3001';

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
