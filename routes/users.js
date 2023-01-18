const routerUsers = require('express').Router();
const { celebrate, Joi } = require('celebrate');
// ? из контроллеров
const { users } = require('../controllers/users');
// ? из констант
const { isThisURL, VALID_VALUES } = require('../utils/constants');

// * возвращает всех пользователей
routerUsers.get('/', users.getAll);

// * возвращает текущего пользователя
routerUsers.get('/me', users.getMe);

// * возвращает пользователя по _id
routerUsers.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(VALID_VALUES.ID_LENGTH),
  }),
}), users.getOne);

// * обновляет профиль
routerUsers.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(VALID_VALUES.TEXT.LENGTH.MIN).max(VALID_VALUES.TEXT.LENGTH.MAX),
    about: Joi.string().min(VALID_VALUES.TEXT.LENGTH.MIN).max(VALID_VALUES.TEXT.LENGTH.MAX),
  }),
}), users.setUserInfo);

// * обновляет аватар
routerUsers.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(isThisURL),
  }),
}), users.setUserAvatar);

module.exports = routerUsers;
