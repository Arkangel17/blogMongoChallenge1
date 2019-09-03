'use strict'

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;


const {
  authors,
  blogposts
} = require('./models');

const {
  DATABASE_URL,
  PORT
} = require('./config')


const app = express();

app.use(morgan('common'));
app.use(express.json());

app.get('/authors', (req, res) => {
  authors
    .find()
    .then(auths => res.json(auths.map(auth => {
      return {
        id: auth._id,
        name: `${auth.firstName}, ${auth.lastName}`,
        userName: auth.userName
      }
    })))
    .catch(err => {
      console.log(err);
      res.status(400).json({
        error: 'yall messed up'
      });
    })
})

app.get('/author', (req, res) => {
  authors
    .findOne()
    .then(auth =>
      res.json({
        id: auth._id,
        name: `${auth.firstName}, ${auth.lastName}`,
        userName: auth.userName
      }))
    .catch(err => {
      console.log(err);
      res.status(400).json({
        error: 'yall messed up'
      });
    });
})

app.post('/authors', (req, res) => {
  const reqFields = ['firstName', 'lastName', 'userName'];
  for (let i = 0; i < reqFields.length; i++) {
    const field = reqFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  authors
    .findOne({
      username: req.body.userName
    })
    .then(auth => {
      if (auth) {
        return res.status(400).json({
          err: 'userName taken'
        })
      } else {
        authors
          .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
          })
          .then(auth =>
            res.status(201).json({
              id: auth._id,
              name: `${auth.firstName}, ${auth.lastName}`,
              userName: auth.userName
            })
          )
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        err: 'error in creating author info'
      })
    })
})

//update author information
app.put('/author/:id', (req, res) => {

  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    return res.status(400).json({
      err: 'req.params.id !== req.body.id OR ID field missing'
    })
  }

  const newInfo = {};

  let userNames = Object.values(req.body);
  for (let field in req.body) {
    let bool = (field === 'userName' && userNames.includes(field.userName));
    if (bool) {
      res.status(400).json({
        err: 'username is unavailable'
      })
    }
    newInfo[field] = req.body[field];
  }

  authors
    .findOne({
      userName: newInfo.userName || '',
      _id: {
        $ne: req.params.id
      }
    })
    .then(name => {
      console.log('wtf!', name);
      if (name) {
        return res.status(400).json({
          err: 'username is taken'
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        err: 'somethings up with username matching'
      })
    })

  authors
    .findByIdAndUpdate(req.params.id, {
      $set: newInfo
    }, {
      new: true
    })
    .then(newInfo => {
      let obj = {
        id: newInfo.id,
        name: `${newInfo.firstName},${newInfo.lastName}`,
        userName: newInfo.userName
      };
      res.json(obj);
    })
    .catch(err => {
      console.log(err);
      res.status(400).json({
        error: 'yall messed up'
      });
    })
})


app.delete('/author/:id', (req, res) => {
  blogposts
    .remove({
      author: req.params.id
    })
    .then(() => {
      authors
        .findByIdAndRemove(req.params.id)
        .then(() => {
          console.log(`Deleted blog by author, ${req.params.userName}`);
        });
    });
  authors
    .findByIdAndDelete(req.params.id || req.params.userName)
    .then(() => {
      res.status(204).json({
        msg: 'went through'
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'something went wrong'
      });
    });
});


app.get('/postall', (req, res) => {
  blogposts
    .find()
    .then(async posts => {
      await res.json(posts.map( post => 
        {
          console.log(post);
          return post;
        }))
      })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'something went terribly wrong'
      });
    });
});

app.get('/posts/:id', (req, res) => {

  blogposts.findById(req.params.id)
    .then(post =>{
      console.log('post', post), 
      res.json({
        id: post._id,
        title: post.title,
        content: post.content,
        author: post.fullName,
        comments: post.comments
      })
    }             
    )
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'something\'s up'
      });
    })
})

app.post('/posts', (req, res) => {
  const reqFields = ['title', 'content', 'author'];
  for (let i = 0; i < reqFields.length; i++) {
    const field = reqFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  blogposts.create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    })
    .then(posts => res.status(201).json(posts.serialize()))
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'something\'s up'
      })
    })
})

app.delete('/posts/:id', (req, res) => {
  blogposts
    .findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).json({
        msg: 'went through'
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'something went wrong'
      })
    })
});


app.use('*', function (req, res) {
  res.status(404).json({
    message: 'Not Found'
  });
});

let server;

function runServer(databaseUrl, port = PORT) {
  let options;
  return new Promise((resolve, reject) => {
    options = {
      useNewUrlParser: true
    }
    mongoose.connect(databaseUrl, options, err => {
      if (err) {
        console.log('connection has not been made');
        return reject(err);
      }

      server = app.listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {
  runServer,
  app,
  closeServer
}