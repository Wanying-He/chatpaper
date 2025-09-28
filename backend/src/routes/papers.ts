import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { upload } from '../middleware/upload';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

router.post('/upload', upload.single('pdf'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const paper = await prisma.paper.create({
      data: {
        title: title.trim(),
        filename: req.file.originalname,
        filepath: req.file.path,
        fileSize: req.file.size
      }
    });

    res.json({
      success: true,
      paper: {
        id: paper.id,
        title: paper.title,
        filename: paper.filename,
        uploadDate: paper.uploadDate,
        fileSize: paper.fileSize
      }
    });
  } catch (error) {
    console.error('Error uploading paper:', error);
    res.status(500).json({ error: 'Failed to upload paper' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const papers = await prisma.paper.findMany({
      orderBy: { uploadDate: 'desc' },
      select: {
        id: true,
        title: true,
        filename: true,
        uploadDate: true,
        fileSize: true
      }
    });

    res.json({ papers });
  } catch (error) {
    console.error('Error fetching papers:', error);
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paper = await prisma.paper.findUnique({
      where: { id }
    });

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const absolutePath = path.resolve(paper.filepath);
    res.sendFile(absolutePath);
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({ error: 'Failed to serve PDF' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const paper = await prisma.paper.findUnique({
      where: { id }
    });

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    await prisma.paper.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('Error deleting paper:', error);
    res.status(500).json({ error: 'Failed to delete paper' });
  }
});

export default router;