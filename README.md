# NoteNest — Student Notes Sharing Platform 📚

> **CSE Coursework Project: Full Stack Web Development (Year 2)**  
> Built with **React 19**, **Vite**, **React Router v7**, **Lucide React**, and **Plain Vanilla CSS**.

---

## 🌟 1. Project Overview

**NoteNest** is a peer-to-peer study notes discovery and sharing platform tailored for undergraduate engineering students. It empowers students to find lecture notes, exam revision guides, and question banks categorized by **Semester (1–8)** and **Core CSE Subjects**.

### Current Development Phase: Frontend Prototype (v1.0)
This repository contains the standalone, fully interactive frontend prototype. All study notes, bookmarks, student uploads, and reported content are managed using React state and persisted across browser sessions via `localStorage`.

---

## 🚀 2. Quick Start Guide

### Prerequisites
- Node.js (v18.0 or newer recommended)
- npm (v9.0 or newer)

### Installation & Running Locally

1. **Clone or navigate to the project directory:**
   ```bash
   cd NoteNest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Open [http://localhost:5173](http://localhost:5173) in your web browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🎨 3. Design Aesthetics & Visual Identity

- **Color Palette:** Clean white and soft slate backgrounds (`#F8FAFC`, `#FFFFFF`), primary soft blue (`#2563EB`), gentle purple accents (`#7C3AED`), and subtle indigo borders.
- **Typography:** Modern readability with Google Font *Plus Jakarta Sans*.
- **Interactions:** Subtle hover lifts, floating feedback toasts, and accessible modals.
- **Responsive Layout:** Adaptive across mobile phones, tablets, laptops, and desktop monitors.

---

## 🧭 4. Website Pages & Routes

| Route | Page | Key Features |
| :--- | :--- | :--- |
| `/` | **Home** | Hero section with tagline *"Your notes. Your community. Your success."*, search bar, quick semester selection (Sem 1–8), subject cards, most downloaded notes, recent notes, and upload CTA banner. |
| `/notes` | **Explore Notes** | Real-time search by title, topic, or keyword; subject dropdown filter; semester dropdown filter; trending topic chips; sorting (Newest, Most Downloaded, Alphabetical); responsive cards grid; and empty state. |
| `/notes/:id` | **Note Details** | Full note metadata (uploader, semester, subject, file size, download counter); key concepts & syllabus coverage; document reader preview; bookmarking; simulated PDF download; and report modal. |
| `/upload` | **Upload Notes** | Drag-and-drop or click-to-select PDF file upload; form validation for required fields; instant publishing to local state and directory. |
| `/library` | **My Library** | Displays all bookmarked notes; remove bookmark button; search within saved notes; persistent in `localStorage`. |
| `/profile` | **Student Profile** | Student details (`Alex Rivera`), uploaded notes counter, total downloads received, my uploaded notes list with delete confirmation modal, and sign out demo. |
| `/login` | **Student Login** | Student login card, email/password validation, show/hide password toggle, and one-click demo credentials autofill. |
| `/register` | **Student Register** | Student registration form, college email validation, semester selector, password confirmation matching, and success redirection. |
| `/admin` | **Admin Dashboard** | Oversight portal with 4 statistic cards (Total Students, Active Notes, Downloads, Pending Reports), notes repository table with delete controls, reports moderation table to review and dismiss complaints, and demo data reset. |

---

## 📂 5. Project Folder Structure

```
NoteNest/
├── public/
│   └── logo.svg                 # NoteNest vector brand logo
├── src/
│   ├── assets/                  # Static assets
│   ├── components/              # Modular, reusable UI components
│   │   ├── Button.jsx           # Button with variants (primary, secondary, outline, danger)
│   │   ├── EmptyState.jsx       # Reusable empty result & fallback state
│   │   ├── FilterBar.jsx        # Subject, semester, and sort filter control bar
│   │   ├── Footer.jsx           # Footer with navigation and course attribution
│   │   ├── Modal.jsx            # Accessible dialog overlay with Esc key support
│   │   ├── Navbar.jsx           # Responsive header with mobile hamburger drawer
│   │   ├── NoteCard.jsx         # Card component used across Home, Explore, and Library
│   │   ├── SearchBar.jsx        # Search input with clear button and focus styling
│   │   ├── StatCard.jsx         # Admin & profile metric cards with trend indicators
│   │   └── Toast.jsx            # Floating feedback alert for downloads & actions
│   ├── context/
│   │   └── NotesContext.jsx     # Centralized React state & localStorage persistence
│   ├── data/
│   │   └── notes.js             # Initial academic seed dataset (12 CSE notes & metadata)
│   ├── pages/
│   │   ├── AdminDashboard.jsx   # Admin statistics & moderation console
│   │   ├── ExploreNotes.jsx     # Main searchable notes catalog
│   │   ├── Home.jsx             # Landing page with hero & syllabus breakdown
│   │   ├── Login.jsx            # Student sign-in screen
│   │   ├── MyLibrary.jsx        # Saved & bookmarked notes screen
│   │   ├── NoteDetails.jsx      # Note reader, preview & report modal
│   │   ├── NotFound.jsx         # 404 fallback page
│   │   ├── Profile.jsx          # Student account & uploaded notes
│   │   ├── Register.jsx         # Student registration screen
│   │   └── UploadNotes.jsx      # PDF notes submission form
│   ├── styles/
│   │   └── global.css           # Complete CSS variables, reset & layout system
│   ├── App.css                  # Custom application overrides
│   ├── App.jsx                  # React Router routes definition & scroll-to-top
│   ├── index.css                # Global CSS import entrypoint
│   └── main.jsx                 # React root renderer
├── index.html                   # HTML template with Google Fonts & meta tags
├── package.json                 # Project dependencies & npm scripts
├── vite.config.js               # Vite bundler configuration
└── README.md                    # Project documentation
```

---

## 💡 6. For Class Presentation & Evaluation

Here is a 2-minute walkthrough script you and your teammates can use during the course presentation:

1. **Home Feed (`/`):**
   - Point out the hero headline: *"Your notes. Your community. Your success."*
   - Demonstrate clicking on a semester pill (e.g., **Semester 4**) or typing **"Operating"** in the hero search to show seamless navigation with query filtering.
2. **Explore Catalog (`/notes`):**
   - Filter by **Subject** (e.g. *Database Management Systems*) or click a **Trending Topic** chip like *AVL Trees* or *ER Model*.
   - Change sort order from *Newest* to *Most Downloaded*.
   - Click the **Clear** button to reset.
3. **Note Details (`/notes/:id`):**
   - Open any note (e.g. *Operating Systems — Virtual Memory*).
   - Click **Bookmark Note**: Notice the purple bookmark state toggle, toast alert, and the badge counter in the Navbar incrementing immediately!
   - Click **Download Free PDF**: Notice the automatic text/PDF file download simulation and download counter increment.
   - Click **Report Inappropriate / Broken Note**: Fill out a report reason and submit. Notice how it instantly routes to the Admin Dashboard!
4. **My Library (`/library`):**
   - Show how the note bookmarked in step 3 is saved and persists even after refreshing the page (F5).
5. **Upload Notes (`/upload`):**
   - Try clicking submit with empty fields to show input validation.
   - Attach a sample PDF, fill out the form, and submit. The newly created note instantly appears in the public explore feed and on your profile!
6. **Student Profile (`/profile`):**
   - Show student metadata, uploaded notes count, and test the delete button with its confirmation modal.
7. **Admin Dashboard (`/admin`):**
   - Show the 4 statistics cards, recent uploads table, and the report submitted in step 3 waiting for review. Click **Dismiss** or **Remove Note**.

---

## 🔮 7. Future Backend Roadmap

When ready to connect the backend:
1. **API Server:** Node.js + Express.js REST API replacing `NotesContext.jsx`.
2. **Relational Database:** PostgreSQL tables for `users`, `notes`, `subjects`, `bookmarks`, and `reports`.
3. **Authentication:** JWT tokens with bcrypt password hashing in HTTP headers.
4. **Object Storage:** AWS S3, Supabase Storage, or Firebase Storage for hosting student PDF documents.
