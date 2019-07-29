const uuid = require('uuid');
const mongoose = require('mongoose');
const express = require('express');
const jsonparser = require('body-parser').json();
console.log(jsonparser);

// const bodyparser = express('bo')
mongoose.promise = global.promise;


const BlogSchema = mongoose.Schema({
  // created: uuid.v4(),
  title: String,
  body: String,
  comments: [ { body: String }],
  author: {
    firstName: String,
    lastName: String
  },
  meta: {
    votes: Number,
    favs: Number
  }
})

// BlogSchema.virtual('authorName').get(function() {
//   return `${this.author.firstName} ${this.author.lastName}`.trim();
// });

// BlogSchema.methods.serialize = function() {
//   return {
//     id: this._id,
//     author: this.authorName,
//     content: this.content,
//     title: this.title,
//     created: this.created
//   };
// };

let newBlog = mongoose.model("newBlog", BlogSchema);


module.exports = { newBlog };