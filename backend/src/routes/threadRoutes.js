import express from 'express';
import { createThread, getThreads } from '../controllers/threadController.js';

const router = express.Router();

router.post('/', createThread);
router.get('/', getThreads);

export default router;
