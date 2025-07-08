import { Request, Response, NextFunction } from 'express';

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidMongoId = (id: string): boolean => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};
 
export const validateProfile = (req: Request, res: Response, next: NextFunction): void => {
  const { skills, interests, linkedinUrl, githubUrl, portfolioUrl } = req.body;
  
  const errors: string[] = [];
 
  if (skills && (!Array.isArray(skills) || skills.some(skill => typeof skill !== 'string'))) {
    errors.push('Skills must be an array of strings');
  }
 
  if (interests && (!Array.isArray(interests) || interests.some(interest => typeof interest !== 'string'))) {
    errors.push('Interests must be an array of strings');
  }
 
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  
  if (linkedinUrl && !urlRegex.test(linkedinUrl)) {
    errors.push('Invalid LinkedIn URL format');
  }
  
  if (githubUrl && !urlRegex.test(githubUrl)) {
    errors.push('Invalid GitHub URL format');
  }
  
  if (portfolioUrl && !urlRegex.test(portfolioUrl)) {
    errors.push('Invalid Portfolio URL format');
  }

  if (errors.length > 0) {
    res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
    return;
  }

  next();
};
 
export const validateMentorshipRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { mentorId, message, goals } = req.body;
  
  const errors: string[] = [];

  if (!mentorId || !isValidMongoId(mentorId)) {
    errors.push('Valid mentorId is required');
  }
 
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }

  if (message && message.length > 500) {
    errors.push('Message cannot exceed 500 characters');
  }
 
  if (goals && (!Array.isArray(goals) || goals.some(goal => typeof goal !== 'string'))) {
    errors.push('Goals must be an array of strings');
  }

  if (errors.length > 0) {
    res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
    return;
  }

  next();
};
 
export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password, firstName, lastName, role } = req.body;
  
  const errors: string[] = [];
  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }
 
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!firstName || firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (!lastName || lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

   
  if (role && !['mentee', 'mentor', 'admin'].includes(role)) {
    errors.push('Role must be either mentee, mentor, or admin');
  }

  if (errors.length > 0) {
    res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
    return;
  }

  next();
};

// Generic sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeString = (str: string): string => {
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
  };

 
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = sanitizeString(req.body[key]);
    }
  }

  next();
};