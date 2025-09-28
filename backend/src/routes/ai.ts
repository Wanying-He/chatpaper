import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Simple AI response function (placeholder for actual AI integration)
async function generateAiResponse(question: string, context: string): Promise<string> {
  // This is a placeholder implementation
  // In a real application, you would integrate with an AI service like OpenAI, Claude, etc.

  const responses = [
    `Based on the highlighted text "${context}", here are some key insights: This appears to discuss important concepts that relate to your question about "${question}".`,
    `The highlighted passage "${context}" suggests several interpretations. Regarding "${question}", this could indicate...`,
    `From the context "${context}", I can help clarify that your question "${question}" touches on fundamental aspects discussed in this section.`,
    `The selected text "${context}" provides useful background. For your question "${question}", consider these perspectives...`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// Ask AI about a specific annotation
router.post('/ask', async (req, res) => {
  try {
    const { annotationId, question, paperId } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    let context = '';
    let finalAnnotationId = annotationId;

    // If annotationId is provided, get the highlighted text for context
    if (annotationId) {
      const annotation = await prisma.annotation.findUnique({
        where: { id: annotationId }
      });

      if (annotation) {
        context = annotation.highlightedText;
      }
    }

    // Generate AI response
    const aiResponse = await generateAiResponse(question, context);

    // Save the conversation
    const conversation = await prisma.aiConversation.create({
      data: {
        paperId: paperId || '',
        annotationId: finalAnnotationId || null,
        userQuestion: question,
        aiResponse
      }
    });

    // If there's an annotation, also create a comment
    if (annotationId) {
      await prisma.comment.create({
        data: {
          annotationId,
          content: `Q: ${question}\n\nA: ${aiResponse}`,
          isAiResponse: true
        }
      });
    }

    res.json({
      response: aiResponse,
      conversationId: conversation.id
    });
  } catch (error) {
    console.error('Error processing AI request:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// Get AI conversation history for a paper
router.get('/conversations/:paperId', async (req, res) => {
  try {
    const { paperId } = req.params;

    const conversations = await prisma.aiConversation.findMany({
      where: { paperId },
      include: {
        annotation: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

export default router;