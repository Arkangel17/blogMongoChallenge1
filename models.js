'use strict'

const mongoose = require('mongoose');
mongoose.promise = global.promise;


const authorSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  userName: {
    type: String,
    unique: true
  }
});

const commentSchema = mongoose.Schema({
  content: String
});

const blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'authors' },
  comments: [commentSchema]
});

blogSchema.pre('find', function(next) {
  this.populate('authors');
  next();
});

blogSchema.pre('findById', function(next) {
  this.populate('authors');
  next();
});

blogSchema.virtual('fullName').get(function() {
  return `${this.author.firstName}, ${this.author.lastName}`.trim();
});

blogSchema.methods.serialize = function() {
  let obj = {
    id: this._id,
    author: this.fullName,
    content: this.content,
    title: this.title,
    comments: this.comments
  };

  return obj;
};

const authors = mongoose.model("authors", authorSchema);
const blogposts = mongoose.model("blogposts", blogSchema);


module.exports = { authors, blogposts };