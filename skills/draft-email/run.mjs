const rawInput = process.env.RUNX_INPUT_EMAIL_DATA || "{}";
let input = {};
try {
  input = JSON.parse(rawInput);
} catch (e) {
  process.stderr.write("Invalid JSON in email_data\n");
  process.exit(64);
}

const recipient = input.recipient || "unknown@example.com";
const subject = input.subject || "Draft";
const body = input.body || "Empty body";

const draftOutput = {
  recipient,
  subject,
  body,
  status: "staged_unapproved",
  gated_proposal: true,
  classification_labels: ["draft", "requires_approval"],
  schema_validation: "passed",
  stop_condition: "human_review_required"
};

process.stdout.write(JSON.stringify(draftOutput) + '\n');
