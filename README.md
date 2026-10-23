# NoteNest — Student Notes Sharing Platform 📚

> **CSE Coursework Project: Full Stack Web Development (Year 2)**  
> NoteNest is a full-stack academic study-material sharing platform built with **React 19**, **Vite**, **Express**, **Prisma ORM**, **PostgreSQL**, and **Supabase Storage**.

---

## 🗂️ Project Structure

The `main` branch contains the entire full-stack application code organized into two main workspaces:

```
NoteNest/
├── frontend/                     # React 19 Client Application
│   ├── public/                   # Static assets & NoteNest SVG logo
│   ├── src/
│   │   ├── components/           # Reusable UI components (Navbar, NoteCard, etc.)
│   │   ├── context/              # Global state & offline demo mode (NotesContext)
│   │   ├── data/                 # Academic notes dataset & CSE syllabus seed data
│   │   ├── pages/                # 9 complete website pages
│   │   ├── services/             # Universal API client (api.js)
│   │   └── styles/               # Global design system & layout stylesheet
│   ├── package.json              # Frontend dependencies & scripts
│   └── vite.config.js            # Vite configuration
│
├── backend/                      # Node.js + Express API Server
│   ├── prisma/                   # Prisma schema, migrations, seed script
│   │   ├── migrations/           # PostgreSQL migration history
│   │   ├── schema.prisma         # Models (User, Note, Bookmark, Report)
│   │   └── seed.js               # Database seed script
│   ├── src/
│   │   ├── config/               # Prisma, Supabase, and environment configs
│   │   ├── controllers/          # Business logic controllers
│   │   ├── middleware/           # Auth, error, and validation middleware
│   │   ├── routes/               # Express REST endpoint routes
│   │   ├── services/             # Storage service (Supabase & local fallback)
│   │   └── server.js             # Express server entry point
│   ├── tests/                    # 14 automated API integration tests
│   ├── .env.example              # Environment variables template
│   └── package.json              # Backend dependencies & scripts
│
├── package.json                  # Root monorepo runner scripts
├── .gitignore                    # Git ignore rules for node_modules, logs, secrets
└── README.md                     # Main documentation
```

---

## 🚀 Quick Start Guide for Team Members

### 1. Install All Dependencies
From the repository root:
```bash
npm run install:all
```
*(Or install inside each folder: `cd frontend && npm i`, `cd backend && npm i`)*

---

### 2. Running the Frontend
From the repository root:
```bash
npm run dev:frontend
```
Or inside the `frontend/` directory:
```bash
cd frontend
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

> 💡 **Offline Demo Mode:** If the backend database isn't running yet, the frontend automatically falls back to built-in mock syllabus notes and demo sign-in so team members can build and test UI seamlessly!

---

### 3. Running the Backend API
1. Setup environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Make sure your PostgreSQL database is running, then run migrations & seed:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```
3. Start the server from the root:
   ```bash
   npm run dev:backend
   ```
   Or inside `backend/`:
   ```bash
   cd backend
   npm run dev
   ```
The API server will listen on **[http://localhost:5000/api](http://localhost:5000/api)**.

---

### 4. Running Backend Automated Tests
From the root:
```bash
npm run test:backend
```
Or inside `backend/`:
```bash
cd backend
npm test
```

---

## 🧭 Frontend Pages & Routes

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | **Home** | Hero section with search bar, semester filters, core subjects, and popular notes. |
| `/notes` | **Explore Notes** | Real-time text search, subject filter, semester filter, trending topic chips, and sorting. |
| `/notes/:id` | **Note Details** | Full note metadata, key syllabus concepts, document reader preview, bookmarking, download simulation, and report dialog. |
| `/upload` | **Upload Notes** | Drag-and-drop PDF selection, form validation, and upload to backend/local state. |
| `/library` | **My Library** | Saved notes persisted across sessions. |
| `/profile` | **Student Profile** | Student details, uploaded notes list, download counts, and delete confirmation modal. |
| `/login` | **Student Login** | Student login card, email/password validation, show/hide password toggle, and demo quick-fill. |
| `/register` | **Student Register** | Registration form with password confirmation matching. |
| `/admin` | **Admin Dashboard** | Oversight portal with 4 statistic cards, notes repository table, and reports moderation table. |

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new student account | No |
| `POST` | `/api/auth/login` | Login and receive JWT token | No |
| `GET` | `/api/auth/me` | Get current logged-in user profile | Yes |
| `GET` | `/api/notes` | List notes with search, filters, pagination | No |
| `GET` | `/api/notes/:id` | Get details of a single note | No |
| `POST` | `/api/notes` | Upload a new note (with PDF file) | Yes |
| `DELETE` | `/api/notes/:id` | Delete own note or delete as admin | Yes |
| `POST` | `/api/bookmarks/:noteId` | Toggle bookmark on a note | Yes |
| `GET` | `/api/bookmarks` | Get all saved bookmarks for student | Yes |
| `POST` | `/api/reports` | Report an inappropriate note | Yes |
| `GET` | `/api/admin/stats` | Admin metrics (total notes, users, reports) | Admin |
| `GET` | `/api/admin/reports` | Admin report moderation list | Admin |
