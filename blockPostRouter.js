const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();

const jsonParser = bodyParser.json();
const { BlogPosts } = require("./models");


function random() {

    let movTitleArr = [ 'Machinist', '1984', 'Coherence', 'Matrix', 'Cube'];
    let movReviewArr = ['Awesome Pic', 'Kewl', 'Timeless', 'Mind-Blowing', 'Duuuude'];
    let movAuthorArr = [ 'Jon Snow', 'Tyrion Lannister', 'Bob Burger', 'Larry David', 'Charlie Ayo']

    let movTitle = movTitleArr[Math.floor(Math.random()*movTitleArr.length)]
    let movReview =  movReviewArr[Math.floor(Math.random()*movReviewArr.length)]
    let movAuthor =  movAuthorArr[Math.floor(Math.random()*movAuthorArr.length)]
  return {movTitle, movReview, movAuthor};
}

// seed some posts so initial GET requests will return something
BlogPosts.create(random().movTitle, random().movReview, random().movAuthor);
BlogPosts.create(random().movTitle, random().movReview, random().movAuthor);

// add endpoint for GET. It should call `BlogPosts.get()`
// and return JSON objects of stored blog posts.
// send back JSON representation of all blog posts
// on GET requests to root
router.get("/", (req, res) => {
  res.json(BlogPosts.get());
});


router.post("/", jsonParser, (req, res) => {
  const reqFields = ["title", "content", "author"];
  for (let i = 0; i < reqFields.length; i++) {
    const field = reqFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const item = BlogPosts.create(
    req.body.title,
    req.body.content,
    req.body.author
  );
  res.status(201).json(item);
});


router.put("/:id", jsonParser, (req, res) => {
  const reqFields = ["id", "title", "content", "author", "publishDate"];
  for (let i = 0; i < reqFields.length; i++) {
    const field = reqFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = `Request path id (${
      req.params.id
    }) and request body id ``(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating blog post with id \`${req.params.id}\``);
  BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate
  });
  res.status(204).end();
});


router.delete("/:id", (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted blog post with id \`${req.params.ID}\``);
  res.status(204).end();
});

module.exports = router;