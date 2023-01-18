const jwt = require('jsonwebtoken');
const NotAuthorized = require('../errors/NotAuthorized');
// ? из констант
const { MESSAGE } = require('../utils/constants');

// ! из env
const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    next(new NotAuthorized(MESSAGE.ERROR.NOT_AUTHORIZED));
    return;
  }

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (error) {
    throw new NotAuthorized(MESSAGE.ERROR.NOT_AUTHORIZED);
  }

  req.user = payload;
  next();
};
