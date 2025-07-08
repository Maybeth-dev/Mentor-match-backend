 import express, { Request, Response } from 'express'; 
import MentorshipRequest from '../models/mentorshipRequest';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// POST /requests - Create a new mentorship request (mentee sends to mentor)
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { mentorId, message, goals } = req.body;
 
    if (!mentorId || !message) {
      res.status(400).json({ 
        message: 'Please provide mentorId and message' 
      });
      return;
    }
 
    const existingRequest = await MentorshipRequest.findOne({
      menteeId: req.user.userId,
      mentorId: mentorId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      res.status(400).json({ 
        message: 'You already have a pending or active request with this mentor' 
      });
      return;
    }

    const newRequest = new MentorshipRequest({
      menteeId: req.user.userId,
      mentorId,
      message,
      goals: goals || [],
      status: 'pending'
    });

    const savedRequest = await newRequest.save();
    
    
    const populatedRequest = await MentorshipRequest.findById(savedRequest._id)
      .populate('menteeId', 'firstName lastName email profile')
      .populate('mentorId', 'firstName lastName email profile');

    res.status(201).json({
      message: 'Mentorship request sent successfully',
      request: populatedRequest
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /requests/sent- Get all requests sent by current user (mentee)
router.get('/sent', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await MentorshipRequest.find({ menteeId: req.user.userId })
      .populate('mentorId', 'firstName lastName email profile')
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /requests/received - Get all requests received by current user (mentor)
router.get('/received', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await MentorshipRequest.find({ mentorId: req.user.userId })
      .populate('menteeId', 'firstName lastName email profile')
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /requests/:id - Accept or reject a mentorship request
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    
    if (!['accepted', 'rejected'].includes(status)) {
      res.status(400).json({ 
        message: 'Status must be either "accepted" or "rejected"' 
      });
      return;
    }

    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    // It Checks if the current user is the mentor for this request
    if (request.mentorId.toString() !== req.user.userId) {
      res.status(403).json({ message: 'You can only respond to requests sent to you' });
      return;
    }

    // IT Checks if request is stilll pending
    if (request.status !== 'pending') {
      res.status(400).json({ message: 'Request has already been responded to' });
      return;
    }

    const updatedRequest = await MentorshipRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        respondedAt: new Date()
      },
      { new: true }
    ).populate('menteeId', 'firstName lastName email profile')
     .populate('mentorId', 'firstName lastName email profile');

    res.status(200).json({
      message: `Request ${status} successfully`,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /requests/:id - Get specific request details
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await MentorshipRequest.findById(req.params.id)
      .populate('menteeId', 'firstName lastName email profile')
      .populate('mentorId', 'firstName lastName email profile');

    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }
    
    const menteeIdStr = request.menteeId.toString();
    const mentorIdStr = request.mentorId.toString();
    
    if (menteeIdStr !== req.user.userId && mentorIdStr !== req.user.userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.status(200).json({ request });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;