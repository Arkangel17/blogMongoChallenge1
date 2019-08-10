'use strict'

const mongoose = require('mongoose');
mongoose.promise = global.promise;


const BlogSchema = mongoose.Schema({
  author: {
    firstName: String,
    lastName: String
  },
  title: {type: String, required: true},
  content: {type: String},
  created: {type: Date, default: Date.now}
});

BlogSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

BlogSchema.methods.serialize = function() {
  let obj = {
    id: this._id,
    author: this.authorName,
    content: this.content,
    title: this.title,
    created: this.created
  }

  let res = JSON.stringify(obj)
  console.log('res', res)

  return obj;
};

let newblogs = mongoose.model("newblogs", BlogSchema);


module.exports = { newblogs };