import { LaunchContext, GuardResult } from './types';
import { logger } from './logger';

/**
 * launchGuard: Validates whether a launch operation is permitted.
 * 
 * Checks:
 * - Presence of a valid authorization token.
 * - User and project identifiers are non-empty.
 * - Token matches expected pattern (example: bearer token format).
 * 
 * In production, this would call an external auth service or validate JWT.
 */

export async function launchGuard(context: LaunchContext): Promise<GuardResult> {
  const { userId, projectId, token } = context;

  // Validate required fields
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    logger.warn('launchGuard: missing or invalid userId');
    return { allowed: false, reason: 'Invalid user identifier.' };
  }

  if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
    logger.warn('launchGuard: missing or invalid projectId');
    return { allowed: false, reason: 'Invalid project identifier.' };
  }

  // Check token
  if (!token || typeof token !== 'string') {
    logger.warn('launchGuard: missing token');
    return { allowed: false, reason: 'Authorization token is required.' };
  }

  // Simple token validation: must start with "Bearer " and have a non-empty payload
  const tokenRegex = /^Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
  if (!tokenRegex.test(token)) {
    logger.warn('launchGuard: invalid token format');
    return { allowed: false, reason: 'Invalid token format. Expected JWT Bearer token.' };
  }

  // Additional checks (e.g., verify signature, expiration) would go here.
  // For demonstration, we assume token is valid if format matches.

  logger.info('launchGuard: launch allowed', { userId, projectId });
  return { allowed: true };
}
