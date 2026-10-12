import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { getRepository } from 'typeorm';
import { Agent } from '../entity/Agent';
import { SignInToken } from '../entity/SignInToken';
import emailService from './emailService';

/**
 * Generates a sign‑in token for the given agent and sends the sign‑in link via e‑mail.
 * Previously the function aborted when the agent did not have both the Oath and Lantern
 * sealed (the “sealed” flags were mistakenly used as a prerequisite for token creation).
 * This prevented agents like `agent-22d709` – whose Oath/Lantern are sealed – from ever
 * receiving a sign‑in link.
 *
 * The new implementation removes that unnecessary guard and always creates a token
 * (subject to rate‑limiting). It also logs a warning when the e‑mail could not be sent,
 * but does not silently fail.
 *
 * @param agentId The public identifier of the agent (e.g. "agent-22d709").
 * @returns The generated token string.
 */
export async function sendSignInLink(agentId: string): Promise<string> {
  const agentRepo = getRepository(Agent);
  const tokenRepo = getRepository(SignInToken);

  const agent = await agentRepo.findOne({ where: { publicId: agentId } });
  if (!agent) {
    throw new Error(`Agent with id ${agentId} not found`);
  }

  // Rate‑limit: allow at most one sign‑in link per 5 minutes.
  const recentToken = await tokenRepo.findOne({
    where: { agent: agent, createdAt: () => `createdAt > NOW() - INTERVAL '5 minutes'` },
    order: { createdAt: 'DESC' },
  });
  if (recentToken) {
    throw new Error('A sign‑in link was already sent recently. Please wait before requesting another.');
  }

  // Create a new token – no longer dependent on Oath/Lantern status.
  const token = uuidv4();
  const expiresAt = addHours(new Date(), 2); // token valid for 2 hours

  const signInToken = tokenRepo.create({
    token,
    agent,
    expiresAt,
  });
  await tokenRepo.save(signInToken);

  // Build the sign‑in URL (frontend URL is read from env)
  const frontendBase = process.env.FRONTEND_BASE_URL || 'https://frantic-board.app';
  const signInUrl = `${frontendBase}/signin?token=${token}`;

  // Send the e‑mail
  try {
    await emailService.sendSignInLink({
      to: agent.email,
      name: agent.name,
      link: signInUrl,
    });
  } catch (err) {
    console.warn(`Failed to send sign‑in e‑mail to ${agent.email}:`, err);
    // The token is still stored; the caller can retry later.
    throw new Error('Unable to deliver sign‑in e‑mail. Please try again later.');
  }

  return token;
}
