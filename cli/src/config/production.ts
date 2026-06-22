# Fix for Issue #105: Frantic bounty #48: Dogfood Icey CLI production startup and artifact auth

/**
 * Production configuration for Icey CLI
 * Handles environment-specific settings and validation
 */

export interface ProductionConfig {
  artifactRegistry: string;
  authEndpoint: string;
  tokenRefreshInterval: number;
  maxRetries: number;
  timeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const defaults: ProductionConfig = {
  artifactRegistry: 'https://artifacts.icey.io',
  authEndpoint: 'https://auth.icey.io/v1',
  tokenRefreshInterval: 3600000, // 1 hour
  maxRetries: 3,
  timeout: 30000,
  logLevel: 'info',
};

export function loadProductionConfig(): ProductionConfig {
  const config: ProductionConfig = {
    artifactRegistry: process.env.ICEY_ARTIFACT_REGISTRY || defaults.artifactRegistry,
    authEndpoint: process.env.ICEY_AUTH_ENDPOINT || defaults.authEndpoint,
    tokenRefreshInterval: parseInt(process.env.ICEY_TOKEN_REFRESH_INTERVAL || '', 10) || defaults.tokenRefreshInterval,
    maxRetries: parseInt(process.env.ICEY_MAX_RETRIES || '', 10) || defaults.maxRetries,
    timeout: parseInt(process.env.ICEY_TIMEOUT || '', 10) || defaults.timeout,
    logLevel: (process.env.ICEY_LOG_LEVEL as ProductionConfig['logLevel']) || defaults.logLevel,
  };

  validateConfig(config);
  return config;
}

function validateConfig(config: ProductionConfig): void {
  if (!config.artifactRegistry.startsWith('https://')) {
    throw new Error('Artifact registry must use HTTPS in production');
  }
  if (!config.authEndpoint.startsWith('https://')) {
    throw new Error('Auth endpoint must use HTTPS in production');
  }
  if (config.tokenRefreshInterval < 60000) {
    throw new Error('Token refresh interval must be at least 60 seconds');
  }
}

export default loadProductionConfig;