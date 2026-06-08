import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | "Internship";
  salary: string;
  department: string;
  description: string;
  requirements: string;
}

const JobSchema: Schema = new Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    company: { type: String, required: true, maxlength: 100 },
    location: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
      required: true,
      index: true
    },
    salary: { type: Number, required: true, min: 0 },
    department: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    postedDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
export default mongoose.model<IJob>('Job', JobSchema);
