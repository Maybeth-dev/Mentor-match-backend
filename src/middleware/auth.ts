import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
): Response | void => {  // Updated return type
  try {
    const token = req.cookies.token || 
                 (req.headers.authorization?.startsWith('Bearer ') 
                  ? req.headers.authorization.substring(7) 
                  : null);
      //const token = req.cookies.token || (authHeader && authHeader.startsWith('Bearer ') 
      //     ? authHeader.substring(7) 
      //     : null);
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-fallback-secret-key'
    ) as { userId: string; email: string; role: string };

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Specific role middlewares
export const requireMentor = requireRole(['mentor']);
export const requireMentee = requireRole(['mentee']);
export const requireAdmin = requireRole(['admin']);
export const requireMentorOrAdmin = requireRole(['mentor', 'admin']);




// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import cookieParser from 'cookie-parser';
// app.use(cookieParser());

// // Extend Express Request interface to include user
// declare global {
//   namespace Express {
//     interface Request {
//       user: {
//         userId: string;
//         email: string;
//         role: string;
//       };
//     }
//   }
// }

// export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = req.cookies.token || (authHeader && authHeader.startsWith('Bearer ') 
//     ? authHeader.substring(7) 
//     : null);
//     // const token = authHeader && authHeader.startsWith('Bearer ') 
//     //   ? authHeader.substring(7) 
//     //   : null;
    
//     if (!token) {
//       res.status(401).json({ message: 'No token provided' });
//       return;
//     }

//     const decoded = jwt.verify(
//       token, 
//       process.env.JWT_SECRET || 'your-fallback-secret-key'
//     ) as { userId: string; email: string; role: string };

//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.error('Auth middleware error:', error);
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };
 
// export const requireRole = (roles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     if (!req.user) {
//       res.status(401).json({ message: 'Authentication required' });
//       return;
//     }

//     if (!roles.includes(req.user.role)) {
//       res.status(403).json({ message: 'Insufficient permissions' });
//       return;
//     }

//     next();
//   };
// };

// // Specific role middlewares
// export const requireMentor = requireRole(['mentor']);
// export const requireMentee = requireRole(['mentee']);
// export const requireAdmin = requireRole(['admin']);
// export const requireMentorOrAdmin = requireRole(['mentor', 'admin']);