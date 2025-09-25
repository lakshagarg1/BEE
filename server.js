const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const expressLayouts = require('express-ejs-layouts');
const { notes, getNextId } = require('./data/notes');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory users (replace with DB later)
const users = [
  {
    id: 1,
    username: 'testuser',
    name: 'Test User',
    email: 'testuser@example.com',
    password: '$2a$10$7QJ6Q9vQ9Q9Q9Q9Q9Q9QOeF1Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9', // bcrypt hash for 'testpass'
    createdAt: new Date('2023-01-01')
  }
];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Set view engine for EJS templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware to set default title and user for all views
app.use((req, res, next) => {
  res.locals.title = "My App";
  if (req.session.userId) {
    const user = users.find(u => u.id === req.session.userId);
    res.locals.user = user || null;
  } else {
    res.locals.user = null;
  }
  next();
});

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Routes
app.get('/', requireAuth, async (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  const userNotes = notes.filter(n => n.userId === req.session.userId);
  const search = req.query.search || '';
  const category = req.query.category || '';
  let filteredNotes = userNotes;
  if (search) {
    filteredNotes = filteredNotes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));
  }
  if (category) {
    filteredNotes = filteredNotes.filter(n => n.category === category);
  }
  const categories = [...new Set(userNotes.map(n => n.category))];
  res.render('index', { notes: filteredNotes, search, category, categories, username: user.username });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user.id;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  if (users.find(u => u.username === username)) {
    return res.render('register', { error: 'Username already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { 
    id: users.length + 1, 
    username, 
    name: username, 
    email, 
    password: hashedPassword, 
    createdAt: new Date() 
  };
  users.push(user);
  req.session.userId = user.id;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/add', requireAuth, (req, res) => {
  res.render('add');
});

app.post('/add', requireAuth, async (req, res) => {
  const { title, content, category } = req.body;
  const newNote = {
    id: getNextId(),
    title,
    content,
    category: category || 'General',
    userId: req.session.userId,
    date: new Date().toISOString()
  };
  notes.push(newNote);
  res.redirect('/');
});

app.get('/edit/:id', requireAuth, (req, res) => {
  const note = notes.find(n => n.id === parseInt(req.params.id) && n.userId === req.session.userId);
  if (!note) return res.status(404).send('Note not found');
  res.render('edit', { note });
});

app.post('/edit/:id', requireAuth, (req, res) => {
  const noteIndex = notes.findIndex(n => n.id === parseInt(req.params.id) && n.userId === req.session.userId);
  if (noteIndex === -1) return res.status(404).send('Note not found');
  const { title, content, category } = req.body;
  notes[noteIndex] = { ...notes[noteIndex], title, content, category };
  res.redirect('/');
});

app.post('/delete/:id', requireAuth, (req, res) => {
  const noteIndex = notes.findIndex(n => n.id === parseInt(req.params.id) && n.userId === req.session.userId);
  if (noteIndex !== -1) {
    notes.splice(noteIndex, 1);
  }
  res.redirect('/');
});

app.get('/about', (req, res) => {
  res.render('about');
});

// Profile page
app.get('/profile', requireAuth, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  if (!user) {
    return res.redirect('/login');
  }
  res.render('profile', { user });
});

app.post('/profile', requireAuth, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  if (!user) {
    return res.redirect('/login');
  }
  const { email } = req.body;
  if (!email) {
    return res.render('profile', { user, error: 'Email is required' });
  }
  user.email = email;
  res.render('profile', { user, message: 'Profile updated successfully' });
});

// Contact page
app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  // For now, just log it (in real app, send email)
  console.log(`Contact from ${name} (${email}): ${message}`);
  res.render('contact', { message: 'Thank you for your message!' });
});

// API routes
app.use('/api/notes', notesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
