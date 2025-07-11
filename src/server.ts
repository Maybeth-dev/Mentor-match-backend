 import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:3000",
  "https://mentor-match-tau.vercel.app",
  "https://mentor-match-mystes-projects-9eb0432a.vercel.app",
  "https://mentor-match-git-main-mystes-projects-9eb0432a.vercel.app",
  "https://mentor-match-r34yrspcm-mystes-projects-9eb0432a.vercel.app"
];


 app.use(cors({
  origin:  origin: process.env.NODE_ENV === 'development' ? true : allowedOrigins,
  credentials: true,
  exposedHeaders: ['set-cookie']  
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

console.log('🛣️  Setting up routes...');

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    success:"true",
    message: 'mentorship-hub API is running!',
    data:{
       status:"OK",
      timestamp: new Date().toISOString()
    }
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'  
  });
});
 
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes mounted successfully!');
 
const startServer = async () => {
  try {
     
    await connectDB();
    console.log('🗃️  Database connected successfully!');

     
    app.use('*', (req: Request, res: Response) => {
      res.status(404).json({ message: 'Route not found' });
    });

     
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Global error handler:', err);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }); 

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};


startServer();

export default app;
 