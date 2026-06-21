import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const mode = process.env.RUNX_INPUT_MODE ?? "";
if (mode !== "full") {
  process.stderr.write("mode must be full\n");
  process.exit(64);
}

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const testScript = fileURLToPath(new URL("../../scripts/test-delivery-artifact-linter.mjs", import.meta.url));
const result = spawnSync(process.execPath, [testScript], {
  cwd: repositoryRoot,
  encoding: "utf8",
  timeout: 30_000,
});

if (result.error) {
  process.stderr.write(`${result.error.message}\n`);
  process.exit(1);
}
if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout || `fixture command exited ${result.status}\n`);
  process.exit(result.status ?? 1);
}

const output = JSON.parse(result.stdout);
if (output.ok !== true || output.valid_case?.exit_code !== 0 || output.invalid_case?.exit_code !== 1) {
  process.stderr.write("fixture output did not prove both pass and fail behavior\n");
  process.exit(1);
}
process.stdout.write(`${JSON.stringify(output)}\n`);
