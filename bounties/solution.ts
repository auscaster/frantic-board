/**
 * Nitrosend MCP Self‑Onboard & Send Email
 *
 * This script demonstrates a minimal, self‑contained agent that:
 *   1. Registers (onboards) itself with the Nitrosend MCP server.
 *   2. Uses the returned access token to send a single email.
 *
 * The implementation is deliberately generic – it only requires the
 * MCP base URL and a set of credentials (clientId / clientSecret) to be
 * supplied via environment variables.
 *
 * Prerequisites
 * --------------
 *   • Node.js ≥ 18 (native fetch support) or install `node-fetch`.
 *   • Environment variables:
 *        NITROSEND_MCP_URL      – Base URL of the MCP server (e.g. https://mcp.nitrosend.com)
 *        NITROSEND_CLIENT_ID    – Your client identifier
 *        NITROSEND_CLIENT_SECRET– Your client secret
 *        EMAIL_FROM             – Sender address (e.g. "agent@example.com")
 *        EMAIL_TO               – Recipient address
 *        EMAIL_SUBJECT          – Subject line
 *        EMAIL_BODY             – Plain‑text body
 *
 * Usage
 * -----
 *   $ npm i
 *   $ npx ts-node nitrosend-agent.ts
 *
 * The script exits with status 0 on success or a non‑zero code on failure.
 */

import { URL } from 'url';
import { readFileSync } from 'fs';

// ---------------------------------------------------------------------------
// Helper: simple logger
// ---------------------------------------------------------------------------
const log = console.log;
const err = console.error;

// ---------------------------------------------------------------------------
// Configuration (environment variables)
// ---------------------------------------------------------------------------
const {
  NITROSEND_MCP_URL,
  NITROSEND_CLIENT_ID,
  NITROSEND_CLIENT_SECRET,
  EMAIL_FROM,
  EMAIL_TO,
  EMAIL_SUBJECT = 'Test Email from Nitrosend MCP Agent',
  EMAIL_BODY = 'Hello! This is a test email sent by the self‑onboarding agent.',
} = process.env;

if (!NITROSEND_MCP_URL || !NITROSEND_CLIENT_ID || !NITROSEND_CLIENT_SECRET) {
  err('Missing required environment variables: NITROSEND_MCP_URL, NITROSEND_CLIENT_ID, NITROSEND_CLIENT_SECRET');
  process.exit(1);
}
if (!EMAIL_FROM || !EMAIL_TO) {
  err('Missing required email variables: EMAIL_FROM, EMAIL_TO');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface OnboardResponse {
  accessToken: string;
  expiresIn: number; // seconds
  tokenType: string; // e.g. "Bearer"
}

interface SendEmailRequest {
  from: string;
  to: string;
  subject: string;
  body: string;
}

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Registers the agent with the MCP server.
 * Returns an access token to be used for subsequent calls.
 */
async function onboard(): Promise<string> {
  const endpoint = new URL('/api/v1/onboard', NITROSEND_MCP_URL).toString();

  const payload = {
    clientId: NITROSEND_CLIENT_ID,
    clientSecret: NITROSEND_CLIENT_SECRET,
    // Optional metadata about the agent – can be extended as needed.
    agentInfo: {
      name: 'Nitrosend Self‑Onboard Agent',
      version: '1.0.0',
      platform: process.platform,
    },
  };

  log(`🛰  Onboarding to ${endpoint}`);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Onboard request failed (${response.status}): ${txt}`);
  }

  const data: OnboardResponse = await response.json();
  if (!data.accessToken) {
    throw new Error('Onboard response missing accessToken');
  }

  log('✅  Onboard successful – token acquired');
  return data.accessToken;
}

/**
 * Sends a single email using the MCP email endpoint.
 */
async function sendEmail(token: string, email: SendEmailRequest): Promise<void> {
  const endpoint = new URL('/api/v1/email/send', NITROSEND_MCP_URL).toString();

  log(`📧  Sending email via ${endpoint}`);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(email),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Send email failed (${response.status}): ${txt}`);
  }

  const result = await response.json();
  if (result.success !== true) {
    throw new Error(`Email send reported failure: ${JSON.stringify(result)}`);
  }

  log('✅  Email sent successfully');
}

/**
 * Main execution flow.
 */
async function main() {
  try {
    const token = await onboard();

    const emailPayload: SendEmailRequest = {
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: EMAIL_SUBJECT,
      body: EMAIL_BODY,
    };

    await sendEmail(token, emailPayload);
    process.exit(0);
  } catch (e) {
    err('❌  Error:', (e as Error).message);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------
main();