interface LaunchGuardTarget {
  id: string;
  position: { x: number; y: number; z: number };
  health: number;
}

interface LaunchGuardResult {
  success: boolean;
  message: string;
  damage: number;
}

/**
 * Launches a guard skill at a target.
 * Calculates damage based on target health and deals a percentage.
 * @param target - The target entity.
 * @param power - The power level of the skill (0-100).
 * @returns Result of the launch.
 */
export function launchGuard(target: LaunchGuardTarget, power: number = 50): LaunchGuardResult {
  if (power < 0 || power > 100) {
    return { success: false, message: 'Invalid power level. Must be between 0 and 100.', damage: 0 };
  }

  const damageMultiplier = power / 100;
  const damage = Math.floor(target.health * damageMultiplier * 0.3); // 30% base damage factor

  if (damage <= 0) {
    return { success: false, message: 'No damage dealt. Target too weak or power too low.', damage: 0 };
  }

  return {
    success: true,
    message: `Launched guard at target ${target.id}. Dealt ${damage} damage.`,
    damage,
  };
}
