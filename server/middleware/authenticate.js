const User = require('../models/user');

// receive token and send it with user if exists
const authenticate = (req, res, next) => {
  let token = req.header('x-auth');

  User.findByToken(token)
    .then(user => {
      if (!user) {
        return Promise.reject(); // runs the catch
      }
      req.user = user;
      req.token = token;
      next();
    })
    .catch(e => {
      return res.status(401).send(); // 401 Unauthorized
    });
};

module.exports = authenticate;
