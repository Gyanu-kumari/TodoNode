const mongoose = require('mongoose');
const config = require('../config/config.json');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
};

mongoose.set('useFindAndModify', false);

const connectToDB = () => mongoose.connect(config.URI, options);

module.exports = connectToDB;
