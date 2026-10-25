/**
 * Nitrosend MCP Self‑Onboard & Send Email
 *
 * This script demonstrates how an autonomous agent can:
 *   1. Register (onboard) itself with the Nitrosend MCP server.
 *   2. Obtain an authentication token.
 *   3. Send a single email using that token.
 *
 * Configuration is supplied via environment variables:
 *
 *   NITROSEND_BASE_URL   – Base URL of the MCP server (e.g. https://mcp.nitrosend.com)
 *   AGENT_NAME           – Desired name for the agent (any string)
 *   AGENT_PUBLIC_KEY    – PEM‑encoded public key (optional, can be empty)
 *   EMAIL_FROM           – Sender address (must be allowed by the server)
 *   EMAIL_TO             – Recipient address
 *   EMAIL_SUBJECT        – Subject line for the test email
 *   EMAIL_BODY           – Plain‑text body of the test email
 *
 * The script uses the native fetch API (node ≥18) – no external dependencies.
 */

import { readFileSync } from 'fs';
import { Buffer } from 'buffer';
import process from 'process';
import crypto from 'crypto';
import { URL } from 'url';

// ---------- Helper Types ----------
interface OnboardResponse {
  agentId: string;
  secret: string; // one‑time secret used to obtain a JWT
}

interface TokenResponse {
  token: string; // JWT
  expiresIn: number; // seconds
}

// ---------- Configuration ----------
const CONFIG = {
  baseUrl: process.env.NITROSEND_BASE_URL?.replace(/\/+$/, '') ?? 'https://mcp.nitrosend.com',
  agentName: process.env.AGENT_NAME ?? `agent-${Date.now()}`,
  agentPublicKey: process.env.AGENT_PUBLIC_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'no-reply@nitrosend.com',
  emailTo: process.env.EMAIL_TO ?? '',
  emailSubject: process.env.EMAIL_SUBJECT ?? 'Nitrosend MCP Test Email',
  emailBody: process.env.EMAIL_BODY ?? 'Hello from the autonomous Nitrosend agent!',
};

// Simple validation
if (!CONFIG.emailTo) {
  console.error('❌ EMAIL_TO environment variable is required.');
  process.exit(1);
}

// ---------- Core Logic ----------
async function onboardAgent(): Promise<OnboardResponse> {
  const url = new URL('/api/agents/onboard', CONFIG.baseUrl).toString();

  const payload = {
    name: CONFIG.agentName,
    publicKey: CONFIG.agentPublicKey, // optional – server may ignore if empty
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Onboard failed (${resp.status}): ${txt}`);
  }

  const data = (await resp.json()) as OnboardResponse;
  console.log(`✅ Onboarded as agentId=${data.agentId}`);
  return data;
}

async function obtainJwt(agentId: string, secret: string): Promise<string> {
  const url = new URL('/api/auth/token', CONFIG.baseUrl).toString();

  const payload = {
    agentId,
    secret,
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Token request failed (${resp.status}): ${txt}`);
  }

  const data = (await resp.json()) as TokenResponse;
  console.log(`🔑 Obtained JWT (expires in ${data.expiresIn}s)`);
  return data.token;
}

async function sendEmail(jwt: string): Promise<void> {
  const url = new URL('/api/email/send', CONFIG.baseUrl).toString();

  const payload = {
    from: CONFIG.emailFrom,
    to: CONFIG.emailTo,
    subject: CONFIG.emailSubject,
    body: CONFIG.emailBody,
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Send email failed (${resp.status}): ${txt}`);
  }

  const result = await resp.json();
  console.log('📧 Email sent successfully:', result);
}

// ---------- Execution ----------
(async () => {
  try {
    // 1️⃣ Onboard the agent (creates a new agent record)
    const { agentId, secret } = await onboardAgent();

    // 2️⃣ Exchange the one‑time secret for a JWT
    const jwt = await obtainJwt(agentId, secret);

    // 3️⃣ Use the JWT to send a single email
    await sendEmail(jwt);
  } catch (err) {
    console.error('❌ Fatal error:', (err as Error).message);
    process.exit(1);
  }
})();