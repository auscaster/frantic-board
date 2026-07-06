import { launchGuard } from '../src/launchGuard';
import { LaunchContext } from '../src/types';

describe('launchGuard', () => {
  const validContext: LaunchContext = {
    userId: 'user123',
    projectId: 'proj456',
    token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  };

  it('should allow valid launch', async () => {
    const result = await launchGuard(validContext);
    expect(result.allowed).toBe(true);
  });

  it('should reject missing userId', async () => {
    const ctx = { ...validContext, userId: '' };
    const result = await launchGuard(ctx);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('userId');
  });

  it('should reject missing token', async () => {
    const ctx = { ...validContext, token: undefined };
    const result = await launchGuard(ctx);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('token');
  });

  it('should reject malformed token', async () => {
    const ctx = { ...validContext, token: 'invalid-token' };
    const result = await launchGuard(ctx);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('format');
  });

  it('should reject missing projectId', async () => {
    const ctx = { ...validContext, projectId: '' };
    const result = await launchGuard(ctx);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('projectId');
  });
});
