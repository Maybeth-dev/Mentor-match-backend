 import express, { Request, Response } from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /users/me- Get current user profile
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /users/me/profile -Update current user profile
router.put('/me/profile', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      bio, 
      skills, 
      interests, 
      experience, 
      education, 
      linkedinUrl, 
      githubUrl, 
      portfolioUrl 
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          'profile.bio': bio || '',
          'profile.skills': skills || [],
          'profile.interests': interests || [],
          'profile.experience': experience || '',
          'profile.education': education || '',
          'profile.linkedinUrl': linkedinUrl || '',
          'profile.githubUrl': githubUrl || '',
          'profile.portfolioUrl': portfolioUrl || ''
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/:id-Get user by ID (public profile)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users - Get all mentors (for mentee to browse)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, skills, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (role) filter.role = role;
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      filter['profile.skills'] = { $in: skillsArray };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await User.find(filter)
      .select('-password -email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);
    
    res.status(200).json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;