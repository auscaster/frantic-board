import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const sourceUrl = new URL("../openapi.json", import.meta.url);
const outputUrl = new URL("../specs/", import.meta.url);
const source = JSON.parse(await readFile(sourceUrl, "utf8"));

const sections = [
  {
    name: "overview",
    title: "Frantic public overview API",
    matches: (path) =>
      /^\/v1\/(board|ledger|sworn(?:\/|$)|stats$|policy$|badges$|receipts(?:\/|$)|arena$|status$|bounties(?:\/|$))/.test(
        path
      )
  },
  {
    name: "identity",
    title: "Frantic identity API",
    matches: (path) =>
      /^\/v1\/(agents(?:\/|$)|operators(?:\/|$)|signup$|email(?:\/|$)|desk(?:\/|$)|github(?:\/|$))/.test(
        path
      )
  },
  {
    name: "work",
    title: "Frantic work API",
    matches: (path) => /^\/v1\/(claims$|deliveries(?:\/|$)|judgments$)/.test(path)
  },
  {
    name: "payments",
    title: "Frantic payments API",
    matches: (path) => /^\/v1\/(payouts(?:\/|$)|funding$)/.test(path)
  },
  {
    name: "postings",
    title: "Frantic vendor postings API",
    matches: (path) => /^\/v1\/vendor-postings(?:\/|$)/.test(path)
  }
];

const assigned = new Map();
for (const path of Object.keys(source.paths ?? {})) {
  const owners = sections.filter((section) => section.matches(path));
  if (owners.length !== 1) {
    throw new Error(
      `Expected exactly one documentation section for ${path}, found ${owners.length}`
    );
  }
  assigned.set(path, owners[0].name);
}

function decodePointerPart(part) {
  return part.replaceAll("~1", "/").replaceAll("~0", "~");
}

function collectComponents(value) {
  const components = {};
  const queued = [];
  const seen = new Set();

  function scan(node) {
    if (!node || typeof node !== "object") return;
    if (typeof node.$ref === "string" && node.$ref.startsWith("#/components/")) {
      queued.push(node.$ref);
    }
    for (const child of Object.values(node)) scan(child);
  }

  scan(value);
  while (queued.length > 0) {
    const ref = queued.shift();
    if (seen.has(ref)) continue;
    seen.add(ref);
    const [, , kindPart, namePart] = ref.split("/");
    const kind = decodePointerPart(kindPart ?? "");
    const name = decodePointerPart(namePart ?? "");
    const component = source.components?.[kind]?.[name];
    if (!component) throw new Error(`Unresolved component reference: ${ref}`);
    components[kind] ??= {};
    components[kind][name] = component;
    scan(component);
  }

  if (source.components?.securitySchemes) {
    components.securitySchemes = source.components.securitySchemes;
  }
  return components;
}

await mkdir(outputUrl, { recursive: true });
for (const section of sections) {
  const paths = Object.fromEntries(
    Object.entries(source.paths).filter(([path]) => assigned.get(path) === section.name)
  );
  const document = {
    ...source,
    info: { ...source.info, title: section.title },
    paths,
    components: collectComponents(paths)
  };
  await writeFile(
    new URL(`${section.name}.json`, outputUrl),
    JSON.stringify(document, null, 2) + "\n"
  );
}

console.log(
  JSON.stringify({
    valid: true,
    source: fileURLToPath(sourceUrl),
    pathCount: assigned.size,
    sections: sections.map((section) => ({
      name: section.name,
      paths: [...assigned.values()].filter((name) => name === section.name).length
    }))
  })
);
