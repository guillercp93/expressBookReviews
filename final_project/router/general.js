const express = require('express');
let books = require("./booksdb.js");
const isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user." });
  }

  if (isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }
  // Add the new user to the users array
  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

const getAsyncBooks = (type, keyword) =>
  new Promise((resolve, reject) => {
    let response = {};
    switch (type) {
      case "All":
        response = books;
        break;
      case "ISBN":
        if (books.hasOwnProperty(keyword)) {
          response = books[keyword];
        }
        break;
      default:
        for (const id in books) {
          if (!response.hasOwnProperty(id)) {
            if (books[id][type].toLowerCase().includes(keyword?.toLowerCase())) {
              response[id] = books[id];
            }
          }
        }
        break;
    }

    if (Object.keys(response).length === 0) {
      reject(new Error("No books found"));
    } else {
      resolve(response);
    }
  });

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await getAsyncBooks("All", "");
    return res.status(200).json({ books: response });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const book = await getAsyncBooks("ISBN", req.params.isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(400).json({ message: error.message || "An error occurred" });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const response = await getAsyncBooks("author", req.params.author);
    return res.status(200).json({ books: response });
  } catch (error) {
    return res.status(400).json({ message: error.message || "An error occurred" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const response = await getAsyncBooks("title", req.params.title);
    return res.status(200).json({ books: response });
  } catch (error) {
    return res.status(400).json({ message: error.message || "An error occurred" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  if (books.hasOwnProperty(req.params.isbn)) {
    const book = books[req.params.isbn];
    return res.status(200).json({ reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "The book doesn't exist" });
  }
});

module.exports.general = public_users;
