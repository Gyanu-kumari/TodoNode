const mongoose = require('mongoose');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const connectToDB = () =>
  mongoose.connect('mongodb://localhost:27017/testTodo', options);

module.exports = connectToDB;
