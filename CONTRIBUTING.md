# Contributing to PATCHPILOT

Thank you for considering a contribution. Keep changes focused, explain the security or usability problem being addressed, and include tests for changed behavior.

## Before opening a pull request

1. Check existing issues and pull requests to avoid duplicating work.
2. Open an issue for substantial changes so the approach can be discussed first.
3. Keep pull requests focused and describe any security implications.
4. Never commit credentials, private keys, production data, or local environment files.

## Backend setup and tests

Requirements: Python 3.11 or newer.

From the repository root:

```bash
python -m venv .venv
```

Activate the environment:

- Windows Command Prompt: `.venv\Scripts\activate.bat`
- Windows PowerShell: `.venv\Scripts\Activate.ps1`
- macOS/Linux: `source .venv/bin/activate`

Install backend dependencies and run the complete backend suite:

```bash
python -m pip install -r backend/requirements.txt
cd backend
python -m pytest tests -v --tb=short
```

## Frontend checks

Requirements: Node.js 20 or newer.

```bash
cd frontend
npm install
npm run build
```

## Pull request expectations

- Explain the problem and the chosen solution.
- Add or update tests for behavior changes.
- Update documentation when commands, configuration, or user-visible behavior changes.
- Report test commands and their actual results. Do not claim checks passed unless they ran successfully.
- Do not weaken a security check merely to make a test pass.
- Do not include unrelated formatting or redesign work.

All contributions are subject to review. Opening a pull request does not guarantee acceptance.
