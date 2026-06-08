import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from '../controllers/blog.controller';
import { verifyAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply middleware to all routes
router.post('/', verifyAdmin, createBlog);
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.put('/:id', verifyAdmin, updateBlog);
router.delete('/:id', verifyAdmin, deleteBlog);

export default router;
