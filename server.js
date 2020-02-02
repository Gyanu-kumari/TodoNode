const express = require('express');
const _ = require('lodash');
const connectToDB = require('./server/db/mongoose');
const config = require('./server/config/config.json');
const User = require('./server/models/user');
const Todo = require('./server/models/todos');
const { ObjectID } = require('mongodb');
const authenticate = require('./server/middleware/authenticate');

connectToDB();

const app = express();

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || config.PORT;

app.post('/todos', authenticate, (req, res) => {
  //  const { text, completed, completedAt } = req.body;
  //Object.keys(req.body).length === 0
  //Object.entries(req.body).length === 0
  //req.body.constructor === Object
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ msg: 'Text Needed' });
  }

  let newTodo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  newTodo
    .save()
    .then(resp => res.status(200).send(resp))
    .catch(e => res.send(e));
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id })
    .then(todos => res.send({ todos }))
    .catch(err => res.status(400).send(err));
});

app.get('/todos/:id', authenticate, (req, res) => {
  Todo.findOne({ _id: req.params.id, _creator: req.user._id })
    .then(todo => {
      if (!todo) return res.status(404).send({ msg: 'Todo not found' });
      res.status(200).send({ todo });
    })
    .catch(err => {
      if (err.kind == 'ObjectId')
        return res.status(400).send({ msg: 'ID is Invalid' });
      res.status(500).send({ msg: 'Unable to Process the Request' });
    });
});

app.delete('/todos/:id', authenticate, (req, res) => {
  Todo.findOneAndDelete({ _id: req.params.id, _creator: req.user._id })
    .then(todo => {
      if (!todo) {
        return res.status(404).send({ msg: 'Todo not found' });
      }
      res.status(200).send({ todo }); // success
    })
    .catch(err => {
      if (err.kind == 'ObjectId')
        return res.status(404).send({ msg: 'ID is Invalid' });
      res.status(500).send({ msg: 'Unable tp process the request' });
    });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(400).send({ msg: 'ID is Invalid' });
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate(
    { _id: id, _creator: req.user._id },
    { $set: body },
    { new: true }
  )
    .then(todo => {
      if (!todo) return res.status(404).send({ msg: 'ID not found' });
      res.status(200).send({ todo });
    })
    .catch(e => {
      res.status(500).send({ msg: 'Unable to process the request' });
    });
});

app.post('/users', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let newUser = new User(body);

  newUser
    .save()
    .then(() => {
      return newUser.generateAuthToken(); // --
    })
    .then(token => res.header('x-auth', token).send(newUser))
    .catch(err => res.status(400).send(err));
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header('x-auth', token).send(user);
      });
    })
    .catch(err => {
      res.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => res.status(400).send()
  );
});

app.listen(PORT, console.log(`Server started at port: ${PORT}`));

module.exports = app;
