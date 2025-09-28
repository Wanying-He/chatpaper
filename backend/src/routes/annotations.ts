import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { paperId, pageNumber, coordinates, highlightedText } = req.body;

    if (!paperId || !pageNumber || !coordinates || !highlightedText) {
      return res.status(400).json({
        error: 'Missing required fields: paperId, pageNumber, coordinates, highlightedText'
      });
    }

    // Verify the paper exists
    const paper = await prisma.paper.findUnique({
      where: { id: paperId }
    });

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const annotation = await prisma.annotation.create({
      data: {
        paperId,
        pageNumber: parseInt(pageNumber),
        coordinates: JSON.stringify(coordinates),
        highlightedText: highlightedText.trim()
      }
    });

    res.json({
      success: true,
      annotation: {
        id: annotation.id,
        paperId: annotation.paperId,
        pageNumber: annotation.pageNumber,
        coordinates: annotation.coordinates,
        highlightedText: annotation.highlightedText,
        createdAt: annotation.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating annotation:', error);
    res.status(500).json({ error: 'Failed to create annotation' });
  }
});

router.get('/paper/:paperId', async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;

    const annotations = await prisma.annotation.findMany({
      where: { paperId },
      orderBy: { createdAt: 'desc' },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    res.json({ annotations });
  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({ error: 'Failed to fetch annotations' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const annotation = await prisma.annotation.findUnique({
      where: { id }
    });

    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    await prisma.annotation.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Annotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting annotation:', error);
    res.status(500).json({ error: 'Failed to delete annotation' });
  }
});

export default router;