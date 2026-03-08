# NeuroHire

Behavior-Based Hiring Analytics Platform.

NeuroHire helps recruiting teams evaluate real engineering ability by combining resume parsing, coding interviews, behavior telemetry, and AI-assisted analysis.

## Overview

NeuroHire provides an end-to-end hiring workflow:

- Recruiter/Admin creates or manages candidate assessments.
- Candidate logs in and completes coding tasks.
- The platform tracks coding behavior signals during the session.
- AI-assisted analysis compares observed performance against resume claims.

## Core Capabilities

- Resume upload and parsing (PDF/DOCX)
- AI-driven skill extraction
- Multi-question coding interview experience
- Runtime behavior metrics collection
- Candidate analysis and report generation
- Recruiter and admin dashboard workflows

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- Backend: Express, TypeScript (tsx runtime)
- Data: MongoDB
- AI: Groq SDK
- Testing: Vitest, Testing Library

## Architecture

The project runs as two apps in development:

- Frontend app via Vite on port 8080
- Backend API via Express on port 5000

Frontend API calls are proxied to the backend during development.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB running locally or accessible remotely

### Installation

```bash
npm install
```

### Environment Setup

1. Create a file named .env in the project root.
2. Copy values from .env.example and adjust for your environment.

Example variables:

```dotenv
# Server Configuration
VITE_API_URL=http://localhost:5000
API_PORT=5000

# Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
CORS_ORIGIN=http://localhost:8080

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=neurohire

# Groq AI
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

### Run in Development

```bash
# Frontend + backend together
npm run dev:all

# Frontend only
npm run dev

# Backend only
npm run dev:server
```

## Available Scripts

- npm run dev: Start Vite frontend
- npm run dev:server: Start Express backend
- npm run dev:all: Start frontend and backend concurrently
- npm run build: Production build
- npm run build:dev: Development-mode build
- npm run preview: Preview production build
- npm run lint: Run ESLint
- npm run test: Run test suite once
- npm run test:watch: Run tests in watch mode

## API Surface

Key backend endpoints:

- POST /api/resume/upload
- POST /api/parse-resume
- POST /api/extract-skills
- POST /api/run-code
- POST /api/behavior/logs
- POST /api/behavior/multi-question-logs
- GET /api/analysis
- GET /api/evaluations
- GET /api/health

## Main Application Routes

- / : Landing page
- /dashboard : Recruiter workflow dashboard
- /upload : Resume upload page
- /interview : Coding interview
- /analysis : Analysis/report view
- /recruiter-login : Recruiter login
- /recruiter-dashboard : Recruiter dashboard
- /create-test : Recruiter test creation
- /candidate-login : Candidate login (query param flow)
- /candidate/login : Candidate login (credential flow)
- /candidate/test/:testId : Candidate test route
- /admin/login : Admin login
- /admin/dashboard : Admin dashboard

## Project Structure

```text
.
├── app/                      # Admin and candidate route pages
├── src/
│   ├── components/           # Shared UI and feature components
│   ├── pages/                # Main React Router pages
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilities
│   └── types/                # Shared TypeScript types
├── server/                   # Express backend and services
├── uploads/                  # Uploaded files (runtime)
└── README.md
```

## Security Notes

- Never commit real API keys or credentials to the repository.
- Use placeholder values in example files.
- Rotate any key immediately if exposed.

## Troubleshooting

- If npm run dev:all fails:
	- Ensure ports 8080 and 5000 are free.
	- Confirm MongoDB is reachable.
	- Verify .env values are present and valid.
- If API calls fail from frontend:
	- Check Vite proxy settings in vite.config.ts.
	- Confirm backend is running.

## License

This project is intended for internal development and evaluation use unless otherwise specified by the repository owner.
