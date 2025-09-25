// In-memory storage for notes
let notes = [];
let nextId = 1;

function getNextId() {
  return nextId++;
}

module.exports = { notes, getNextId };
