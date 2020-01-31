const express = require('express');
const connectToDB = require('./server/db/mongoose');
const user = require('./server/models/user');
const Todo = require('./server/models/todos');

connectToDB();

const app = express();

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.post('/todos', (req, res) => {
  //  const { text, completed, completedAt } = req.body;
  //Object.keys(req.body).length === 0
  //Object.entries(req.body).length === 0
  //req.body.constructor === Object
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ msg: 'Text Needed' });
  }

  let newTodo = new todo({
    text: req.body.text
  });

  newTodo
    .save()
    .then(resp => res.status(200).send(resp))
    .catch(e => res.send(e));
});

app.get('/todos', (req, res) => {
  Todo.find()
    .then(todos => res.send({ todos }))
    .catch(err => res.status(400).send(err));
});

app.get('/todos/:id', (req, res) => {
  Todo.findById(req.params.id)
    .then(todo => {
      if (!todo) return res.status(404).send({ msg: 'Todo not found' });
      res.status(200).send({ todo });
    })
    .catch(err => {
      if (err.kind == 'ObjectId')
        return res.status(404).send({ msg: 'ID is Invalid' });
      res.status(500).send({ msg: 'Unable to Process the Request' });
    });
});

app.listen(PORT, console.log(`Server started at port: ${PORT}`));

module.exports = app;
