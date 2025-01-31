const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  const exists = users.find(u => u.username === username, false);

  return !!exists;
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  const exists = users.find(u => (u.username === username && u.password === password), false);

  return !!exists;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({
      data: username
    }, "access", { expiresIn: 3600 });

    req.session.authorization = {
      accessToken, username
    }

    return res.status(200).json({ message: "User successfully logged in" });
  }

  return res.status(208).json({ message: "Invalid Login. Check username and password" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if (books.hasOwnProperty(req.params.isbn)) {
    const book = books[req.params.isbn];
    book.reviews[req.user.data] = req.body.review;
    return res.status(200).json({ message: `Review added/updated to book with ISBN ${req.params.isbn}` });
  } else {
    return res.status(404).json({ message: "The book doesn't exist" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  if (books.hasOwnProperty(req.params.isbn)) {
    try {
      const book = books[req.params.isbn];
      delete book.reviews[req.user.data]
      return res.status(200).json({ message: `Review deleted to book with ISBN ${req.params.isbn}` });
    } catch (error) {
      return res.status(400).json({ message: "Unable to delete the review!" });
    }
  } else {
    return res.status(404).json({ message: "The book doesn't exist!" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
