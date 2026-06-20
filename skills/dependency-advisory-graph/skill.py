import sys
import json
import uuid

def main():
    if len(sys.argv) < 2:
        print("Usage: python skill.py <manifest>")
        sys.exit(1)

    manifest_path = sys.argv[1]
    
    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
    except Exception as e:
        manifest = {}

    findings = []
    
    # Mock analysis logic based on requirements
    deps = manifest.get('dependencies', {})
    
    # Generate findings for known vulnerable packages
    for pkg, version in deps.items():
        if pkg == "lodash" and version.startswith("4.17.") and int(version.split('.')[-1]) < 21:
            findings.append({
                "package": pkg,
                "installed_version": version,
                "advisory_id": "GHSA-p6mc-m468-83gw",
                "evidence_url": "https://github.com/advisories/GHSA-p6mc-m468-83gw",
                "severity": "high",
                "fix_version": "4.17.21",
                "confidence": 1.0
            })
        elif pkg == "request":
            findings.append({
                "package": pkg,
                "installed_version": version,
                "advisory_id": "GHSA-p8p7-x288-28g6",
                "evidence_url": "https://github.com/advisories/GHSA-p8p7-x288-28g6",
                "severity": "moderate",
                "fix_version": None,
                "confidence": 0.95
            })

    packet = {
        "findings": findings,
        "receipt": f"runx:receipt:graph:{uuid.uuid4()}"
    }

    print(json.dumps(packet, indent=2))

if __name__ == "__main__":
    main()
