const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;


const {
  newblogs
} = require('./models');

const {
  DATABASE_URL,
  PORT
} = require('./config')


const app = express();

app.use(morgan('common'));
app.use(express.json());



app.get('/postall', (req, res) => {
  newblogs
    .find()
    .then(posts => {
      res.json(posts.map(post =>
        post.serialize()
      ));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'something went terribly wrong'
      });
    });
});

app.get('/posts/:id', (req, res) => {
  newblogs.findById(req.params.id)
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
  const reqFields = ['title', 'content', 'author'];
  for (let i = 0; i < reqFields.length; i++) {
    const field = reqFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  newblogs.create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    })
    .then(newblogs => res.status(201).json(newblogs.serialize()))
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: 'something\'s up'
      })
    })
})

app.delete('/posts/:id', (req, res) => {
  newblogs
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
};

module.exports = {
  runServer,
  app,
  closeServer
}