 import express, { Request, Response } from 'express';
import User from '../models/User';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Get all users
router.get('/users', authMiddleware, requireAdmin, async (req: Request, res: Response): Promise<Response> => {
  try {
    const users = await User.find().select('-password');
    return res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

 
router.put('/users/:id/role', authMiddleware, requireAdmin, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { role } = req.body;

    if (!['mentor', 'mentee', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Role updated', user });
  } catch (err) {
    console.error('Error updating role:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
