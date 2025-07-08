 import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import Session from '../models/Session';

const router = express.Router();
 
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { mentorId, scheduledAt, duration } = req.body;
    if (!mentorId || !scheduledAt) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const session = await Session.create({
      mentorId,
      menteeId: req.user.userId,
      scheduledAt,
      duration: duration || 30,
    });

    return res.status(201).json({ message: 'Session scheduled', session });
  } catch (err) {
    console.error('Schedule error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});
 
router.get('/mentee', authMiddleware, async (req: Request, res: Response): Promise<Response> => {
  try {
    const sessions = await Session.find({ menteeId: req.user.userId })
      .populate('mentorId', 'firstName lastName profile');
    return res.status(200).json({ sessions });
  } catch (err) {
    console.error('Error fetching mentee sessions:', err);
    return res.status(500).json({ message: 'Error fetching mentee sessions' });
  }
});
 
router.get('/mentor', authMiddleware, async (req: Request, res: Response): Promise<Response> => {
  try {
    const sessions = await Session.find({ mentorId: req.user.userId })
      .populate('menteeId', 'firstName lastName profile');
    return res.status(200).json({ sessions });
  } catch (err) {
    console.error('Error fetching mentor sessions:', err);
    return res.status(500).json({ message: 'Error fetching mentor sessions' });
  }
});
 
router.put('/:id/feedback', authMiddleware, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { rating, comment } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.menteeId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only mentee can leave feedback' });
    }

    session.feedback = { rating, comment };
    session.status = 'completed';
    await session.save();

    return res.status(200).json({ message: 'Feedback submitted', session });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    return res.status(500).json({ message: 'Error submitting feedback' });
  }
});

export default router;
