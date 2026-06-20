const receiptRaw = process.env.RUNX_INPUT_RECEIPT || "{}";

let receipt = {};
try {
  receipt = JSON.parse(receiptRaw);
} catch (e) {
  process.stderr.write("Invalid JSON in receipt\n");
  process.exit(64);
}

const isValid = receipt && receipt.schema === "runx.receipt.v1" && receipt.state === "sealed";
const report = isValid ? "Receipt is valid and sealed." : "Receipt verification failed: missing schema or not sealed.";

process.stdout.write(JSON.stringify({ is_valid: isValid, report, receipt_id: receipt.id || "unknown" }) + '\n');
