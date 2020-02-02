const exp = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const app = require('../../server');
const Todo = require('../models/todos');
const User = require('../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seeds');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('Post /todos', () => {
  it('should create a new todo', done => {
    let text = 'Testing todo Text';
    //...............
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text }) // send data
      .expect(200)
      .expect(res => {
        exp(res.body.text).toBe(text);
      })
      .end(err => {
        if (err) return done(err);

        Todo.find({ text })
          .then(todos => {
            exp(todos.length).toBe(1);
            exp(todos[0].text).toBe(text);
            done();
          })
          .catch(err => done(err));
      });
    //............
  });

  //2nd

  it('should not create new todo', done => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        Todo.find()
          .then(res => {
            exp(res.length).toBe(2);
            done();
          })
          .catch(err => done(err));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        exp(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return a todo', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`) // valid
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        exp(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return a todo by other users', done => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`) // valid
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if not found', done => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .expect(res => {
        exp(res.body.msg).toBe('Todo not found');
      })
      .end(done);
  });

  it('should return 404 for non-obj id', done => {
    request(app)
      .get('/todos/12')
      .set('x-auth', users[0].tokens[0].token)
      .expect(400)
      .expect(res => {
        exp(res.body.msg).toBe('ID is Invalid');
      })
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove and return the deleted todo', done => {
    let hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect(res => {
        exp(res.body.todo._id).toEqual(todos[1]._id);
      })
      .end(err => {
        if (err) done(err);

        Todo.findById(`${hexId}`)
          .then(todo => {
            exp(todo).toNotExist();
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not remove other users todo ', done => {
    let hexId = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(err => {
        if (err) done(err);

        Todo.findById(`${hexId}`)
          .then(todo => {
            exp(todo).toExist();
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should return 404 if todo not found', done => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .expect(res => {
        exp(res.body.msg).toBe('Todo not found');
      })
      .end(done);
  });

  it('should return 404 if objectId is invalid', done => {
    request(app)
      .delete(`/todos/123abc`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(400)
      .expect(res => {
        exp(res.body.msg).toBe('ID is Invalid');
      })
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    let text = 'some patch test text';
    let hexId = todos[0]._id.toHexString();
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect(res => {
        exp(res.body.todo.completed).toBe(true);
        exp(res.body.todo.text).toBe(text);
        exp(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it('should not update todo of other users', done => {
    let text = 'some patch test text';
    let hexId = todos[1]._id.toHexString();
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(404)
      .end(done);
  });

  it('should clear the completedAt when todo is not completed', done => {
    let text = 'some patch test text two';
    let hexId = todos[1]._id.toHexString();
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect(res => {
        exp(res.body.todo.completed).toBe(false);
        exp(res.body.todo.text).toBe(text);
        exp(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        exp(res.body._id).toBe(users[0]._id.toHexString());
        exp(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if user not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        exp(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('GET /users', () => {
  it('should create a user', done => {
    let email = 'test123@test.com';
    let password = '12345fsff';
    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(200)
      .expect(res => {
        exp(res.headers['x-auth']).toExist();
        exp(res.body.email).toBe(email);
        exp(res.body._id).toExist();
      })
      .end(err => {
        if (err) {
          return done(err);
        }
        User.findOne({ email })
          .then(user => {
            exp(user).toExist();
            exp(user.password).toNotBe(password);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should return validation error if email is invalid', done => {
    let email = 'abc';
    let password = '123';
    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', done => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'mnbvc1234'
      })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user with valid email and password', done => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => {
        exp(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) return done(err);

        User.findById(users[1]._id)
          .then(user => {
            exp(user.tokens[1]).toInclude({
              access: 'auth',
              token: res.header['x-auth']
            });
            done();
          })
          .catch(e => {
            done(e);
          });
      });
  });
  it('should not login credentials not match', done => {
    request(app)
      .post('/users/login')
      .send({
        email: 'notexist@not.com',
        password: 'unexist455'
      })
      .expect(400)
      .expect(res => {
        exp(res.headers['x-auth']).toNotExist();
      })
      .end(err => {
        if (err) return done(err);

        User.findById(users[1]._id)
          .then(user => {
            exp(user.tokens.length).toBe(1);
            done();
          })
          .catch(e => {
            done(e);
          });
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout ', done => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end(err => {
        if (err) done(err);

        User.findById(users[0]._id)
          .then(user => {
            exp(user.tokens.length).toBe(0);
            done();
          })
          .catch(err => done(err));
      });
  });
});
