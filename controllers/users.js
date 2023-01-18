const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// * модель пользователя
const user = require('../models/User');
// ? из констант
const { MESSAGE, STATUS } = require('../utils/constants');

// * errors
const NotFoundError = require('../errors/NotFoundError');

// * jwt
const { NODE_ENV, JWT_SECRET } = process.env;

// * кастомные ошибки
const { BadRequestError, ConflictError } = require('../errors/AllErrors');

function setInfoError(err, next) {
  if ((err.name === 'ValidationError') || (err.name === 'CastError')) {
    next(new BadRequestError(MESSAGE.ERROR.BAD_REQUEST));
  } else {
    next(err);
  }
}

class Users { }
const users = new Users();

// * POST
// ? создает пользователя
users.createOne = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => user.create({
      name, email, password: hash,
    }))
    .then((data) => {
      res.status(STATUS.INFO.CREATED).send({
        message: MESSAGE.INFO.CREATED,
        data: {
          name: data.name,
          email: data.email,
          _id: data._id,
        },
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Incorrect data entered'));
      } else if (err.code === 11000) {
        next(new ConflictError(`You can not use this mail ${email} for registration, try another email`));
      } else {
        next(err);
      }
    });
};

// ? авторизоация пользователя
users.login = (req, res, next) => {
  const { email, password } = req.body;
  return user.findUserByCredentials(email, password)
    .then((data) => {
      const token = jwt.sign({ _id: data._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
      res.cookie('jwt', token, {
        expires: new Date(Date.now() + 12 * 3600000),
        httpOnly: true,
        sameSite: NODE_ENV === 'production' ? true : 'none',
        secure: NODE_ENV === 'production',
      });
      res.send({ message: 'User is authorized!' });
    })
    .catch((err) => {
      next(err);
    });
};

users.signOut = (req, res, next) => {
  res.clearCookie('jwt').send({ message: MESSAGE.INFO.LOGOUT })
    .catch(next);
};

// * GET
// ? возвращает текущего пользователя по _id
users.getMe = (req, res, next) => {
  user.findById(req.user._id)
    .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
    .then((userMe) => res.send({ data: userMe }))
    .catch(next);
};

// * PATCH
// ? устанавливает новое значение информации о пользователи
users.setUserInfo = (req, res, next) => {
  const { name, email } = req.body;

  user.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
    .then((newUser) => {
      res.status(STATUS.INFO.OK)
        .send({
          message: `INFO ${MESSAGE.INFO.PATCH}`,
          data: newUser,
        });
    })
    .catch((err) => setInfoError(err, next));
};

module.exports = { users };
