const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    minlength: 5
  }
});

module.exports = User = mongoose.model('user', userSchema);
