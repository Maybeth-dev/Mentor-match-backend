 import mongoose, { Document, Schema } from 'mongoose';
 
export interface IProfile {
  bio: string;
  skills: string[];
  interests: string[];
  experience: string;
  education: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

// User interface extending mongoose Document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'mentor' | 'mentee' | 'admin';
  profile: IProfile;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
 
const ProfileSchema = new Schema<IProfile>({
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  interests: [{ type: String }],
  experience: { type: String, default: '' },
  education: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  portfolioUrl: { type: String, default: '' }
}, { _id: false });

 
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: ['mentor', 'mentee', 'admin'],
    default: 'mentee',
    required: true
  },
  profile: {
    type: ProfileSchema,
    default: () => ({
      bio: '',
      skills: [],
      interests: [],
      experience: '',
      education: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: ''
    })
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Convert _id to string to prevent path-to-regexp errors,unlike b4
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
});

// Indexes for better performance
// Note:email index is already created by unique:true in schema
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

const User = mongoose.model<IUser>('User', UserSchema);

export default User;