import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get comments for an annotation
router.get('/annotation/:annotationId', async (req, res) => {
  try {
    const { annotationId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { annotationId },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create a new comment
router.post('/', async (req, res) => {
  try {
    const { annotationId, content, isAiResponse = false } = req.body;

    if (!annotationId || !content) {
      return res.status(400).json({ error: 'annotationId and content are required' });
    }

    const comment = await prisma.comment.create({
      data: {
        annotationId,
        content,
        isAiResponse
      }
    });

    res.json({ comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.comment.delete({
      where: { id }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;