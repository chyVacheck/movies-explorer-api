const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const NotAuthorized = require('../errors/NotAuthorized');
// ? из констант
const { MESSAGE, VALID_VALUES } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 30,
    minlength: 2,
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
