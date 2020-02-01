const exp = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const app = require('../../server');
const Todo = require('../models/todos');
const User = require('../models/user');

let todos = [
  { _id: new ObjectID(), text: 'Test todo one' },
  { _id: new ObjectID(), text: 'Test todo two' }
];

beforeEach(done => {
  Todo.deleteMany({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
});

describe('Post /todos', () => {
  it('should create a new todo', done => {
    let text = 'Testing todo Text';
    //...............
    request(app)
      .post('/todos')
      .send({ text }) // send data
      .expect(200)
      .expect(res => {
        exp(res.body.text).toBe(text);
      })
      .end((err, res) => {
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
      .expect(200)
      .expect(res => {
        exp(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return a todo', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`) // valid
      .expect(200)
      .expect(res => {
        exp(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if not found', done => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .expect(res => {
        exp(res.body.msg).toBe('Todo not found');
      })
      .end(done);
  });

  it('should return 404 for non-obj id', done => {
    request(app)
      .get('/todos/12')
      .expect(400)
      .expect(res => {
        exp(res.body.msg).toBe('ID is Invalid');
      })
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should return the deleted todo', done => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        exp(res.body.todo._id).toEqual(todos[0]._id);
      })
      .end((err, res) => {
        if (err) done(err);

        Todo.findById(`${todos[0]._id.toHexString()}`)
          .then(todo => {
            exp(todo).toNotExist(todos[0]);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should return 404 if todo not found', done => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .expect(res => {
        exp(res.body.msg).toBe('Todo not found');
      })
      .end(done);
  });

  it('should return 404 if objectId is invalid', done => {
    request(app)
      .delete(`/todos/123abc`)
      .expect(400)
      .expect(res => {
        exp(res.body.msg).toBe('ID is Invalid');
      })
      .end(done);
  });
});
