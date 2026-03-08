# Resume Upload Feature - Quick Start

## What's Been Implemented

✅ **Frontend Resume Uploader Component** (`src/components/ResumeUploader.tsx`)
- Drag-and-drop interface
- File type validation (PDF/DOCX only, max 5MB)
- Real-time upload progress tracking
- Success/error toast notifications
- Smooth animations

✅ **Upload Page** (`src/pages/Upload.tsx`)
- Full-page upload interface
- Integrated with the main app routing

✅ **Express Backend Server** (`server.ts`)
- `POST /api/resume/upload` endpoint
- File storage with secure naming
- Error handling and validation

✅ **Configuration Updates**
- Updated `package.json` with all dependencies
- Updated `vite.config.ts` with API proxy
- Added `App.tsx` route for upload page

---

## Getting Started (4 Steps)

### 1. Install Dependencies
```bash
bun install
```
Or if using npm:
```bash
npm install
```

### 2. Start Both Servers
```bash
npm run dev:all
```

This starts:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000

### 3. Navigate to Upload Page
Open your browser and go to:
```
http://localhost:8080/upload
```

### 4. Test Upload
- Drag and drop a PDF or DOCX file
- Or click to browse and select a file
- Watch the upload progress
- See the success message

---

## API Endpoint

**POST** `/api/resume/upload`

**Request:**
```javascript
const formData = new FormData();
formData.append("resume", file); // PDF or DOCX file
axios.post("/api/resume/upload", formData);
```

**Response:**
```json
{
  "success": true,
  "filePath": "/uploads/resume-1706234567890.pdf",
  "fileName": "resume.pdf",
  "fileSize": 245632,
  "uploadedAt": "2026-03-07T10:30:45.123Z"
}
```

---

## File Locations

| File | Purpose |
|------|---------|
| `src/components/ResumeUploader.tsx` | Upload component with drag-drop UI |
| `src/pages/Upload.tsx` | Upload page |
| `server.ts` | Express backend API server |
| `src/App.tsx` | App routes (updated) |
| `vite.config.ts` | Vite config with API proxy (updated) |
| `package.json` | Dependencies & scripts (updated) |
| `RESUME_UPLOAD_SETUP.md` | Detailed setup guide |

---

## Troubleshooting

**Backend won't start?**
- Check if port 5000 is available
- Try: `lsof -i :5000` (Unix) or `netstat -ano | findstr :5000` (Windows)

**Upload fails?**
- Check file size (max 5MB)
- Verify file type (PDF or DOCX only)
- Check browser console and server logs

**CORS errors?**
- CORS is already enabled in the server
- Check that both servers are running on correct ports

**Need to run frontend only?**
```bash
npm run dev
```

**Need to run backend only?**
```bash
npm run dev:server
```

---

## Next Steps

- Link upload page from Dashboard
- Add to navigation menu
- Integrate resume parsing (pdfjs-dist / mammoth)
- Save to database
- Add resume preview functionality

---

For more details, see [RESUME_UPLOAD_SETUP.md](RESUME_UPLOAD_SETUP.md)
