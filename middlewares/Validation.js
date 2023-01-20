const { Joi, celebrate } = require('celebrate');
const validator = require('validator');

// ? ошибки
const {
  BadRequestError,
} = require('../errors/AllErrors');

// ? из констант
const { MESSAGE, VALID_VALUES } = require('../utils/constants');

class Validator { }

Validator.isItUrl = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  }
  throw new BadRequestError(MESSAGE.ERROR.VALIDATION.URL);
};

Validator.updateUser = celebrate({
  body: Joi.object().keys({
    name:
      Joi.string()
        .required()
        .min(VALID_VALUES.TEXT.LENGTH.MIN)
        .max(VALID_VALUES.TEXT.LENGTH.MAX),
    email: Joi.string().required().email({ tlds: { allow: false } }),
  }),
});

Validator.createMovie = celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(Validator.isItUrl),
    trailerLink: Joi.string().required().custom(Validator.isItUrl),
    thumbnail: Joi.string().required().custom(Validator.isItUrl),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
});

Validator.deleteMovie = celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().hex().length(VALID_VALUES.ID_LENGTH),
  }),
});

Validator.signup = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().pattern(/^\S+@\S+\.\S+$/),
    name:
      Joi.string()
        .required()
        .min(VALID_VALUES.TEXT.LENGTH.MIN)
        .max(VALID_VALUES.TEXT.LENGTH.MAX),
    password: Joi.string().required(),
  }),
});

Validator.signin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({ tlds: { allow: false } }),
    password: Joi.string().required(),
  }),
});

module.exports = { Validator };
