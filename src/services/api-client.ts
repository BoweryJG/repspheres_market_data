import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Define API Gateway configuration interface
interface ApiGatewayConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
}

// Simple API Gateway implementation
class ApiGateway {
  private client: AxiosInstance;
  
  constructor(config: ApiGatewayConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: config.headers || {},
      timeout: config.timeout || 30000,
      withCredentials: config.withCredentials || false
    });
  }
  
  // Update client configuration
  updateConfig(config: Partial<ApiGatewayConfig>): void {
    if (config.baseURL) {
      this.client.defaults.baseURL = config.baseURL;
    }
    
    if (config.headers) {
      this.client.defaults.headers.common = {
        ...this.client.defaults.headers.common,
        ...config.headers
      };
    }
    
    if (config.timeout) {
      this.client.defaults.timeout = config.timeout;
    }
    
    if (config.withCredentials !== undefined) {
      this.client.defaults.withCredentials = config.withCredentials;
    }
  }
  
  // Set authentication token
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Clear authentication token
  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
  
  // GET request
  async get(url: string, options?: AxiosRequestConfig): Promise<any> {
    try {
      const response = await this.client.get(url, options);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message,
          status: error.response?.status
        }
      };
    }
  }
  
  // POST request
  async post(url: string, data?: any, options?: AxiosRequestConfig): Promise<any> {
    try {
      const response = await this.client.post(url, data, options);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message,
          status: error.response?.status
        }
      };
    }
  }
  
  // PUT request
  async put(url: string, data?: any, options?: AxiosRequestConfig): Promise<any> {
    try {
      const response = await this.client.put(url, data, options);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message,
          status: error.response?.status
        }
      };
    }
  }
  
  // DELETE request
  async delete(url: string, options?: AxiosRequestConfig): Promise<any> {
    try {
      const response = await this.client.delete(url, options);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message,
          status: error.response?.status
        }
      };
    }
  }
}

/**
 * Market Insights API Client
 * 
 * This client provides a specialized interface for interacting with the Market Insights API
 * using the shared API Gateway infrastructure.
 */
export class MarketInsightsApiClient {
  private apiGateway: ApiGateway;
  private static instance: MarketInsightsApiClient;

  /**
   * Create a new Market Insights API Client
   * @param config API Gateway configuration
   */
  constructor(config: ApiGatewayConfig) {
    this.apiGateway = new ApiGateway(config);
  }

  /**
   * Get a singleton instance of the Market Insights API Client
   * @param config API Gateway configuration (only used if instance doesn't exist)
   * @returns MarketInsightsApiClient instance
   */
  public static getInstance(config?: ApiGatewayConfig): MarketInsightsApiClient {
    if (!MarketInsightsApiClient.instance) {
      if (!config) {
        throw new Error('Configuration is required when creating the first instance');
      }
      MarketInsightsApiClient.instance = new MarketInsightsApiClient(config);
    }
    return MarketInsightsApiClient.instance;
  }

  /**
   * Update the API client configuration
   * @param config New configuration
   */
  public updateConfig(config: Partial<ApiGatewayConfig>): void {
    this.apiGateway.updateConfig(config);
  }

  /**
   * Set the authentication token
   * @param token JWT token
   */
  public setAuthToken(token: string): void {
    this.apiGateway.updateConfig({
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Clear the authentication token
   */
  public clearAuthToken(): void {
    // Create a new headers object without the Authorization header
    const headers: Record<string, string> = {};
    this.apiGateway.updateConfig({ headers });
  }

  /**
   * Check the health of the API
   * @returns Health check response
   */
  public async checkHealth(): Promise<any> {
    const response = await this.apiGateway.get('/api/health');
    return response.data;
  }

  /**
   * Get all categories
   * @returns List of categories
   */
  public async getCategories(): Promise<any[]> {
    const response = await this.apiGateway.get('/api/categories');
    
    if (!response.success) {
      throw new Error(`Failed to get categories: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get a category by ID
   * @param id Category ID
   * @returns Category data
   */
  public async getCategoryById(id: string): Promise<any> {
    const response = await this.apiGateway.get(`/api/categories/${id}`);
    
    if (!response.success) {
      throw new Error(`Failed to get category ${id}: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get all procedures
   * @param limit Maximum number of procedures to return
   * @param offset Pagination offset
   * @returns List of procedures
   */
  public async getProcedures(limit: number = 20, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get('/api/procedures', {
      params: { limit, offset },
    });
    
    if (!response.success) {
      throw new Error(`Failed to get procedures: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get a procedure by ID
   * @param id Procedure ID
   * @returns Procedure data
   */
  public async getProcedureById(id: string): Promise<any> {
    const response = await this.apiGateway.get(`/api/procedures/${id}`);
    
    if (!response.success) {
      throw new Error(`Failed to get procedure ${id}: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Search for procedures
   * @param query Search query
   * @param filters Search filters
   * @returns Search results
   */
  public async searchProcedures(query: string, filters?: Record<string, any>): Promise<any[]> {
    const response = await this.apiGateway.get('/api/procedures/search', {
      params: {
        q: query,
        ...filters,
      },
    });
    
    if (!response.success) {
      throw new Error(`Search failed: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get market growth data
   * @param procedureId Procedure ID
   * @param filters Filters for market growth data
   * @returns Market growth data
   */
  public async getMarketGrowth(procedureId: string, filters?: Record<string, any>): Promise<any> {
    const response = await this.apiGateway.get(`/api/market-growth/${procedureId}`, {
      params: filters,
    });
    
    if (!response.success) {
      throw new Error(`Failed to get market growth data: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get news articles
   * @param limit Maximum number of articles to return
   * @param offset Pagination offset
   * @returns List of news articles
   */
  public async getNews(limit: number = 10, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get('/api/news', {
      params: { limit, offset },
    });
    
    if (!response.success) {
      throw new Error(`Failed to get news: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get news articles by category
   * @param categoryId Category ID
   * @param limit Maximum number of articles to return
   * @param offset Pagination offset
   * @returns List of news articles
   */
  public async getNewsByCategory(categoryId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get(`/api/news/category/${categoryId}`, {
      params: { limit, offset },
    });
    
    if (!response.success) {
      throw new Error(`Failed to get news for category ${categoryId}: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get news articles by procedure category
   * @param procedureCategoryId Procedure category ID
   * @param limit Maximum number of articles to return
   * @param offset Pagination offset
   * @returns List of news articles
   */
  public async getNewsByProcedureCategory(procedureCategoryId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get(`/api/news/procedure-category/${procedureCategoryId}`, {
      params: { limit, offset },
    });
    
    if (!response.success) {
      throw new Error(`Failed to get news for procedure category ${procedureCategoryId}: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get top news articles for all procedure categories
   * @param limit Maximum number of articles to return per category
   * @returns List of news articles grouped by procedure category
   */
  public async getTopNewsByProcedureCategories(limit: number = 3): Promise<any[]> {
    const response = await this.apiGateway.get('/api/news/top-by-procedure-categories', {
      params: { limit },
    });
    
    if (!response.success) {
      throw new Error(`Failed to get top news by procedure categories: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Execute a custom SQL query
   * @param query SQL query to execute
   * @returns Query results
   */
  public async executeQuery(query: string): Promise<any> {
    const response = await this.apiGateway.post('/api/query', {
      query
    });
    
    if (!response.success) {
      throw new Error(`Failed to execute query: ${response.error?.message}`);
    }
    
    return response;
  }

  /**
   * Get companies
   * @param limit Maximum number of companies to return
   * @param offset Pagination offset
   * @returns List of companies
   */
  public async getCompanies(limit: number = 20, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get('/api/companies', {
      params: { limit, offset },
    });
    
    if (!response.success) {
      throw new Error(`Failed to get companies: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get a company by ID
   * @param id Company ID
   * @returns Company data
   */
  public async getCompanyById(id: string): Promise<any> {
    const response = await this.apiGateway.get(`/api/companies/${id}`);
    
    if (!response.success) {
      throw new Error(`Failed to get company ${id}: ${response.error?.message}`);
    }
    
    return response.data;
  }

  /**
   * Get companies by category
   * @param categoryId Category ID
   * @param limit Maximum number of companies to return
   * @param offset Pagination offset
   * @returns List of companies
   */
  public async getCompaniesByCategory(categoryId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    const response = await this.apiGateway.get(`/api/companies/category/${categoryId}`, {
      params: { limit, offset },
    });
    
    if (!response.success) {
      throw new Error(`Failed to get companies for category ${categoryId}: ${response.error?.message}`);
    }
    
    return response.data;
  }
}

/**
 * Create and configure the Market Insights API Client
 * @param baseURL API base URL
 * @param token Authentication token (optional)
 * @returns Configured API client
 */
export function createMarketInsightsApiClient(baseURL: string, token?: string): MarketInsightsApiClient {
  // Create a new instance with the provided configuration
  const config: ApiGatewayConfig = {
    baseURL,
    timeout: 10000,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    withCredentials: false
  };

  return MarketInsightsApiClient.getInstance(config);
}

// Export a default instance for convenience
export default createMarketInsightsApiClient('https://osbackend-zl1h.onrender.com');
