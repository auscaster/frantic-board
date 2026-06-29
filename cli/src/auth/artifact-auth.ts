# Fix for Issue #105: Frantic bounty #48: Dogfood Icey CLI production startup and artifact auth

/**
 * Artifact Authentication Module
 * Handles secure authentication for artifact registry access
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface AuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string[];
}

export interface ArtifactAuthConfig {
  credentialsPath?: string;
  authEndpoint: string;
  clientId?: string;
}

export class ArtifactAuth {
  private credentials: AuthCredentials | null = null;
  private config: ArtifactAuthConfig;
  private credentialsFile: string;

  constructor(config: ArtifactAuthConfig) {
    this.config = config;
    this.credentialsFile = config.credentialsPath || 
      path.join(os.homedir(), '.icey', 'credentials.json');
  }

  async initialize(): Promise<void> {
    await this.ensureCredentialsDir();
    await this.loadStoredCredentials();
    
    if (this.credentials && this.isTokenExpired()) {
      await this.refreshToken();
    }
  }

  async authenticate(apiKey?: string): Promise<AuthCredentials> {
    const key = apiKey || process.env.ICEY_API_KEY;
    
    if (!key) {
      throw new Error(
        'No API key provided. Set ICEY_API_KEY environment variable or pass --api-key flag'
      );
    }

    try {
      const response = await this.exchangeApiKey(key);
      this.credentials = response;
      await this.storeCredentials();
      return response;
    } catch (error) {
      throw new Error(`Authentication failed: ${(error as Error).message}`);
    }
  }

  async getAccessToken(): Promise<string> {
    if (!this.credentials) {
      throw new Error('Not authenticated. Run `icey auth login` first.');
    }

    if (this.isTokenExpired()) {
      await this.refreshToken();
    }

    return this.credentials.accessToken;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'X-Icey-Client': 'cli',
      'X-Icey-Version': process.env.npm_package_version || '0.0.0',
    };
  }

  isAuthenticated(): boolean {
    return this.credentials !== null && !this.isTokenExpired();
  }

  async logout(): Promise<void> {
    this.credentials = null;
    try {
      await fs.promises.unlink(this.credentialsFile);
    } catch {
      // Ignore if file doesn't exist
    }
  }

  private isTokenExpired(): boolean {
    if (!this.credentials) return true;
    // Add 5 minute buffer before actual expiry
    return Date.now() >= this.credentials.expiresAt - 300000;
  }

  private async exchangeApiKey(apiKey: string): Promise<AuthCredentials> {
    const response = await fetch(`${this.config.authEndpoint}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'api_key',
        api_key: apiKey,
        client_id: this.config.clientId || 'icey-cli',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      scope: data.scope?.split(' ') || ['artifacts:read'],
    };
  }

  private async refreshToken(): Promise<void> {
    if (!this.credentials?.refreshToken) {
      throw new Error('No refresh token available. Please re-authenticate.');
    }

    const response = await fetch(`${this.config.authEndpoint}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.credentials.refreshToken,
        client_id: this.config.clientId || 'icey-cli',
      }),
    });

    if (!response.ok) {
      this.credentials = null;
      throw new Error('Token refresh failed. Please re-authenticate.');
    }

    const data = await response.json();
    this.credentials = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || this.credentials.refreshToken,
      expiresAt: Date.now() + (data.expires_in * 1000),
      scope: data.scope?.split(' ') || this.credentials.scope,
    };

    await this.storeCredentials();
  }

  private async ensureCredentialsDir(): Promise<void> {
    const dir = path.dirname(this.credentialsFile);
    await fs.promises.mkdir(dir, { recursive: true, mode: 0o700 });
  }

  private async loadStoredCredentials(): Promise<void> {
    try {
      const data = await fs.promises.readFile(this.credentialsFile, 'utf-8');
      const decrypted = this.decrypt(data);
      this.credentials = JSON.parse(decrypted);
    } catch {
      this.credentials = null;
    }
  }

  private async storeCredentials(): Promise<void> {
    if (!this.credentials) return;
    
    const encrypted = this.encrypt(JSON.stringify(this.credentials));
    await fs.promises.writeFile(this.credentialsFile, encrypted, {
      encoding: 'utf-8',
      mode: 0o600,
    });
  }

  private encrypt(data: string): string {
    const key = this.getDerivedKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      data: encrypted,
      tag: authTag.toString('hex'),
    });
  }

  private decrypt(encryptedData: string): string {
    const { iv, data, tag } = JSON.parse(encryptedData);
    const key = this.getDerivedKey();
    
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private getDerivedKey(): Buffer {
    // Derive key from machine-specific identifier
    const machineId = this.getMachineId();
    return crypto.pbkdf2Sync(machineId, 'icey-cli-salt', 100000, 32, 'sha256');
  }

  private getMachineId(): string {
    // Use combination of hostname and username for machine-specific encryption
    return `${os.hostname()}-${os.userInfo().username}-icey`;
  }
}

export default ArtifactAuth;