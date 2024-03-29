const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const {
  NotAuthorized,
  NotFoundError,
  BadRequestError,
} = require('../errors/AllErrors');
// ? из констант
const { MESSAGE, VALID_VALUES } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: VALID_VALUES.TEXT.LENGTH.MAX,
    minlength: VALID_VALUES.TEXT.LENGTH.MIN,
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
  return this.findOne({ email })
    .select('+password')
    .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
    .then((user) => {
      if (!user) {
        throw new NotAuthorized(MESSAGE.ERROR.EMAIL_OR_PASS);
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new BadRequestError(MESSAGE.ERROR.EMAIL_OR_PASS);
        }
        return user;
      });
    });
}

userSchema.statics.findUserByCredentials = findUserByCredentials;

module.exports = mongoose.model('user', userSchema);
