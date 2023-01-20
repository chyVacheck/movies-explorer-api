const jwt = require('jsonwebtoken');
const NotAuthorized = require('../errors/NotAuthorized');
// ? из констант
const { MESSAGE } = require('../utils/constants');

// ! из default.json
const config = require('../config/default.json');
// ! из env
const { JWT_SECRET = config.jwt_secret } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    next(new NotAuthorized(MESSAGE.ERROR.NOT_AUTHORIZED));
    return;
  }

  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new NotAuthorized(MESSAGE.ERROR.NOT_AUTHORIZED);
  }

  req.user = payload;
  next();
};
