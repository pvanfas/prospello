import express from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from '../controllers/job.controller';
import { verifyAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// Secure all routes with verifyAdmin
router.post('/', verifyAdmin, createJob);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.put('/:id', verifyAdmin, updateJob);
router.delete('/:id', verifyAdmin, deleteJob);

export default router;
