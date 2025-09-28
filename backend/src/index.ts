import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import papersRouter from './routes/papers';
import annotationsRouter from './routes/annotations';
import commentsRouter from './routes/comments';
import aiRouter from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/papers', papersRouter);
app.use('/api/annotations', annotationsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/ai', aiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ChatPaper API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});