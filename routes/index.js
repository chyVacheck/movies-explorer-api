const router = require('express').Router();
const routerUsers = require('./users');
const routerMovie = require('./movie');

router.use('/users', routerUsers);
router.use('/movie', routerMovie);

module.exports = router;
