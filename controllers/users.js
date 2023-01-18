/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
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

class Users {
  // * POST
  // ? создает пользователя
  createOne(req, res, next) {
    console.log('try to create User');
    const {
      name, about, avatar, email, password,
    } = req.body;

    bcrypt.hash(password, 10)
      .then((hash) => user.create({
        name, about, avatar, email, password: hash,
      }))
      .then((data) => {
        console.log('data:', data);
        res.status(STATUS.INFO.CREATED).send({
          message: MESSAGE.INFO.CREATED,
          data: {
            name: data.name,
            about: data.about,
            avatar: data.avatar,
            email: data.email,
            _id: data._id,
          },
        });
      })
      .catch((err) => {
        console.log('err:', err);
        if (err.name === 'ValidationError') {
          next(new BadRequestError('Incorrect data entered'));
        } else if (err.code === 11000) {
          next(new ConflictError(`You can not use this mail ${email} for registration, try another email`));
        } else {
          next(err);
        }
      });
  }

  // ? авторизоация пользователя
  login(req, res, next) {
    console.log('login');

    const { email, password } = req.body;
    return user.findUserByCredentials(email, password)
      .then((data) => {
        console.log('data:', data);
        const token = jwt.sign({ _id: data._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
        res.cookie('jwt', token, {
          expires: new Date(Date.now() + 12 * 3600000),
          // todo убрать потом
          httpOnly: true,
          sameSite: 'None',
          secure: false,
        });
        res.send({ message: 'User is authorized!' });
      })
      .catch((err) => {
        console.log('error:', err);
        next(err);
      });
  }

  signOut(req, res, next) {
    res.clearCookie('jwt').send({ message: MESSAGE.INFO.LOGOUT })
      .catch(next);
  }

  // * GET
  // ? возвращает всех пользователей
  getAll(req, res, next) {
    user.find({})
      .then((users) => res.send(users))
      .catch(next);
  }

  // ? возвращает пользователя по _id
  getOne(req, res, next) {
    user.findById(req.params.userId)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          next(new BadRequestError(MESSAGE.ERROR.BAD_REQUEST));
        } else {
          next(err);
        }
      });
  }

  // ? возвращает текущего пользователя по _id
  getMe(req, res, next) {
    user.findById(req.user._id)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
      .then((userMe) => res.send({ data: userMe }))
      .catch(next);
  }

  // * PATCH
  // ? устанавливает новое значение информации о пользователи
  setUserInfo(req, res, next) {
    const { name, about } = req.body;

    user.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    )
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
      .then((newUser) => {
        res.status(STATUS.INFO.OK)
          .send({
            message: `INFO ${MESSAGE.INFO.PATCH}`,
            // eslint-disable-next-line object-shorthand
            data: newUser,
          });
      })
      .catch((err) => setInfoError(err, next));
  }

  // ? устанавливает новый аватар пользователя
  setUserAvatar(req, res, next) {
    const { avatar } = req.body;
    user.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    )
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
      .then((newUser) => {
        res.status(STATUS.INFO.OK).send({ message: `AVATAR ${MESSAGE.INFO.PATCH}`, data: newUser });
      })
      .catch((err) => setInfoError(err, next));
  }
}

const users = new Users();

module.exports = { users };
