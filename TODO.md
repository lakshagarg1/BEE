# TODO: Fix the app changes

- [x] Fix data/notes.js: Export nextId as a number, not a function
- [ ] Fix server.js: Import nextId correctly and use it properly
- [ ] Add name and createdAt properties to user objects in server.js
- [ ] Fix views/profile.ejs: Use user.username instead of user.name, handle createdAt
- [ ] Pass user variable to all views that use layout.ejs in server.js
- [ ] Fix notes variable shadowing in server.js '/' route
- [ ] Fix link in views/profile.ejs from /notes to /
