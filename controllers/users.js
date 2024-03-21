const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// * модель пользователя
const user = require('../models/User');
// ? из констант
const { MESSAGE, STATUS } = require('../utils/constants');

// * errors
const NotFoundError = require('../errors/NotFoundError');

// ! из default.json
const config = require('../config/default.json');
// * jwt
const { NODE_ENV, JWT_SECRET = config.jwt_secret } = process.env;

// * кастомные ошибки
const { BadRequestError, ConflictError } = require('../errors/AllErrors');

class Users {}
const users = new Users();

// * POST
// ? создает пользователя
users.createOne = (req, res, next) => {
  const { name, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      user.create({
        name,
        email,
        password: hash,
      }),
    )
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
        next(new BadRequestError(MESSAGE.ERROR.INCORRECT_DATA));
      } else if (err.code === 11000) {
        next(new ConflictError(MESSAGE.ERROR.DUPLICATE));
      } else {
        next(err);
      }
    });
};

// ? авторизоация пользователя
users.login = (req, res, next) => {
  const { email, password } = req.body;
  return user
    .findUserByCredentials(email, password)
    .then((data) => {
      const token = jwt.sign({ _id: data._id }, JWT_SECRET);
      res.cookie('jwt', token, {
        expires: new Date(Date.now() + 12 * 3600000),
        httpOnly: true,
        sameSite: 'None',
        secure: true,
      });
      console.log(req.cookies);
      res.send({ message: MESSAGE.INFO.LOGIN });
    })
    .catch((err) => {
      next(err);
    });
};

users.signOut = (req, res) => {
  res.clearCookie('jwt').send({ message: MESSAGE.INFO.LOGOUT });
};

// * GET
// ? возвращает текущего пользователя по _id
users.getMe = (req, res, next) => {
  user
    .findById(req.user._id)
    .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
    .then((userMe) => res.send({ data: userMe }))
    .catch(next);
};

// * PATCH
// ? устанавливает новое значение информации о пользователи
users.setUserInfo = (req, res, next) => {
  const { name, email } = req.body;

  user
    .findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true },
    )
    .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
    .then((newUser) => {
      res.status(STATUS.INFO.OK).send({
        message: MESSAGE.INFO.PATCH,
        data: newUser,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(MESSAGE.ERROR.INCORRECT_DATA));
      } else if (err.code === 11000) {
        next(new ConflictError(MESSAGE.ERROR.DUPLICATE));
      } else {
        next(err);
      }
    });
};

module.exports = { users };
