/**
 * Nitrosend MCP onboarding & email sender
 *
 * This script performs the following steps:
 * 1. Registers (onboards) the agent with the Nitrosend MCP server.
 * 2. Retrieves an authentication token from the onboarding response.
 * 3. Sends a single email using the obtained token.
 *
 * Configuration is supplied via environment variables:
 *   NITROSEND_MCP_URL   – Base URL of the MCP server (e.g., https://mcp.nitrosend.com/api)
 *   AGENT_ID            – Unique identifier for this agent
 *   AGENT_SECRET        – Secret/password for the agent (used during onboarding)
 *   EMAIL_FROM          – Sender email address
 *   EMAIL_TO            – Recipient email address
 *   EMAIL_SUBJECT       – Subject line of the email
 *   EMAIL_BODY          – Plain‑text body of the email
 *
 * To run:
 *   npm install node-fetch@2
 *   npx ts-node nitrosend-agent.ts
 */

import fetch, { Response } from 'node-fetch';

// ---------- Types ----------
interface OnboardRequest {
  agentId: string;
  secret: string;
  capabilities?: string[];
}

interface OnboardResponse {
  success: boolean;
  token?: string;
  error?: string;
}

interface SendEmailRequest {
  from: string;
  to: string;
  subject: string;
  body: string;
}

interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ---------- Helpers ----------
function getEnv(name: string, required = true): string {
  const val = process.env[name];
  if (required && (!val || val.trim() === '')) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return val ?? '';
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  if (!res.ok) {
    const errBody = contentType.includes('application/json')
      ? await res.json()
      : await res.text();
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(errBody)}`);
  }
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  throw new Error('Unexpected response format');
}

// ---------- Core Logic ----------
async function onboard(
  baseUrl: string,
  agentId: string,
  secret: string
): Promise<string> {
  const payload: OnboardRequest = {
    agentId,
    secret,
    capabilities: ['email.send'],
  };

  const res = await fetch(`${baseUrl}/onboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<OnboardResponse>(res);
  if (!data.success || !data.token) {
    throw new Error(`Onboarding failed: ${data.error ?? 'unknown error'}`);
  }
  console.log('✅ Onboarded successfully. Token received.');
  return data.token;
}

async function sendEmail(
  baseUrl: string,
  token: string,
  email: SendEmailRequest
): Promise<void> {
  const res = await fetch(`${baseUrl}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(email),
  });

  const data = await handleResponse<SendEmailResponse>(res);
  if (!data.success) {
    throw new Error(`Email send failed: ${data.error ?? 'unknown error'}`);
  }
  console.log(`📧 Email sent successfully. Message ID: ${data.messageId}`);
}

// ---------- Entry Point ----------
(async () => {
  try {
    // Load configuration
    const MCP_URL = getEnv('NITROSEND_MCP_URL');
    const AGENT_ID = getEnv('AGENT_ID');
    const AGENT_SECRET = getEnv('AGENT_SECRET');
    const EMAIL_FROM = getEnv('EMAIL_FROM');
    const EMAIL_TO = getEnv('EMAIL_TO');
    const EMAIL_SUBJECT = getEnv('EMAIL_SUBJECT', false) || 'Test Email from Nitrosend Agent';
    const EMAIL_BODY = getEnv('EMAIL_BODY', false) || 'Hello! This is a test email sent by the Nitrosend MCP agent.';

    // Step 1: Onboard and obtain token
    const token = await onboard(MCP_URL, AGENT_ID, AGENT_SECRET);

    // Step 2: Send a single email
    const emailPayload: SendEmailRequest = {
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: EMAIL_SUBJECT,
      body: EMAIL_BODY,
    };
    await sendEmail(MCP_URL, token, emailPayload);
  } catch (err) {
    console.error('❌ Error:', (err as Error).message);
    process.exit(1);
  }
})();