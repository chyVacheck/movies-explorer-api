const routerMovie = require('express').Router();
const { celebrate, Joi } = require('celebrate');
// ? из контроллеров
const { movie } = require('../controllers/movie');
// ? из констант
const { isThisURL } = require('../utils/constants');

// * возвращает все карточки
routerMovie.get('/', movie.getMovies);

// todo доделать
// * создаёт карточку
routerMovie.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.number().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(isThisURL),
    trailerLink: Joi.string().required().custom(isThisURL),
    thumbnail: Joi.string().required().custom(isThisURL),
    movieId: Joi.string(), // todo разобраться с айди фильма
    nameRU: Joi.string().required(), // todo сделать кастомную проверку на русс имена
    nameEN: Joi.string().required(), // todo сделать кастомную проверку на англ имена
  }),
}), movie.createMovie);

// * удаляет карточку по идентификатору
routerMovie.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string(),
  }),
}), movie.deleteMovie);

module.exports = routerMovie;
