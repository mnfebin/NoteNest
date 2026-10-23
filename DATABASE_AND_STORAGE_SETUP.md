# NoteNest — Database & Storage Setup Guide 📚
> **Member 3: Database & File Management Implementation**  
> *Targeted for 2nd Year CSE Students, Team Members, and Evaluators*

Welcome to the **NoteNest Database & File Management Module**! This guide walks you step-by-step through setting up the PostgreSQL database, configuring Prisma ORM, setting up Supabase Storage for persistent PDF notes, running migrations, and integrating with the other team members' modules.

---

## 🏗️ 1. Architecture Overview

NoteNest uses a modern, production-grade decoupled storage architecture:

```
[ Student / React Frontend (Member 1) ]
                  │
                  ▼ Multipart PDF Form Data (Max 10 MB)
[ Express Backend & Auth (Member 2) ]
                  │
                  ├── 1. Server-Side Magic Bytes Validation (%PDF-)
                  ├── 2. Upload PDF Binary Buffer
                  │         ▼
                  │   [ Supabase Storage: 'notenest-notes' bucket ]
                  │   (Stores: Binary PDF file, returns safe fileKey)
                  │
                  └── 3. Persist Metadata & fileKey via NotesRepository
                            ▼
                      [ PostgreSQL via Prisma ORM ]
                      (Stores: Title, Subject, Semester, fileKey, uploaderId)
```

### Key Security Principles Implemented:
1. **Never store PDF binaries in PostgreSQL or localStorage**: The database only stores file metadata (`fileKey`, `fileName`, `fileSize`, `mimeType`, `fileUrl`).
2. **Server-Side File Validation**: We do not trust the file extension or browser MIME type alone. The server inspects the binary buffer's magic bytes header (`0x25 0x50 0x44 0x46` = `%PDF-`) before processing.
3. **Safe Storage Keys**: File keys are generated on the server using `notes/${timestamp}-${uuid}-${safeName}` to prevent collisions, path traversal (`../`), and accidental file overwrites.
4. **Short-Lived Signed Download URLs**: Secure download links expire after **60 seconds**, protecting academic assets from hotlinking and unauthorized scraping.
5. **Safe Soft-Delete**: Deleting a note marks it as `REMOVED` in PostgreSQL, removing it from active listings while safely preserving moderation history and reports for Member 4's admin dashboard.

---

## 🗄️ 2. PostgreSQL Database Setup

You have two easy options to run PostgreSQL:

### Option A: Free Cloud PostgreSQL (Recommended for Team Collaboration)
1. Go to [Supabase](https://supabase.com) (or [Neon.tech](https://neon.tech)).
2. Create a free project named `notenest-db`.
3. In **Project Settings ➔ Database**, copy your **Connection String (URI)**.
4. It looks like:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?schema=public"
   ```

### Option B: Local PostgreSQL (On Your Laptop)
1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/).
2. Open **pgAdmin** or your terminal (`psql`):
   ```sql
   CREATE DATABASE notenest;
   ```
3. Your local connection string will be:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/notenest?schema=public"
   ```

---

## ☁️ 3. Supabase Storage Setup (For PDF Lecture Notes)

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **Storage** on the left menu.
3. Click **"New Bucket"**:
   - **Bucket Name**: `notenest-notes` (all lowercase).
   - **Public Bucket**: **Turn ON** (or leave private if relying strictly on signed URLs).
   - **File size limit**: Set to `10 MB` (or leave default).
   - **Allowed MIME types**: `application/pdf`.
4. Click **Save Bucket**.
5. Get your API credentials:
   - Go to **Project Settings ➔ API**.
   - Copy **Project URL** (e.g. `https://xyz.supabase.co`).
   - Copy **service_role key** (under *Project API keys*).
   > ⚠️ **IMPORTANT**: The `service_role` key must ONLY be placed in `backend/.env`. Never expose this key to the React frontend or GitHub!

---

## 🔑 4. Environment Variables Setup

Create a `.env` file inside the `backend/` folder by copying `.env.example`:

```bash
# In the repository root:
cp backend/.env.example backend/.env
```

Now open `backend/.env` and supply your actual credentials:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# 1. PostgreSQL Database
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/notenest?schema=public"

# 2. JWT Secrets
JWT_SECRET=my_college_project_secret_key_minimum_16_chars
JWT_EXPIRES_IN=7d

# 3. Supabase Storage
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_actual_service_role_secret"
SUPABASE_STORAGE_BUCKET="notenest-notes"

# 4. Upload Size Limit
MAX_FILE_SIZE_MB=10

# 5. Local Fallback (Optional for offline development)
ALLOW_LOCAL_STORAGE=false
```

> 💡 **Offline Development Mode:** If you do not have Supabase credentials yet, set `ALLOW_LOCAL_STORAGE=true`. The server will safely save uploads to `backend/uploads/` on your computer until cloud storage is configured!

---

## ⚙️ 5. Running Prisma Migrations & Generating Client

From the `backend/` directory:

### Step 1: Generate the Prisma Client
```bash
npx prisma generate
```
*(This generates the strongly-typed database query library inside `node_modules/@prisma/client`).*

### Step 2: Apply Database Migrations
When your PostgreSQL database is running:
```bash
npx prisma migrate dev --name init
```
*(Or in production/cloud databases: `npx prisma migrate deploy`)*

### Step 3: Seed Sample Data
Populate the database with verified curriculum notes, demo students (Alex Rivera, Aarav, Priya), and administrator accounts:
```bash
npm run prisma:seed
```

### Step 4: Open Prisma Studio (Database GUI)
Inspect and edit database records visually in your browser:
```bash
npm run prisma:studio
```
Opens at: **`http://localhost:5555`**

---

## 🚀 6. Starting the Backend Server

```bash
# From the root repository:
npm run dev:backend

# Or from the backend/ directory:
cd backend
npm run dev
```

You should see:
```
✅ PostgreSQL database connected successfully via Prisma.
✅ Supabase Storage configured (bucket: "notenest-notes").
🚀 NoteNest Backend running in [development] mode on port 5000
📡 Local API Base: http://localhost:5000/api
🩺 Health check:   http://localhost:5000/health
```

---

## 🧪 7. Running Automated Tests

Run the automated test suite from the repository root:
```bash
npm run test:backend
```
Or inside `backend/`:
```bash
npm test
```

### Test Coverage Highlights:
- **Server-Side PDF Validation**: Validates magic bytes header signature (`%PDF-`), rejecting plain text and executables disguised as PDFs.
- **Filename Sanitization**: Verifies directory traversal prevention (`../../../etc/shadow.pdf` ➔ `shadow.pdf`).
- **Storage Service**: Tests uploading, generating 60-second signed download URLs, safe deletion, and fallback modes.
- **Repository Abstractions**: Tests `NotesRepository`, `BookmarksRepository`, and `ReportsRepository`.
- **Validation Schemas**: Tests Zod schemas enforcing 10MB limits, required fields, and pagination bounds.

---

## 📋 8. Database Schema Models & Relationships

The database schema is defined in `backend/prisma/schema.prisma`:

### 1. `User` Model
Represents students and administrators.
- `id`: CUID String primary key.
- `name`: Student full name.
- `email`: Unique institutional email address (indexed).
- `passwordHash`: Bcrypt salted password hash (never stored in plain text).
- `role`: Enum (`USER` | `ADMIN`), defaults to `USER`.
- `semester`: Academic semester (1–8).
- `branch`: Engineering branch (e.g. *Computer Science & Engineering*).
- `college`: College / University name.
- `studentId`: Student roll/ID number.

### 2. `Note` Model
Represents academic study material and PDF uploads.
- `id`: CUID String primary key.
- `title`: Note title (indexed for search).
- `description`: Summary of note content.
- `subject`: Academic course/subject (indexed for filtering).
- `semester`: Int semester 1–8 (indexed for filtering).
- `topic`: Specific curriculum module / topic.
- `uploaderId`: Foreign key relation to `User.id` (onDelete: Cascade).
- `fileKey`: Unique cloud storage path key (e.g. `notes/1740000000-uuid-note.pdf`).
- `fileName`: Original sanitized document filename.
- `fileUrl`: Public or base URL to the document.
- `fileSize`: Human-readable file size string (e.g. `"4.2 MB"`).
- `fileType`: Document type (defaults to `"PDF"`).
- `mimeType`: Standard MIME type (defaults to `"application/pdf"`).
- `downloadCount`: Integer counter incremented atomically on download.
- `status`: Enum (`PENDING` | `APPROVED` | `REJECTED` | `REMOVED`), defaults to `APPROVED`.
- `previewPages`: Estimated number of pages for preview reader.
- `tags`: Array of searchable topic tags.
- `keyConcepts`: Array of syllabus concepts covered in the notes.

### 3. `Bookmark` Model
Represents a student saving a note to their personal library.
- `id`: CUID String primary key.
- `userId`: Foreign key to `User.id` (onDelete: Cascade).
- `noteId`: Foreign key to `Note.id` (onDelete: Cascade).
- `createdAt`: Timestamp when saved.
- **Unique Constraint**: `@@unique([userId, noteId])` prevents duplicate bookmarks.

### 4. `Report` Model
Represents student moderation reports filed for incorrect or low-quality notes.
- `id`: CUID String primary key.
- `noteId`: Foreign key to `Note.id` (onDelete: Cascade).
- `reporterId`: Foreign key to `User.id` (onDelete: Cascade).
- `reason`: Summary reason (e.g. *"Missing diagram"*, *"Calculation error"*).
- `description`: Detailed comments from student.
- `status`: Enum (`OPEN` | `REVIEWED` | `RESOLVED` | `DISMISSED`), defaults to `OPEN`.

---

## 📡 9. API Reference & Contract for Team Members

### Member 1 (React Frontend) Integration:
All responses follow a predictable JSON format:
```json
// Success
{
  "success": true,
  "statusCode": 200,
  "message": "Notes retrieved successfully",
  "data": [ ... ],
  "meta": { "total": 12, "page": 1, "limit": 12, "totalPages": 1 }
}

// Error
{
  "success": false,
  "statusCode": 400,
  "message": "File size exceeds the limit of 10 MB.",
  "errors": [ ... ]
}
```

### Endpoints Implemented:

| Method | Endpoint | Description | Auth Required | Request Body / Form |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/notes` | List active notes with filtering and pagination | No | Query: `?search=...&subject=...&semester=4&page=1` |
| `GET` | `/api/notes/:id` | Get note details by ID | No | None |
| `GET` | `/api/notes/:id/download` | Atomically increment counter & get **60s signed download URL** | No | None |
| `POST` | `/api/notes` | Upload note metadata & PDF document | Yes (Bearer) | `multipart/form-data`: `file`, `title`, `description`, `subject`, `semester`, `topic`, `tags`, `keyConcepts` |
| `PATCH` | `/api/notes/:id` | Update note metadata (Owner or Admin) | Yes (Bearer) | JSON: `{ title, description, subject, semester, topic }` |
| `DELETE` | `/api/notes/:id` | Soft-delete note (sets status `REMOVED`) | Yes (Bearer) | None (Admin can pass `?permanent=true` for hard cleanup) |
| `GET` | `/api/bookmarks` | Retrieve saved notes in student's library | Yes (Bearer) | None |
| `POST` | `/api/bookmarks/:noteId` | Add note to bookmarks (safe upsert) | Yes (Bearer) | None |
| `DELETE` | `/api/bookmarks/:noteId` | Remove note from bookmarks | Yes (Bearer) | None |
| `POST` | `/api/reports` | Submit moderation report | Yes (Bearer) | JSON: `{ noteId, reason, description }` |
| `POST` | `/api/notes/:id/reports`| Submit report directly by note ID | Yes (Bearer) | JSON: `{ reason, description }` |

---

## 🛠️ 10. Troubleshooting Common Issues

### 1. `PrismaClientInitializationError: Can't reach database server at ...:5432`
- **Cause**: PostgreSQL server is not running or connection URL is incorrect.
- **Fix**: Check `DATABASE_URL` in `backend/.env`. Ensure PostgreSQL service is active on port 5432 or your cloud provider project is not paused.

### 2. `Invalid file content: magic bytes signature verification failed`
- **Cause**: A non-PDF file (e.g. `.txt`, `.docx`, or `.exe`) was uploaded, or the file was renamed to `.pdf` without being an actual PDF document.
- **Fix**: Upload an authentic PDF document created via Word, LaTeX, or print-to-PDF.

### 3. `File size exceeds the limit of 10 MB`
- **Cause**: Uploaded PDF document is larger than the configured `MAX_FILE_SIZE_MB`.
- **Fix**: Compress the PDF document or increase `MAX_FILE_SIZE_MB` in `backend/.env`.

### 4. `Supabase Storage upload failed: Bucket not found`
- **Cause**: The storage bucket does not exist or name is misspelled.
- **Fix**: In your Supabase Dashboard, create the bucket named `notenest-notes` and verify `SUPABASE_STORAGE_BUCKET=notenest-notes` in `backend/.env`.

---

## 🤝 11. Coordination with Team Members

- **Member 1 (Frontend)**: Uses `api.notes.upload(formData)` and `api.notes.download(id)`. Formatted notes include `fileKey`, `mimeType`, and `isBookmarked` so the UI does not require changes.
- **Member 2 (Auth & Backend)**: The `authenticate` and `optionalAuthenticate` middleware are preserved. Notes link seamlessly to `req.user.id`.
- **Member 4 (Admin Dashboard)**: Soft deletion sets `status = 'REMOVED'`. The reports moderation queue, dashboard statistics, and approval pipelines remain fully functional.
