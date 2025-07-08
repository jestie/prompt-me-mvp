# promptme Requirements Document

## Overview
promptme is a SaaS platform for saving, searching, and managing Gen AI LLM prompts with secure authentication and tiered subscriptions.

## Core Features
- User authentication (Login, Google, LinkedIn)
- Subscription tiers (Free, Pro, Enterprise)
- Save, search, sort, and favorite prompts
- User profile (MFA/2FA, theme switch)
- Responsive, modern UI (dark/light mode)
- Admin/sales contact for Enterprise

## Tech Stack
- Frontend: HTML5, CSS3 (Bootstrap/Material), JavaScript
- Backend: Python (Flask or FastAPI)
- Database: SQLite (dev), PostgreSQL (prod)
- Auth: OAuth2 (Google, LinkedIn), JWT
- Deployment: Docker, HTTPS (Let's Encrypt)

## File Structure
- requirements.md (this file)
- howto.md (setup and usage guide)
- /frontend
    - index.html
    - styles.css
    - app.js
- /backend
    - app.py
    - models.py
    - auth.py
- /db
    - schema.sql
- README.md
