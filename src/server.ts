 import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/auth';
 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
 
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

console.log('🛣️  Setting up routes...');

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'mentorship-hub API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'  
  });
});
 
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes mounted successfully!');

// Initializing the database and start server
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


//  import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import connectDB from './config/database';
// import authRoutes from './routes/auth';

// // Load environment variables
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB
// connectDB();

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/auth', authRoutes);

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.status(200).json({ 
//     message: 'DSA Incubator Hub API is running!',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// // Global error handler
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error('Global error handler:', err);
//   res.status(500).json({ 
//     message: 'Internal server error',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
// });

// export default app;