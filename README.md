# Workshop Management App

A full-stack web app for managing a single-day workshop: attendee registration, session scheduling, QR-based self-attendance, and PDF certificate generation.

## Tech Stack

- **Frontend:** React, Vite, React Router
- **Backend:** Express, SQLite, JWT auth, PDFKit

## Getting Started

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

Copy `backend/.env.example` to `backend/.env` and adjust values if needed.

Default admin credentials:

- Email: `admin@example.com`
- Password: `admin123`

### 3. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Features

- Admin login with seeded account and sessions
- Attendee registration and login
- Admin session CRUD with overlap validation
- Public and authenticated schedule views
- QR-based attendance check-in
- Server-side PDF certificate generation
- Role-based access control on frontend and backend

## Project Structure

```
workshop/
├── backend/          # Express API + SQLite
├── frontend/         # React Vite app
└── FEATURE_SPEC.md   # Full feature specification



## Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a Pull Request.

Please keep changes focused and well documented.
