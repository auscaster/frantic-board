export interface LaunchContext {
  userId: string;
  projectId: string;
  token?: string;
}

export interface GuardResult {
  allowed: boolean;
  reason?: string;
}

export type LaunchGuardFn = (context: LaunchContext) => Promise<GuardResult>;
