const router = require('express').Router();
// * роутеры
const routerUsers = require('./users');
const routerMovie = require('./movie');
const routerAuth = require('./auth');

const { users } = require('../controllers/users');
// * свои
const { NotFound } = require('../utils/NotFound');
// ? middlewares
const auth = require('../middlewares/Auth');

router.use(routerAuth); // ? регистрация/авторизация

router.use(auth); // ? проверка куков (авторизации)

router.use('/users', routerUsers); // ? все что связанно с пользователями
router.use('/movies', routerMovie); // ? все что связанно с фильмами
router.post('/signout', users.signOut); // ? выход из системы
router.use('*', NotFound); // ? выдаем 404 ошибку если нет такого слушателя

module.exports = router;
