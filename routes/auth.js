const routerAuth = require('express').Router();
const { Joi, celebrate } = require('celebrate');
const { users } = require('../controllers/users');
const { limiter } = require('../middlewares/Limiter');
// ? из констант
const { isThisURL, VALID_VALUES } = require('../utils/constants');

// * регистрация
routerAuth.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(VALID_VALUES.TEXT.LENGTH.MIN).max(VALID_VALUES.TEXT.LENGTH.MAX),
    about: Joi.string().min(VALID_VALUES.TEXT.LENGTH.MIN).max(VALID_VALUES.TEXT.LENGTH.MAX),
    avatar: Joi.string().custom(isThisURL),
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
