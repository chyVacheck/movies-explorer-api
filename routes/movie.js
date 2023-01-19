const routerMovie = require('express').Router();
const { celebrate, Joi } = require('celebrate');
// ? из контроллеров
const { movie } = require('../controllers/movie');
// ? из констант
const { isThisURL } = require('../utils/constants');

// * возвращает все карточки
routerMovie.get('/', movie.getMovies);

// * создаёт карточку
routerMovie.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(isThisURL),
    trailerLink: Joi.string().required().custom(isThisURL),
    thumbnail: Joi.string().required().custom(isThisURL),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), movie.createMovie);

// * удаляет карточку по идентификатору
routerMovie.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string(),
  }),
}), movie.deleteMovie);

module.exports = routerMovie;
