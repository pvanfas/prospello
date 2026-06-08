import { Request, Response } from 'express';
import Job from '../models/job.model';

const REQUIRED_FIELDS = [
  'title',
  'company',
  'location',
  'type',
  'salary',
  'department',
  'description',
  'requirements',
];

const validateFields = (body: any): string[] =>
  REQUIRED_FIELDS.filter((field) => !body[field]);

export const createJob = async (req: Request, res: Response) => {
  try {
    const missingFields = validateFields(req.body);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const job = await Job.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job,
    });
  } catch (err: any) {
    console.error('Job creation error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  }
};

export const getJobs = async (_req: Request, res: Response) => {
  try {
    const jobs = await Job.find();
    return res.json({ success: true, jobs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.json({ success: true, job });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const missingFields = validateFields(req.body);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    return res.json({
      success: true,
      message: 'Job updated successfully',
      job,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
