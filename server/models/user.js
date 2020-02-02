const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a vaild email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

userSchema.methods.toJSON = function() {
  let user = this;

  let userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

userSchema.methods.generateAuthToken = function() {
  let user = this;

  let access = 'auth';

  let token = jwt
    .sign({ _id: user._id.toHexString(), access }, 'secret123')
    .toString();

  user.tokens.push({ access, token });

  return user.save().then(() => token); //--
};

userSchema.statics.findByToken = function(token) {
  let User = this;

  let decoded;
  try {
    decoded = jwt.verify(token, 'secret123');
  } catch (e) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // });

    return Promise.reject();
  }
  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

userSchema.statics.findByCredentials = function(email, password) {
  let User = this;

  return User.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) resolve(user);
        else reject();
      });
    });
  });
};

userSchema.pre('save', function(next) {
  // --
  let user = this;

  if (user.isModified('password')) {
    //--
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

module.exports = User = mongoose.model('user', userSchema);
