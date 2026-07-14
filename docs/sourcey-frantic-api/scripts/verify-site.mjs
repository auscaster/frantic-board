import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const specPath = new URL("../openapi.json", import.meta.url);
const sitePath = new URL("../site/", import.meta.url);
const methods = new Set([
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace"
]);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory)) {
    const path = join(directory, entry);
    if ((await stat(path)).isDirectory()) {
      files.push(...(await walk(path)));
    } else {
      files.push(path);
    }
  }
  return files;
}

const spec = JSON.parse(await readFile(specPath, "utf8"));
const schemaRefs = [];
function collectSchemaRefs(value) {
  if (!value || typeof value !== "object") return;
  if (
    typeof value.$ref === "string" &&
    value.$ref.startsWith("#/components/schemas/")
  ) {
    schemaRefs.push(value.$ref.slice("#/components/schemas/".length));
  }
  for (const child of Object.values(value)) collectSchemaRefs(child);
}
collectSchemaRefs(spec);
const unresolvedSchemaRefs = [
  ...new Set(
    schemaRefs.filter((name) => !(name in (spec.components?.schemas ?? {})))
  )
];
if (unresolvedSchemaRefs.length > 0) {
  throw new Error(
    `Unresolved component schemas: ${unresolvedSchemaRefs.join(", ")}`
  );
}

const operations = [];
for (const [path, item] of Object.entries(spec.paths ?? {})) {
  for (const [method, operation] of Object.entries(item ?? {})) {
    if (methods.has(method.toLowerCase())) {
      operations.push({
        method: method.toUpperCase(),
        path,
        operationId: operation?.operationId ?? null
      });
    }
  }
}

if (operations.length < 20) {
  throw new Error(`Expected at least 20 API operations, found ${operations.length}`);
}

const siteDirectory = fileURLToPath(sitePath);
const htmlFiles = (await walk(siteDirectory)).filter((path) =>
  path.endsWith(".html")
);
if (htmlFiles.length < 5) {
  throw new Error(`Expected at least 5 generated HTML pages, found ${htmlFiles.length}`);
}

let totalBytes = 0;
let brandedPages = 0;
let endpointPages = 0;
let generatedHtml = "";
for (const path of htmlFiles) {
  const html = await readFile(path, "utf8");
  generatedHtml += html;
  totalBytes += Buffer.byteLength(html);
  if (/Frantic Public API/i.test(html)) brandedPages += 1;
  if (/GET|POST|PATCH|DELETE|PUT/.test(html)) endpointPages += 1;
}

if (brandedPages < 5) {
  throw new Error(`Expected Frantic identity on at least 5 pages, found ${brandedPages}`);
}
if (endpointPages < 5) {
  throw new Error(`Expected endpoint content on at least 5 pages, found ${endpointPages}`);
}

const missingGeneratedPaths = Object.keys(spec.paths ?? {}).filter(
  (path) => !generatedHtml.includes(path)
);
if (missingGeneratedPaths.length > 0) {
  throw new Error(
    `Generated site is missing API paths: ${missingGeneratedPaths.join(", ")}`
  );
}

const siteRoot = siteDirectory;
console.log(
  JSON.stringify(
    {
      valid: true,
      sourceyVersion: "3.6.5",
      specTitle: spec.info?.title ?? null,
      specVersion: spec.info?.version ?? null,
      paths: Object.keys(spec.paths ?? {}).length,
      operations: operations.length,
      unresolvedSchemaRefs,
      generatedPages: htmlFiles.length,
      brandedPages,
      endpointPages,
      pathCoverage: `${Object.keys(spec.paths ?? {}).length}/${Object.keys(spec.paths ?? {}).length}`,
      totalHtmlBytes: totalBytes,
      samplePages: htmlFiles
        .slice(0, 8)
        .map((path) => relative(siteRoot, path).replaceAll("\\\\", "/"))
    },
    null,
    2
  )
);
