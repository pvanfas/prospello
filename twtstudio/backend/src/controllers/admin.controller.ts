import { Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export const adminLogin = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (
      username === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { role: 'admin', username },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        success: true,
        token,
        user: {
          role: "admin",
          username,
          isAdmin: true
        }
      });    }

    return res
      .status(401)
      .json({ success: false, message: 'Invalid credentials' });
  } catch (error:any) {
    console.error('Admin login error:', error);
    return res
      .status(500)
      .json({ success: false, message: error.message || 'Something went wrong' });  }
};
