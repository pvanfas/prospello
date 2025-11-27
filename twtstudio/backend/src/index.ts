import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import adminRoutes from './routes/admin.routes';
import blogRoutes from "./routes/blog.routes";
import jobRoutes from "./routes/job.routes";
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",");
console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use('/api', adminRoutes);
app.use('/api/blogs',blogRoutes);
app.use('/api/jobs', jobRoutes);



connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
