const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');
const Todo = require('../../models/todos');
const User = require('../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
  {
    _id: userOneId,
    email: 'johndoe@gmail.com',
    password: 'userOnepass',
    tokens: [
      {
        access: 'auth',
        token: jwt
          .sign({ _id: userOneId, access: 'auth' }, 'secret123')
          .toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: 'jen@gmail.com',
    password: 'userTwopass'
  }
];

let todos = [
  { _id: new ObjectID(), text: 'Test todo one' },
  {
    _id: new ObjectID(),
    text: 'Test todo two',
    completed: true,
    completedAt: 333
  }
];

const populateTodos = done => {
  Todo.deleteMany({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
};

const populateUsers = done => {
  User.deleteMany({})
    .then(() => {
      let userOne = new User(users[0]).save();
      let userTwo = new User(users[1]).save();

      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};
module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
};
