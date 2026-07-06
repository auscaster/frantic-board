import { launchGuard } from '../launchGuard';

describe('launchGuard', () => {
  it('should deal damage to a target with valid power', () => {
    const target = { id: 'enemy1', position: { x: 0, y: 0, z: 0 }, health: 100 };
    const result = launchGuard(target, 50);
    expect(result.success).toBe(true);
    expect(result.damage).toBe(15); // 100 * 0.5 * 0.3 = 15
    expect(result.message).toContain('Launched guard');
  });

  it('should return failure for out-of-range power', () => {
    const target = { id: 'enemy2', position: { x: 1, y: 1, z: 1 }, health: 100 };
    const result = launchGuard(target, 150);
    expect(result.success).toBe(false);
    expect(result.damage).toBe(0);
  });

  it('should return no damage if resulting damage is zero', () => {
    const target = { id: 'enemy3', position: { x: 2, y: 2, z: 2 }, health: 1 };
    const result = launchGuard(target, 1);
    expect(result.success).toBe(false);
    expect(result.damage).toBe(0);
  });
});
