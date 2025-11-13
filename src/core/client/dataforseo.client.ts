import { defaultGlobalToolConfig } from '../config/global.tool.js';

export class DataForSEOClient {
  private config: DataForSEOConfig;
  private authHeader: string;

  constructor(config: DataForSEOConfig) {
    this.config = config;
    
    if (!config.username || !config.password) {
      console.error('ERROR: DataForSEOClient created with missing credentials', {
        hasUsername: !!config.username,
        hasPassword: !!config.password
      });
      throw new Error('DataForSEO username and password are required');
    }

    if(defaultGlobalToolConfig.debug) {
      console.error('DataForSEOClient initialized with config:', {
        username: config.username.substring(0, 3) + '***',
        hasPassword: !!config.password,
        baseUrl: config.baseUrl || 'default'
      });
    }
    
    const token = Buffer.from(`${config.username}:${config.password}`).toString('base64');
    this.authHeader = `Basic ${token}`;
    console.error('Auth header created for DataForSEO API');
  }

  async makeRequest<T>(endpoint: string, method: string = 'POST', body?: any, forceFull: boolean = false): Promise<T> {
    let url = `${this.config.baseUrl || "https://api.dataforseo.com"}${endpoint}`;    
    if(!defaultGlobalToolConfig.fullResponse && !forceFull){
      url += '.ai';
    }
    // Import version dynamically to avoid circular dependencies
    const { version } = await import('../utils/version.js');
    
    const headers = {
      'Authorization': this.authHeader,
      'Content-Type': 'application/json',
      'User-Agent': `DataForSEO-MCP-TypeScript-SDK/${version}`
    };

    console.error(`Making request to ${url} with method ${method} and body`, body);
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
} 

export interface DataForSEOConfig {
  username: string;
  password: string;
  baseUrl?: string;
}