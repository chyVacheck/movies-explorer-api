const routerAuth = require('express').Router();
const { users } = require('../controllers/users');
const { limiter } = require('../middlewares/Limiter');

// ? валидация
const { Validator } = require('../middlewares/Validation');

// * регистрация
routerAuth.post(
  '/signup',
  Validator.signup,
  limiter.createAccount,
  users.createOne,
);

// * авторизация
routerAuth.post(
  '/signin',
  Validator.signin,
  users.login,
);

module.exports = routerAuth;
