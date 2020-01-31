const express = require('express');
const connectToDB = require('./server/db/mongoose');
const user = require('./server/models/user');
const todo = require('./server/models/todos');

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

app.listen(PORT, console.log(`Server started at port: ${PORT}`));

module.exports = app;
