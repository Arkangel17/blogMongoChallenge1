const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const {
  newBlog
} = require("./models");


const app = express();

app.use(morgan("common"));
app.use(express.json());



app.get("/posts", (req, res) => {
  newBlog.find({})
    .then(post => {
      res.json(posts.map(posts => post.serialize()))
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'something\'s up'
      })
    })
})

app.get('/posts/:id', (req, res) => {
  newBlog.findById(req.params.id)
    .then(post =>
      res.json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'something\'s up'
      });
    })
})

app.post('/posts', (req, res) => {
  const reqFields = ["title", "content", "author"];
  for (let i = 0; i < reqFields.length; i++) {
    const field = reqFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  newBlog.create(
      req.body.title,
      req.body.content,
      req.body.author
    )
    .then(post => console.log("wtf",post))
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'something\'s up'
      })
    })
})


console.log('process.env.PORT', process.env.PORT)

app.listen(process.env.PORT || 8008, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8008}`);
});