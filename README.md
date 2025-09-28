# ChatPaper - AI-Powered PDF Annotation Tool

A modern web application for annotating PDF documents with AI-powered question answering capabilities.

## 🚀 Features

- **PDF Upload & Management** - Upload and organize your research papers
- **Smart Annotations** - Highlight text and add comments
- **AI Integration** - Ask questions about highlighted content (placeholder ready for real AI APIs)
- **Advanced Search** - Search papers and annotations with filtering
- **Responsive Design** - Works on desktop and mobile devices
- **Real-time Interface** - Three-panel layout with PDF viewer, annotations, and comments

## 🛠️ Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS, React-PDF
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite with Prisma ORM
- **File Handling**: Multer for PDF uploads

## 📦 Setup Instructions

### Prerequisites
- Node.js 16+ and npm

### 1. Clone Repository
```bash
git clone https://github.com/Wanying-He/chatpaper.git
cd chatpaper
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```bash
# backend/.env
DATABASE_URL="file:./database/dev.db"
PORT=3001
```

Setup database:
```bash
npx prisma db push
npx prisma generate
```

Start backend:
```bash
npm run dev
```
*Backend runs on http://localhost:3001*

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```
*Frontend runs on http://localhost:3000*

## 🤖 AI Integration

The application includes a placeholder AI system. To integrate with real AI services:

### OpenAI Integration
1. Install OpenAI SDK: `npm install openai`
2. Add API key to `.env`: `OPENAI_API_KEY=your_key_here`
3. Update `/backend/src/routes/ai.ts` with OpenAI calls

### Claude Integration
1. Install Anthropic SDK: `npm install @anthropic-ai/sdk`
2. Add API key to `.env`: `ANTHROPIC_API_KEY=your_key_here`
3. Update `/backend/src/routes/ai.ts` with Claude calls

## 📖 Usage

1. **Upload PDFs** - Use the upload button in the papers panel
2. **Highlight Text** - Select text in the PDF viewer to create annotations
3. **Add Comments** - Write notes on your highlights
4. **Ask AI** - Click "Ask AI about this selection" for contextual assistance
5. **Search** - Use search bars to find papers or specific annotations

## 🏗️ Architecture

```
chatpaper/
├── backend/           # Express API server
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── middleware/# File upload handling
│   │   └── index.ts   # Server entry point
│   └── prisma/        # Database schema
└── frontend/          # React application
    ├── src/
    │   ├── components/# React components
    │   ├── pages/     # Page layouts
    │   ├── hooks/     # Custom React hooks
    │   ├── store/     # State management
    │   └── utils/     # API client
    └── public/        # Static assets
```

## 🔧 API Endpoints

- `GET /api/papers` - List all papers
- `POST /api/papers/upload` - Upload new PDF
- `GET /api/annotations/paper/:id` - Get annotations for paper
- `POST /api/annotations` - Create new annotation
- `POST /api/comments` - Add comment to annotation
- `POST /api/ai/ask` - Ask AI question about content

## 🎯 Next Steps

- Integrate with real AI APIs (OpenAI/Claude/Gemini)
- Add user authentication
- Implement collaborative features
- Add more file format support
- Enhance search with semantic capabilities

## 📄 License

MIT License - feel free to use this project as a foundation for your research tools!

---

Built with ❤️ using React, Node.js, and modern web technologies.