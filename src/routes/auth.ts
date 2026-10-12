import { Router, Request, Response } from 'express';
import { sendSignInLink } from '../services/authService';
import { initiatePrivateRecovery } from '../services/recoveryService';

const router = Router();

/**
 * POST /auth/request-signin
 * Body: { agentId: string }
 *
 * Requests a sign‑in link to be sent to the agent's registered e‑mail address.
 */
router.post('/request-signin', async (req: Request, res: Response) => {
  const { agentId } = req.body;
  if (!agentId) {
    return res.status(400).json({ error: 'agentId is required' });
  }

  try {
    await sendSignInLink(agentId);
    return res.json({ message: 'Sign‑in link sent successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /auth/recover-private
 * Body: { agentId: string }
 *
 * Initiates the private account‑recovery verification flow for agents that cannot
 * receive the normal sign‑in link (e.g., sealed Oath/Lantern). This endpoint is
 * intended for support use only.
 */
router.post('/recover-private', async (req: Request, res: Response) => {
  const { agentId } = req.body;
  if (!agentId) {
    return res.status(400).json({ error: 'agentId is required' });
  }

  try {
    await initiatePrivateRecovery(agentId);
    return res.json({ message: 'Private recovery process started' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
