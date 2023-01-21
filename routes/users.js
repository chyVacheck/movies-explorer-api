const routerUsers = require('express').Router();
// ? из контроллеров
const { users } = require('../controllers/users');
// ? валидация
const { Validator } = require('../middlewares/Validation');

// * возвращает текущего пользователя
routerUsers.get('/me', users.getMe);

// * обновляет профиль
routerUsers.patch(
  '/me',
  Validator.updateUser,
  users.setUserInfo,
);

module.exports = routerUsers;
