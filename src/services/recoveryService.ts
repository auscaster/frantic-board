import { getRepository } from 'typeorm';
import { Agent } from '../entity/Agent';
import emailService from './emailService';

/**
 * Starts a private account‑recovery verification for the given agent.
 * This is a fallback used when the normal sign‑in link cannot be delivered.
 *
 * The function generates a one‑time recovery code, stores it, and sends a
 * confidential e‑mail to the agent with instructions.
 *
 * @param agentId The public identifier of the agent.
 */
export async function initiatePrivateRecovery(agentId: string): Promise<void> {
  const agentRepo = getRepository(Agent);
  const agent = await agentRepo.findOne({ where: { publicId: agentId } });
  if (!agent) {
    throw new Error(`Agent with id ${agentId} not found`);
  }

  // Generate a simple 6‑digit numeric code.
  const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Store the code (in a new RecoveryCode entity – create if missing)
  const recoveryRepo = getRepository('RecoveryCode' as any);
  await recoveryRepo.save({
    agent,
    code: recoveryCode,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min validity
  });

  // Send the recovery e‑mail
  await emailService.sendRecoveryCode({
    to: agent.email,
    name: agent.name,
    code: recoveryCode,
  });
}
