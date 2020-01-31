const exp = require('expect');
const request = require('supertest');

const app = require('../../server');
const Todo = require('../models/todos');
const User = require('../models/user');

beforeEach(done => {
  Todo.deleteMany({}).then(() => done());
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

        Todo.find()
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
            exp(res.length).toBe(0);
            done();
          })
          .catch(err => done(err));
      });
  });
});
