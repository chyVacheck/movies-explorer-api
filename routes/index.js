const router = require('express').Router();

// ! из default.json
const config = require('../config/default.json');

// * роутеры
const routerUsers = require('./users');
const routerMovie = require('./movie');
const routerAuth = require('./auth');

const { users } = require('../controllers/users');
// * свои
const { NotFound } = require('../utils/NotFound');
// ? middlewares
const auth = require('../middlewares/Auth');

const url = config.default_url;

router.use(`/${url}`, routerAuth); // ? регистрация/авторизация

router.use(auth); // ? проверка куков (авторизации)

router.use(`/${url}/users`, routerUsers); // ? все что связанно с пользователями
router.use(`/${url}/movies`, routerMovie); // ? все что связанно с фильмами
router.post(`/${url}/signout`, users.signOut); // ? выход из системы

router.use('*', NotFound); // ? выдаем 404 ошибку если нет такого слушателя

module.exports = router;
