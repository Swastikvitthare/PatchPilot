<<<<<<< HEAD
<p align="center">
  <img src="https://img.shields.io/badge/PATCHPILOT-Cybersecurity-06b6d4?style=for-the-badge&logo=shield&logoColor=white" alt="PATCHPILOT" />
</p>

<h1 align="center">PATCHPILOT</h1>

<p align="center">
  <strong>Find the flaw. Fix the code. Prove the patch.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Track-Open--Weight_AI-10b981?style=flat-square" alt="Open-Weight AI" />
  <img src="https://img.shields.io/badge/AI-Google_Gemma_4-4285F4?style=flat-square" alt="Gemma 4" />
  <img src="https://img.shields.io/badge/Deploy-DigitalOcean-0080FF?style=flat-square" alt="DigitalOcean" />
  <img src="https://img.shields.io/github/license/YOUR_USERNAME/patchpilot?style=flat-square" alt="License" />
</p>

---

## What is PATCHPILOT?

PATCHPILOT is an AI-powered cybersecurity tool that scans Python code for security vulnerabilities, explains them using Google Gemma 4, generates verified patches, and produces professional security reports.

### Key Features

| Feature | Description |
|---------|-------------|
| 🔍 **Code Scanner** | Monaco-based code editor with file upload support |
| 💉 **SQL Injection Detection** | Identifies string concatenation, f-strings, and format() in SQL queries |
| 🔑 **Credential Detection** | Finds hardcoded passwords, API keys, AWS tokens, and secrets |
| ⚠️ **Unsafe Eval Detection** | Flags eval(), exec(), os.system(), shell=True, pickle.loads() |
| 🐍 **Python Static Analysis** | Detects dangerous imports, debug mode, insecure random usage |
| 🤖 **AI Explanations** | Gemma 4 explains each vulnerability in plain language |
| 🩹 **Auto-Patching** | AI-generated security patches with confidence scores |
| ↔️ **Diff Comparison** | Side-by-side original vs. patched code view |
| ✅ **Re-scanning** | Verify patches by re-scanning the corrected code |
| 📄 **PDF Reports** | Downloadable security reports with full analysis |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- pnpm (`npm install -g pnpm`)

### 1. Clone and Configure

```bash
git clone https://github.com/YOUR_USERNAME/patchpilot.git
cd patchpilot
cp .env.example .env
# Edit .env with your Gemma 4 API credentials (optional — app works without AI)
```

### 2. Start Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Start Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### 4. Open

- **App:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs

---

## Architecture

```
patchpilot/
├── backend/               # Python FastAPI backend
│   ├── app/
│   │   ├── main.py        # FastAPI application
│   │   ├── config.py      # Environment configuration
│   │   ├── models.py      # Pydantic data models
│   │   ├── routers/       # API route handlers
│   │   ├── scanners/      # Security scanning engines
│   │   ├── services/      # AI & report services
│   │   └── utils/         # Sanitization utilities
│   ├── tests/             # Backend test suite
│   └── demo/              # Vulnerable code examples
├── frontend/              # Next.js TypeScript frontend
│   └── src/
│       ├── app/           # Pages (App Router)
│       ├── components/    # React components
│       ├── lib/           # API client & types
│       └── hooks/         # Custom React hooks
├── docs/                  # Architecture & deployment docs
├── .github/workflows/     # CI pipeline
└── docker-compose.yml     # Docker orchestration
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design.

---

## AI Configuration

PATCHPILOT uses **Google Gemma 4** via DigitalOcean Gradient for:
- Vulnerability explanations
- Security patch generation
- Code improvement suggestions

### Setting Up Gemma 4

1. Deploy Gemma 4 on [DigitalOcean Gradient](https://www.digitalocean.com/products/gpu-droplets)
2. Set environment variables:

```env
GEMMA_API_KEY=your_api_key
GEMMA_API_URL=https://your-gradient-endpoint/v1
GEMMA_MODEL=google/gemma-4-27b-it
```

### Degraded Mode

Without AI credentials, PATCHPILOT still provides:
- ✅ All security scanning features
- ✅ Rule-based patch suggestions
- ✅ PDF report generation
- ❌ AI-powered explanations
- ❌ AI-generated patches

---

## Security Scanning Rules

### SQL Injection (CWE-89)
Detects string interpolation in SQL queries via concatenation, f-strings, `.format()`, and `%` formatting.

### Hardcoded Credentials (CWE-798)
Identifies passwords, API keys, tokens, and secrets assigned as string literals, including AWS key patterns.

### Unsafe Code Execution (CWE-95, CWE-78)
Flags `eval()`, `exec()`, `os.system()`, `subprocess.call(shell=True)`, `pickle.loads()`.

### Python Security (Various CWEs)
Detects dangerous imports, debug mode, insecure random, missing CSRF protection, and more.

---

## Deployment

### Docker

```bash
docker compose up --build
```

### DigitalOcean App Platform

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full deployment instructions.

---

## Development

### Running Tests

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
pnpm build  # Type-checks during build
```

### Demo Files

The `backend/demo/` directory contains intentionally vulnerable Python files for testing:
- `vulnerable_example.py` — Multiple vulnerability types
- `sql_example.py` — SQL injection patterns

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Monaco Editor |
| Backend | Python 3.11, FastAPI, Pydantic v2 |
| AI | Google Gemma 4 (27B, instruction-tuned) |
| Scanning | AST analysis, regex patterns, custom rules |
| Reports | ReportLab PDF generation |
| CI/CD | GitHub Actions |
| Deployment | DigitalOcean App Platform + Gradient |

---

## License

[MIT](LICENSE)

---

<p align="center">
  Built for the DigitalOcean App Platform Hackathon · Open-Weight AI Track<br/>
  Powered by <strong>Google Gemma 4</strong> on <strong>DigitalOcean Gradient</strong>
</p>
=======
# PatchPilot
PATCHPILOT is an  AI-powered cybersecurity engineer that detects software vulnerabilities, explains security risks, generates intelligent code patches, and validates fixes through automated security scanning. Powered by Google Gemma 4 and DigitalOcean infrastructur PATCHPILOT helps developers identify, understand, and resolve security issues
>>>>>>> c4c7d26844f70f9e21875f750361e49167a0665f
