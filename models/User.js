const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const NotAuthorized = require('../errors/NotAuthorized');
// ? из констант
const { MESSAGE, DEFAULT_VALUES, VALID_VALUES } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: DEFAULT_VALUES.USER.NAME,
    maxlength: 30,
    minlength: 2,
  },
  about: {
    type: String,
    required: false,
    default: DEFAULT_VALUES.USER.ABOUT,
    maxlength: 30,
    minlength: 2,
  },
  avatar: {
    type: String,
    required: false,
    validate: {
      validator(url) {
        return validator.isURL(url);
      },
      message: MESSAGE.ERROR.URL,
    },
    default: DEFAULT_VALUES.USER.AVATAR,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: MESSAGE.ERROR.EMAIL,
    },
    minlength: VALID_VALUES.EMAIL.LENGTH.MIN,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

function findUserByCredentials(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new NotAuthorized(MESSAGE.ERROR.EMAIL_OR_PASS);
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new NotAuthorized(MESSAGE.ERROR.EMAIL_OR_PASS);
          }
          return user;
        });
    });
}

userSchema.statics.findUserByCredentials = findUserByCredentials;

module.exports = mongoose.model('user', userSchema);
