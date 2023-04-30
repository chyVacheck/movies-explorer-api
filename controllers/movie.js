const { MESSAGE, STATUS } = require('../utils/constants');
const modelsMovie = require('../models/Movie');

// ? ошибки
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../errors/AllErrors');

class Movie {}
const movie = new Movie();
// ?  возвращает все сохранённые текущим пользователем фильмы
movie.getMovies = (req, res, next) => {
  modelsMovie
    .find({ owner: req.user })
    .populate(['owner'])
    .then((movies) => res.send(movies))
    .catch(next);
};

// ? создаёт фильм с переданными в теле
// ? country, director, duration, year, description, image,
// ? trailer, nameRU, nameEN и thumbnail, movieId
movie.createMovie = (req, res, next) => {
  modelsMovie
    .create({ ...req.body, owner: req.user._id })
    .then((newMovie) =>
      res
        .status(STATUS.INFO.CREATED)
        .send({ message: `${MESSAGE.INFO.CREATED}`, data: newMovie }),
    )
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(MESSAGE.ERROR.BAD_REQUEST));
      } else {
        next(err);
      }
    });
};

// ? удаляет фильм
movie.deleteMovie = (req, res, next) => {
  const userId = req.user._id;

  // ? находим фильм
  modelsMovie
    .findById({ _id: req.params.movieId })
    .then((data) => {
      if (!data) {
        throw new NotFoundError(MESSAGE.ERROR.NOT_FOUND);
      }
      // ? если пользователь не владелец отправляем ошибку
      if (!data.owner.equals(userId)) {
        throw new ForbiddenError(MESSAGE.ERROR.FORBIDDEN);
      }
      return (
        modelsMovie
          .findByIdAndDelete({ _id: req.params.movieId })
          // по идее не должно использоваться
          .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
          .then(() => {
            res.status(STATUS.INFO.OK).send({ message: MESSAGE.INFO.DELETE });
          })
      );
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(MESSAGE.ERROR.BAD_REQUEST));
      } else {
        next(err);
      }
    });
};

module.exports = { movie };
