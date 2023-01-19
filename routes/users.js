const routerUsers = require('express').Router();
const { celebrate, Joi } = require('celebrate');
// ? из контроллеров
const { users } = require('../controllers/users');

// * возвращает текущего пользователя
routerUsers.get('users/me', users.getMe);

// * обновляет профиль
routerUsers.patch('users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string(),
  }),
}), users.setUserInfo);

module.exports = routerUsers;
