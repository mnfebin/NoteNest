# NoteNest Backend API 🚀

> **CSE Coursework Project: Full Stack Web Development (Year 2)**  
> RESTful API built with **Node.js**, **Express**, **Prisma ORM**, **PostgreSQL**, and **Supabase Storage**.

---

## 🗂️ Project Structure

All backend application code is self-contained in the **`backend/`** directory:

```
NoteNest/
├── backend/
│   ├── prisma/             # Prisma schema, migrations, seed data, and admin promotion
│   │   ├── migrations/     # Database migration history
│   │   ├── schema.prisma   # PostgreSQL data models (User, Note, Bookmark, Report)
│   │   └── seed.js         # Initial mock database seed
│   ├── src/
│   │   ├── config/         # Prisma, Supabase, and environment configs
│   │   ├── controllers/    # Route controllers (Auth, Notes, Bookmarks, Reports, Admin)
│   │   ├── middleware/     # Auth, validation, upload, error handling
│   │   ├── routes/         # Express endpoint route definitions
│   │   ├── services/       # Storage service (Supabase & local fallback)
│   │   ├── utils/          # JWT, password hashing, standard responses
│   │   ├── validators/     # Zod input validation schemas
│   │   ├── app.js          # Express app configuration & middleware
│   │   └── server.js       # HTTP server listener
│   ├── tests/              # API test suite (Node test runner & Supertest)
│   ├── .env.example        # Environment variable template
│   └── package.json        # Backend dependencies & scripts
│
├── package.json            # Root runner convenience scripts
├── .gitignore              # Ignores node_modules, build outputs, and secrets
└── README.md               # Backend documentation
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** database (local or cloud provider e.g., Supabase / Neon / Render)

### 2. Environment Variables
Copy `.env.example` to `.env` inside `backend/`:
```bash
cp backend/.env.example backend/.env
```
Fill in your database URL and Supabase storage keys (or leave defaults for local dev):
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/notenest?schema=public"
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Database Migration & Seeding
```bash
npx prisma migrate dev --name init
npm run prisma:seed
```

---

## 🚀 Running the Backend

You can run the server either from the root or inside `backend/`:

### Option 1: From the Root Directory
```bash
npm run dev
```

### Option 2: From the `backend` Directory
```bash
cd backend
npm run dev
```

The API will be available at [http://localhost:5000/api](http://localhost:5000/api).

---

## 🧪 Running Tests
```bash
npm run test
```

---

## 📡 API Endpoints Overview

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
