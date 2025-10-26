import { Thread } from '../models/Thread.js';

export const createThread = async (req, res) => {
  try {
    const thread = new Thread({
      ...req.body,
      authorId: req.user.id,
    });
    await thread.save();
    res.status(201).json(thread);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getThreads = async (req, res) => {
  try {
    const threads = await Thread.find().sort({ creationTime: -1 });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getThreadById = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateThread = async (req, res) => {
  try {
    const { id } = req.params;
    const thread = await Thread.findById(id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });

    if (req.user.role !== 'admin' && req.user.id !== thread.authorId.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const { title, content, pictureUrl } = req.body;
    if (title) thread.title = title;
    if (content) thread.content = content;
    if (pictureUrl) thread.pictureUrl = pictureUrl;

    await thread.save();
    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteThread = async (req, res) => {
  try {
    const { id } = req.params;
    const thread = await Thread.findById(id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });

    if (req.user.role !== 'admin' && req.user.id !== thread.authorId.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await Thread.findByIdAndDelete(id);
    res.json({ message: 'Thread deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
