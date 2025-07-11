 import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

const router = express.Router(); 

router.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Auth routes working!' });
});

// Register endpoint
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ 
        message: 'Please provide all required fields: email, password, firstName, lastName' 
      });
      return;
    }
 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
 
  
    const newUser: IUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'mentee',
      profile: {
        bio: '',
        skills: [],
        interests: [],
        experience: '',
        education: '',
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: ''
      }
    });

    const savedUser = await newUser.save();
 
    const token = jwt.sign(
      { 
        userId: savedUser._id,
        email: savedUser.email,
        role: savedUser.role 
      },
      process.env.JWT_SECRET || 'my-fallback-secret-key',
      { expiresIn: '7d' }
    );

        res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",  
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        profile: savedUser.profile
      }
    });


  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

   
    if (!email || !password) {
      res.status(400).json({ 
        message: 'Please provide both email and password' 
      });
      return;
    }
 
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
 
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
 
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-fallback-secret-key',
      { expiresIn: '7d' }
    );

    // // Return user data (excluding password)
    // res.status(200).json({
    //   message: 'Login successful',
    //   token,
    //   user: {
    //     id: user._id,
    //     email: user.email,
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     role: user.role,
    //     profile: user.profile
    //   }
    // });
     res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    .status(200)
      .json({
      message: 'Success',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });


    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profile: user.profile
      }
    });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });
    router.post('/logout', (_req, res) => {
  res.clearCookie('token').json({ message: 'Logged out' });
});


//  current userprofile ( a protected route)
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-fallback-secret-key'
    ) as { userId: string; email: string; role: string };

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
