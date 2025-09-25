# Notes App

A full-stack notes application built with Node.js and Express.js, demonstrating key concepts from the syllabus.

## Features

- User authentication (register/login)
- CRUD operations for notes
- Note categories
- Search functionality
- Responsive web interface with EJS templating
- RESTful API
- Error handling and middleware

## Syllabus Coverage

- **Node.js Fundamentals**: Modules (CommonJS), asynchronous programming, file handling
- **Error Handling**: Uncaught exceptions, async errors, debugging
- **Express.js**: RESTful APIs, routing, middleware, EJS templating

## Installation

1. Clone the repository
2. Run `npm install`
3. Start the server: `npm start`
4. Open http://localhost:3000

## Usage

1. Register a new account or login
2. Add, edit, and delete notes
3. Use search and category filters
4. Access the API at `/api/notes`

## Project Structure

- `server.js`: Main application file
- `routes/notes.js`: API routes for notes
- `data/notes.js`: In-memory data storage
- `views/`: EJS templates
- `public/`: Static files (CSS, JS)

## Future Enhancements

- Replace in-memory storage with MongoDB
- Add user profiles
- Implement note sharing
- Add file attachments

## Technologies Used

- Node.js
- Express.js
- EJS
- Express Session
- bcryptjs
