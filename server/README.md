# Backend Server

Express.js API server for the coding interview and resume analysis platform.

## Running the Server

From the project root:

```bash
# Start the backend server only (runs on port 5000)
npm run dev:server

# Start both frontend (Vite) and backend
npm run dev:all
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload resume (PDF or DOCX) |
| POST | `/api/parse-resume` | Extract text from uploaded resume |
| POST | `/api/extract-skills` | Extract skills from resume text (Groq AI) |
| POST | `/api/run-code` | Execute Python or JavaScript code |
| POST | `/api/behavior/logs` | Submit coding session + AI behavior analysis |
| GET | `/api/analysis` | Get analysis by `interviewId` |
| GET | `/api/evaluations` | List all evaluations (recruiter dashboard) |
| GET | `/api/health` | Health check |
| GET | `/uploads/:filename` | Serve uploaded files |

## Environment Variables

Create a `.env` file in the project root:

- `PORT` – Server port (default: 5000)
- `MONGODB_URI` – MongoDB connection string (default: `mongodb://localhost:27017`)
- `MONGODB_DB` – Database name (default: `neurohire`)
- `GROQ_API_KEY` – Groq API key for AI-powered analysis
- `GROQ_MODEL` – Groq model (default: `llama-3.3-70b-versatile`)

## Project Structure

- `index.ts` – Main server entry point, routes, and business logic
