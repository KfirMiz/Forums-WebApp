import express from 'express';
import { createForum, getForums } from '../controllers/forumController.js';

const router = express.Router();

router.post('/', createForum);
router.get('/', getForums);

export default router;
