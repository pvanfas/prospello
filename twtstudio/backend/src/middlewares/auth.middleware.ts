
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AdminTokenPayload {
    role: string;
    username: string;
    iat?: number;
    exp?: number;
}

export const verifyAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {


    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Missing or malformed auth token' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Missing auth token' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AdminTokenPayload;

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin only' });
        }

        // Attach admin info to the request object
        (req as any).admin = decoded;
        next();
    } catch (err) {
        console.error('JWT verification error:', err);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}

