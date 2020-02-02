const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');
const Todo = require('../../models/todos');
const User = require('../../models/user');
const config = require('../../config/config.json');

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
          .sign({ _id: userOneId, access: 'auth' }, config.SECRET)
          .toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: 'jen@gmail.com',
    password: 'userTwopass',
    tokens: [
      {
        access: 'auth',
        token: jwt
          .sign({ _id: userTwoId, access: 'auth' }, config.SECRET)
          .toString()
      }
    ]
  }
];

let todos = [
  { _id: new ObjectID(), text: 'Test todo one', _creator: userOneId },
  {
    _id: new ObjectID(),
    text: 'Test todo two',
    completed: true,
    completedAt: 333,
    _creator: userTwoId
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
