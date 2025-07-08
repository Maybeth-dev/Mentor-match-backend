 import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorshipRequest extends Document {
  menteeId: mongoose.Schema.Types.ObjectId | any;
  mentorId: mongoose.Schema.Types.ObjectId | any;
  message: string;
  goals: string[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  respondedAt?: Date;
}

const MentorshipRequestSchema: Schema = new Schema({
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  goals: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
});

// Creating a compound index to prevent duplicate pending/accepted requests
MentorshipRequestSchema.index({ menteeId: 1, mentorId: 1, status: 1 });

export default mongoose.model<IMentorshipRequest>('MentorshipRequest', MentorshipRequestSchema);