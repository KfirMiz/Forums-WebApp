import { Thread } from '../models/Thread.js';

// Create thread
export const createThread = async (req, res) => {
  try {
    const thread = await Thread.create(req.body);
    res.status(201).json(thread);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all threads
export const getThreads = async (req, res) => {
  const threads = await Thread.find();
  res.json(threads);
};
