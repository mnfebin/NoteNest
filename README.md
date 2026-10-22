# NoteNest — Student Notes Sharing Platform 📚

> **CSE Coursework Project: Full Stack Web Development (Year 2)**  
> Built with **React 19**, **Vite**, **React Router v7**, **Lucide React**, and **Plain Vanilla CSS**.

---

## 🗂️ Project Structure

All frontend application code is self-contained in the **`frontend/`** directory:

```
NoteNest/
├── frontend/               # Complete frontend application
│   ├── public/             # Static assets & NoteNest SVG logo
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, NoteCard, etc.)
│   │   ├── context/        # State management & localStorage sync (NotesContext)
│   │   ├── data/           # Academic notes dataset & CSE syllabus seed data
│   │   ├── pages/          # 9 complete website pages
│   │   └── styles/         # Global design system & layout stylesheet
│   ├── package.json        # Frontend dependencies & scripts
│   └── vite.config.js      # Vite configuration
│
├── package.json            # Root runner convenience script
├── .gitignore              # Ignores node_modules, build outputs & logs
└── README.md               # Main project documentation
```

---

## 🚀 How to Run the Frontend

You can run the project either from the root or inside the `frontend` folder:

### Option 1: From the Root Directory
```bash
npm run dev
```

### Option 2: From the `frontend` Directory
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧭 Frontend Pages & Features

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | **Home** | Hero section with tagline *"Your notes. Your community. Your success."*, search bar, semester filters, core subjects, and popular notes. |
| `/notes` | **Explore Notes** | Real-time text search, subject filter, semester filter, trending topic chips, and sorting. |
| `/notes/:id` | **Note Details** | Full note metadata, key syllabus concepts, document reader preview, bookmarking, download simulation, and report dialog. |
| `/upload` | **Upload Notes** | Drag-and-drop PDF selection, form validation, and live publishing to local state. |
| `/library` | **My Library** | Saved notes persisted across sessions using `localStorage`. |
| `/profile` | **Student Profile** | Student details, uploaded notes list, download counts, and delete confirmation modal. |
| `/login` | **Student Login** | Student login card, email/password validation, show/hide password toggle, and demo quick-fill. |
| `/register` | **Student Register** | Registration form with password confirmation matching. |
| `/admin` | **Admin Dashboard** | Oversight portal with 4 statistic cards, notes repository table, and reports moderation table. |
