const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({
  text: {
    type: String,
    required: true,
    minlength: 3,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: {
    required: true,
    type: Schema.Types.ObjectId
  }
});

module.exports = Todo = mongoose.model('todo', todoSchema);
