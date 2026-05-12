# LECP File Operations

**Summary**: How to extract JSON from an LECP file and how to create an LECP file from JSON.

**Sources**: extracted-lecp/, raw-lecp/, CLAUDE.md

**Last updated**: 2026-05-11

---

## What is an LECP file

An LECP file is a ZIP archive containing exactly one file: `project.json`.

```
my-project.lecp
└── project.json
```

Magic bytes: `50 4B 03 04` (standard ZIP header). Rename to `.zip` and any archive tool opens it.

See [[lecp-project-schema]] for the full `project.json` structure.

---

## Extract LECP → JSON

### Command line

```bash
# Extract project.json from an LECP file
unzip "Get the Gold.lecp" -d output/

# Single-line: extract and rename
unzip -p "Get the Gold.lecp" project.json > "get-the-gold.json"
```

### Python

```python
import zipfile
import json
from pathlib import Path

def extract_lecp(lecp_path: str | Path, out_path: str | Path) -> dict:
    """Extract project.json from an LECP file and save as JSON."""
    with zipfile.ZipFile(lecp_path) as z:
        data = json.loads(z.read("project.json"))
    Path(out_path).write_text(json.dumps(data, indent=2, ensure_ascii=False))
    return data

# Example
data = extract_lecp("raw/lecp/Get the Gold.lecp", "raw/extracted/get-the-gold.json")
```

### Batch extract all LECP files

```python
import zipfile
import json
from pathlib import Path

src = Path("raw/lecp")
dst = Path("raw/extracted")
dst.mkdir(parents=True, exist_ok=True)

for lecp in src.glob("*.lecp"):
    with zipfile.ZipFile(lecp) as z:
        data = json.loads(z.read("project.json"))
    slug = lecp.stem.lower().replace(" ", "-")
    pin = data.get("lessonPin", "0000")
    out = dst / f"{pin}-{slug}.json"
    out.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"Extracted: {out.name}")
```

---

## Create LECP from JSON

### Command line

```bash
# Create LECP from an existing project.json
zip "proj-my-project.lecp" project.json

# From a differently-named file
cp my-project.json project.json && zip "proj-my-project.lecp" project.json && rm project.json
```

### Python

```python
import zipfile
import json
from pathlib import Path

def create_lecp(project_data: dict, out_path: str | Path) -> None:
    """Pack a project dict into an LECP file."""
    out = Path(out_path)
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("project.json", json.dumps(project_data, ensure_ascii=False))
    print(f"Created: {out}")

# Example — load from JSON file and repack as LECP
data = json.loads(Path("extracted-lecp/1202-get-the-gold.json").read_text())
create_lecp(data, "project/proj-my-lesson.lecp")
```

---

## Folder conventions (this repo)

| Folder | Contents | Mutable |
|--------|----------|---------|
| `raw/lecp/` | Original LECP zip files downloaded/received | No |
| `raw/extracted/` | Content JSON from `code.legoeducation.com` (full response) | No |
| `extracted-lecp/` | `project.json` extracted from each content JSON | No |
| `project/` | New LECP files created by Claude — named `proj-*.lecp` | Yes |

The `raw/extracted/` JSON files differ from extracted LECP `project.json` — they wrap the project JSON inside a `project` string field along with `id`, `headline`, `image`, etc. To get the inner project data from a `raw/extracted/` file:

```python
import json
from pathlib import Path

content = json.loads(Path("raw/extracted/1202-get-the-gold.json").read_text())
project = json.loads(content["project"])   # parse the nested JSON string
```

---

## Minimal valid project.json

The smallest valid project structure (no hardware, no blocks):

```json
{
  "manifest": {
    "id": "unique-id-here",
    "name": "My Project",
    "type": "word",
    "created": "2026-05-11T00:00:00.000Z",
    "hardware": [],
    "toolbox": {}
  },
  "canvas": {
    "blocks": {
      "languageVersion": 1,
      "blocks": []
    },
    "palette": "lesson",
    "sounds": []
  },
  "lessonPin": "0000"
}
```

---

## Related pages
- [[lecp-project-schema]]
- [[lessons-index]]
- [[coding-and-programming]]
