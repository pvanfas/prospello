import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  description: string;
  author: string;
  image?: string; // Made optional to match schema
  readonly createdAt: Date; // Marked as readonly
  readonly updatedAt: Date; // Marked as readonly
}

const blogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String,}, // store image URL or filename
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>('Blog', blogSchema);
