# Resume Upload Feature Setup Guide

## Overview
This guide explains how to set up and use the resume upload feature in your Vite + React application.

## Files Created

### Frontend Components
- **`src/components/ResumeUploader.tsx`** - Main upload component with:
  - Drag-and-drop UI
  - File validation (PDF and DOCX only, max 5MB)
  - Upload progress tracking
  - Success/error messaging with toast notifications
  - Animated UI transitions

- **`src/pages/Upload.tsx`** - Upload page that uses the ResumeUploader component with styled layout

### Backend Server
- **`server.ts`** - Express.js API server that handles:
  - `POST /api/resume/upload` - File upload endpoint
  - `GET /uploads/:filename` - File retrieval
  - `GET /api/health` - Health check

## Installation

### 1. Install Dependencies
```bash
bun install
# or
npm install
# or
yarn install
```

This will install:
- Frontend: `axios` - HTTP client for file uploads
- Backend: `express`, `multer`, `cors`, `fs-extra` - Server and file handling
- Dev: `tsx`, `concurrently` - TypeScript execution and parallel task running

### 2. Update Vite Config
The `vite.config.ts` has been updated with proxy settings to forward API requests to the backend server during development:
```typescript
proxy: {
  "/api": {
    target: "http://localhost:5000",
    changeOrigin: true,
  },
  "/uploads": {
    target: "http://localhost:5000",
    changeOrigin: true,
  },
}
```

## Running the Application

### Development Mode (Both Frontend and Backend)
```bash
npm run dev:all
```

This runs both servers concurrently:
- Frontend: `http://localhost:8080` (Vite dev server)
- Backend: `http://localhost:5000` (Express API server)

### Frontend Only
```bash
npm run dev
```

### Backend Only
```bash
npm run dev:server
```

## Usage

### 1. Navigate to Upload Page
Go to `http://localhost:8080/upload` in your browser.

### 2. Upload a Resume
You can:
- **Drag and drop** a PDF or DOCX file onto the upload area
- **Click** the upload area to open a file browser

### 3. Upload Progress
- Real-time progress bar shows upload percentage
- File name and size display during selection
- Success message confirms upload

### 4. Response
On successful upload, you'll receive:
```json
{
  "success": true,
  "filePath": "/uploads/resume-1234567890.pdf",
  "fileName": "resume.pdf",
  "fileSize": 245632,
  "uploadedAt": "2026-03-07T10:30:45.123Z"
}
```

## File Structure

```
project-root/
├── server.ts                           # Express API server
├── src/
│   ├── components/
│   │   └── ResumeUploader.tsx         # Upload component
│   ├── pages/
│   │   └── Upload.tsx                 # Upload page
│   └── App.tsx                        # Updated with /upload route
├── uploads/                           # Created automatically for uploaded files
├── vite.config.ts                     # Updated with API proxies
└── package.json                       # Updated dependencies and scripts
```

## API Endpoints

### POST /api/resume/upload
Uploads a resume file.

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with `resume` file field

**Response:**
```json
{
  "success": true,
  "filePath": "/uploads/resume-timestamp.pdf",
  "fileName": "original-name.pdf",
  "fileSize": 245632,
  "uploadedAt": "2026-03-07T10:30:45.123Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-07T10:30:45.123Z"
}
```

### GET /uploads/:filename
Download a previously uploaded file.

## Features

### File Validation
- Accepts: PDF (`.pdf`), Word (`.docx`)
- Maximum size: 5MB
- Validation happens on both client and server

### UI Features
- Drag-and-drop interface with hover effects
- Real-time upload progress bar
- File name and size display
- Success/error toasts using the project's toast system
- Smooth animations using Framer Motion
- Responsive design

### Error Handling
- File type validation
- File size validation
- Network error handling
- Server-side error responses
- User-friendly error messages

## Customization

### Change Maximum File Size
Edit in **`src/components/ResumeUploader.tsx`**:
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
```

Or in **`server.ts`**:
```typescript
limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
```

### Change Allowed File Types
Edit in **`src/components/ResumeUploader.tsx`**:
```typescript
const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
```

### Change Upload Directory
Edit in **`server.ts`**:
```typescript
const uploadDir = path.join(process.cwd(), "uploads"); // Change "uploads" to desired path
```

### Change API Endpoint URL
Edit in **`src/components/ResumeUploader.tsx`**:
```typescript
const response = await axios.post("/api/resume/upload", formData, {
  // Change URL here
});
```

## Troubleshooting

### Backend not responding
- Ensure backend is running: `npm run dev:server`
- Check that port 5000 is not in use
- Verify proxy settings in `vite.config.ts`

### CORS errors
- CORS is enabled in the Express server
- Check browser console for specific error messages

### File upload fails
- Check file size (max 5MB)
- Verify file type (PDF or DOCX only)
- Check server console for detailed error messages
- Ensure `uploads` directory exists and is writable

### TypeScript errors in server.ts
- Ensure TypeScript dev dependencies are installed
- Run: `bun install` or `npm install`

## Next Steps

### Integration Suggestions
1. **Resume Parsing** - Parse uploaded resume using a library like `pdfjs-dist` or `mammoth`
2. **Database Storage** - Save resume metadata to a database
3. **Resume Preview** - Display uploaded resume content
4. **Multiple Resumes** - Allow users to upload multiple resumes
5. **Resume Management** - Add delete/replace functionality

### Related Features
- The `Upload` page can be linked from your Dashboard
- Add a navigation link in the Header component
- Integrate with the Interview workflow
