#!/usr/bin/env node
// Sends one email through the Nitrosend SDK. Requires NITROSEND_API_KEY, NITROSEND_FROM, NITROSEND_TO.
import { Nitrosend } from "@nitrosend/sdk";

const { NITROSEND_API_KEY, NITROSEND_FROM, NITROSEND_TO } = process.env;

for (const [name, value] of Object.entries({ NITROSEND_API_KEY, NITROSEND_FROM, NITROSEND_TO })) {
  if (!value) {
    console.error(`missing ${name}`);
    process.exit(1);
  }
}

const nitrosend = new Nitrosend({ apiKey: NITROSEND_API_KEY });

try {
  const result = await nitrosend.emails.send({
    from: NITROSEND_FROM,
    to: NITROSEND_TO,
    subject: "Frantic bounty #140 test email",
    html: "<p>Sent by the 30-line Nitrosend SDK script for Frantic bounty #140.</p>",
  });
  console.log("sent", result?.id ?? result);
} catch (error) {
  console.error("send failed", error?.message ?? error);
  process.exit(1);
}

// Run: NITROSEND_API_KEY=... NITROSEND_FROM=... NITROSEND_TO=... node scripts/nitrosend-email.mjs

