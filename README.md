# ChatPaper

A tool for annotating and chatting with research papers using AI.

## Features

- Upload and view PDF papers
- Highlight text and add annotations
- Chat with AI about specific paper sections
- Browse and search through all notes and comments
- Three-panel interface: paper list, PDF viewer, and comments

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with Prisma ORM
- **PDF**: react-pdf for viewing and annotation
- **AI**: OpenAI/Claude API integration

## Getting Started

### Backend Setup

```bash
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Project Structure

```
chatpaper/
├── frontend/          # React app
├── backend/           # Express API
└── database/          # SQLite database
```

## Development

- Backend runs on http://localhost:3001
- Frontend runs on http://localhost:3000
- Database migrations: `npm run db:migrate`
- Database studio: `npm run db:studio`