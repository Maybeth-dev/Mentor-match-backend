import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  mentorId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: {
    rating: number;
    comment?: string;
  };
}

const SessionSchema = new Schema<ISession>({
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  menteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true, default: 60 },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
  },
}, { timestamps: true });

export default mongoose.model<ISession>('Session', SessionSchema);
// This code defines a Mongoose model for managing mentorship sessions in a MongoDB database.
// The `ISession` interface describes the structure of a session document, including fields for mentor and mentee IDs, scheduled time, duration, status, and optional feedback.