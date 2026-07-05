#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SUPPORTED_FORMATS = ['cyclonedx', 'spdx'];

function usage() {
  console.error('Usage: sbom-maker.js [--format cyclonedx|spdx] [--output FILE] [PROJECT_DIR]');
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let projectDir = '.';
  let format = 'cyclonedx';
  let outputFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format') {
      if (i + 1 < args.length && SUPPORTED_FORMATS.includes(args[i + 1])) {
        format = args[++i];
      } else {
        usage();
      }
    } else if (args[i] === '--output') {
      if (i + 1 < args.length) {
        outputFile = args[++i];
      } else {
        usage();
      }
    } else {
      projectDir = args[i];
    }
  }
  return { projectDir, format, outputFile };
}

function getPackageJSON(dir) {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`No package.json found in ${dir}`);
  }
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

function generateCycloneDX(pkg) {
  const bom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.4',
    serialNumber: `urn:uuid:${generateUUID()}`,
    version: 1,
    metadata: {
      tools: [
        {
          vendor: 'runx',
          name: 'sbom-maker',
          version: '1.0.0'
        }
      ],
      component: {
        type: 'application',
        name: pkg.name || 'unknown',
        version: pkg.version || '0.0.0',
        description: pkg.description || '',
        licenses: mapLicenses(pkg.license)
      }
    },
    components: []
  };

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name, version] of Object.entries(deps)) {
    const cleanVersion = version.replace(/^[~^]/, '');
    bom.components.push({
      type: 'library',
      name: name,
      version: cleanVersion,
      licenses: [],
      purl: `pkg:npm/${name}@${cleanVersion}`
    });
  }

  return JSON.stringify(bom, null, 2);
}

function generateSPDX(pkg) {
  const spdx = {
    spdxVersion: 'SPDX-2.3',
    dataLicense: 'CC0-1.0',
    SPDXID: 'SPDXRef-DOCUMENT',
    name: `${pkg.name || 'unknown'}-${pkg.version || '0.0.0'}`,
    documentNamespace: `https://spdx.org/spdxdocs/${pkg.name || 'unknown'}-${pkg.version || '0.0.0'}-${generateUUID()}`,
    creationInfo: {
      creators: ['Tool: runx-sbom-maker-1.0.0'],
      created: new Date().toISOString()
    },
    packages: []
  };

  spdx.packages.push({
    SPDXID: 'SPDXRef-ROOT',
    name: pkg.name || 'unknown',
    versionInfo: pkg.version || '0.0.0',
    licenseConcluded: pkg.license || 'NOASSERTION',
    licenseDeclared: pkg.license || 'NOASSERTION',
    description: pkg.description || '',
    copyrightText: 'NOASSERTION'
  });

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name, version] of Object.entries(deps)) {
    const cleanVersion = version.replace(/^[~^]/, '');
    spdx.packages.push({
      SPDXID: `SPDXRef-${name}`,
      name: name,
      versionInfo: cleanVersion,
      licenseConcluded: 'NOASSERTION',
      licenseDeclared: 'NOASSERTION',
      copyrightText: 'NOASSERTION',
      externalRefs: [
        {
          referenceCategory: 'PACKAGE-MANAGER',
          referenceType: 'purl',
          referenceLocator: `pkg:npm/${name}@${cleanVersion}`
        }
      ]
    });
  }

  return JSON.stringify(spdx, null, 2);
}

function mapLicenses(license) {
  if (!license) return [];
  if (typeof license === 'string') {
    return [{ license: { id: license } }];
  }
  if (license.type) {
    return [{ license: { id: license.type } }];
  }
  return [];
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function main() {
  try {
    const { projectDir, format, outputFile } = parseArgs();
    const pkg = getPackageJSON(projectDir);
    let output;
    if (format === 'cyclonedx') {
      output = generateCycloneDX(pkg);
    } else if (format === 'spdx') {
      output = generateSPDX(pkg);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }

    if (outputFile) {
      fs.writeFileSync(outputFile, output, 'utf8');
      console.log(`SBOM written to ${outputFile}`);
    } else {
      console.log(output);
    }
  } catch (err) {
    console.error('Error generating SBOM:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateCycloneDX, generateSPDX, getPackageJSON };
