import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthConfig, AuthenticationError } from './types';

/**
 * Authentication manager for the PulseFinder API
 * For internal use within the monorepo
 */
export class Auth {
  private apiKey: string;
  private baseUrl: string;
  private client: AxiosInstance;

  /**
   * Create a new Auth instance
   * @param config Authentication configuration
   */
  constructor(config: AuthConfig) {
    this.apiKey = config.apiKey || process.env.PULSEFINDER_API_KEY || '';
    this.baseUrl = config.baseUrl || process.env.PULSEFINDER_API_URL || 'http://localhost:3000';
    
    if (!this.apiKey && process.env.NODE_ENV === 'production') {
      throw new AuthenticationError('API key is required in production. Provide it in the config or set PULSEFINDER_API_KEY environment variable.');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}),
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          
          if (status === 401) {
            throw new AuthenticationError(data?.message || 'Authentication failed');
          }
          
          // Handle other error types as needed
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the configured Axios client with authentication
   */
  getClient(): AxiosInstance {
    return this.client;
  }

  /**
   * Make an authenticated request to the API
   * @param config Axios request configuration
   * @returns Promise with the response data
   */
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      // Error handling is done in the interceptor
      throw error;
    }
  }

  /**
   * Check if the current authentication is valid
   * @returns Promise that resolves to true if authentication is valid
   */
  async validateAuth(): Promise<boolean> {
    try {
      await this.client.get('/');
      return true;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return false;
      }
      // If it's another type of error (like network error), we can't determine auth status
      throw error;
    }
  }
} 