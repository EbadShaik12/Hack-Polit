# HackPilot (MERN Stack Project Skeleton)

Welcome to HackPilot! This is a clean, modular, and beginner-friendly boilerplate for a MERN stack application, configured using modern developer workflows.

## Features & Technologies

- **Frontend**: React (scaffolded via Vite), Tailwind CSS v4 (using `@tailwindcss/vite` plugin), Axios (configured with request/response token interceptors), and React Router (configured with public/private routing wrappers).
- **Backend**: Node.js & Express configured with ES Modules (`"type": "module"`), MongoDB database integration via Mongoose, and a JWT authentication middleware skeleton.
- **Orchestration**: `concurrently` package loaded at the root level to run both client and server development nodes concurrently with a single command.

---

## Directory Structure

```text
HackPilot/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection logic
│   ├── controllers/
│   │   └── authController.js  # Controller skeletons (register, login, profile)
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT route protection middleware
│   │   └── errorMiddleware.js # Centralized 404 & server error handler
│   ├── models/
│   │   └── userModel.js       # Mongoose schema for User
│   ├── routes/
│   │   └── authRoutes.js      # Auth API endpoints routes definition
│   ├── .env.example           # Backend environment template
│   ├── .gitignore             # Git ignore file for backend
│   ├── package.json           # Backend dependencies configuration
│   └── server.js              # Central application bootstrapper
│
├── frontend/
│   ├── src/
│   │   ├── assets/            # App static asset folder
│   │   ├── components/        # Reusable view components (e.g., ProtectedRoute)
│   │   ├── context/           # App-wide global states (e.g., AuthContext)
│   │   ├── pages/             # Route target page templates (Dashboard, Login, etc.)
│   │   ├── services/          # Services/Axios clients setup (e.g., api.js)
│   │   ├── App.jsx            # Routing and application entry layout
│   │   ├── index.css          # Global style sheets (imports Tailwind v4)
│   │   └── main.jsx           # Client engine bootstrap script
│   ├── .env.example           # Frontend environment template
│   ├── .gitignore             # Git ignore file for frontend
│   ├── index.html             # Client HTML base template
│   ├── package.json           # Client packages and scripts configuration
│   └── vite.config.js         # Vite custom plugins and API proxies setup
│
├── .gitignore
├── package.json               # Root orchestrator packages and development commands
└── README.md                  # System instruction set documentation
```

---

## Getting Started

### Prerequisites

- Node.js installed on your machine
- MongoDB instance running locally (default: `mongodb://127.0.0.1:27017/hackpilot`) or Atlas connection string

### Setup and Running

1. **Install All Dependencies**:
   From the root folder, execute:
   ```bash
   npm run install-all
   ```
   *This command runs `npm install` inside the root, `backend/`, and `frontend/` folders in one go.*

2. **Configure Environment Variables**:
   - Copy `backend/.env.example` to `backend/.env` and update the `MONGO_URI` and `JWT_SECRET` variables.
   - Copy `frontend/.env.example` to `frontend/.env`.

3. **Start Development Servers**:
   To boot both frontend and backend concurrently, run:
   ```bash
   npm run dev
   ```
   - Frontend will run on: `http://localhost:5173`
   - Backend API will run on: `http://localhost:5000`
