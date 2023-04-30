const routerMovie = require('express').Router();
// ? из контроллеров
const { movie } = require('../controllers/movie');

// ? валидация
const { Validator } = require('../middlewares/Validation');

// * возвращает все карточки
routerMovie.get('/', movie.getMovies);

// * создаёт фильм
routerMovie.post('/', Validator.createMovie, movie.createMovie);

// * удаляет карточку по идентификатору
routerMovie.delete('/:movieId', Validator.deleteMovie, movie.deleteMovie);

module.exports = routerMovie;
