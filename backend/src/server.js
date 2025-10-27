import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import threadRoutes from './routes/threadRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // frontend URL
  credentials: true, // allow cookies or auth headers if needed
}));

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/threads', threadRoutes);

// Health check
app.get('/', (req, res) => res.send('Forum API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

