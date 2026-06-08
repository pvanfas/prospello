import { Request, Response } from 'express';
import Blog from '../models/blog.model';

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, description, author, featuredImage } = req.body;
    if(!title || !description || !author){
        throw new Error("Title, description, and author are required fields.");
    }
    const blog = await Blog.create({ title, description, author, image:featuredImage });
    res.status(201).json({ success: true,message: 'Blog created successfully'});
  } catch (error:any) {
    res.status(500).json({ success:false,message:error.message ||'Failed to create blog',  });
  }
};

export const getAllBlogs = async (_req: Request, res: Response) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({success: true, blogs });
  } catch (error:any) {
    res.status(500).json({ success: false, message:error.message ||'Failed to fetch blogs' });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.status(200).json({ success: true,  blog });
  } catch (error:any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch blog' });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { title, description, author, featuredImage } = req.body;
    if(!title || !description || !author){
      throw new Error("Title, description, and author are required fields.");
  }
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, description, author, image:featuredImage },
      { new: true }
    );
    if (!blog) return res.status(404).json({success: false, message: 'Blog not found' });    res.status(200).json({ success: true, message: 'Blog updated successfully'});
  } catch (error:any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update blog' });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.status(200).json({success: true, message: 'Blog deleted successfully' });
  } catch (error:any) {
    res.status(500).json({ success: false, message:error.message ||'Failed to delete blog',  });
  }
};
