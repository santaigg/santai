/**
 * API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Environment types
 */
export enum AccountEnvironment {
  DEV = 'dev',
  PROD = 'prod',
  ALL = 'all'
}

/**
 * Host type for connections
 */
export type HostType = "game" | "social"; 