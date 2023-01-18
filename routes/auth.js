const routerAuth = require('express').Router();
const { Joi, celebrate } = require('celebrate');
const { users } = require('../controllers/users');
const { limiter } = require('../middlewares/Limiter');
// ? из констант
const { VALID_VALUES } = require('../utils/constants');

// * регистрация
routerAuth.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required()
      .min(VALID_VALUES.TEXT.LENGTH.MIN)
      .max(VALID_VALUES.TEXT.LENGTH.MAX),
    email: Joi.string().required().email().pattern(/^\S+@\S+\.\S+$/),
    password: Joi.string().required(),
  }),
}), limiter.createAccount, users.createOne);

// * авторизация
routerAuth.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({ tlds: { allow: false } }),
    password: Joi.string().required(),
  }),
}), users.login);

routerAuth.post('/signout', users.signOut);

module.exports = routerAuth;
