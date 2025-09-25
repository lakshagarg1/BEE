const express = require('express');
const router = express.Router();
const { notes, getNextId } = require('../data/notes');

// Helper function to simulate async operation
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Middleware to check auth (assuming session)
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// GET /api/notes - Get all notes for user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    await delay(100);
    const userNotes = notes.filter(n => n.userId === req.session.userId);
    res.json(userNotes);
  } catch (error) {
    next(error);
  }
});

// GET /api/notes/:id - Get a single note
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    await delay(100);
    const note = notes.find(n => n.id === parseInt(req.params.id) && n.userId === req.session.userId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
});

// POST /api/notes - Create a new note
router.post('/', requireAuth, async (req, res, next) => {
  try {
    await delay(100);
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const newNote = {
      id: getNextId(),
      title,
      content,
      category: category || 'General',
      userId: req.session.userId,
      date: new Date().toISOString()
    };
    notes.push(newNote);
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
});

// PUT /api/notes/:id - Update a note
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    await delay(100);
    const { title, content, category } = req.body;
    const noteIndex = notes.findIndex(n => n.id === parseInt(req.params.id) && n.userId === req.session.userId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    notes[noteIndex] = {
      ...notes[noteIndex],
      title,
      content,
      category: category || notes[noteIndex].category,
      date: new Date().toISOString()
    };
    res.json(notes[noteIndex]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await delay(100);
    const noteIndex = notes.findIndex(n => n.id === parseInt(req.params.id) && n.userId === req.session.userId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    notes.splice(noteIndex, 1);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
