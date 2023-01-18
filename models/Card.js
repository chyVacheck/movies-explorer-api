const mongoose = require('mongoose');
const validator = require('validator');
// ? из констант
const { VALID_VALUES } = require('../utils/constants');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: VALID_VALUES.TEXT.LENGTH.MAX,
    minlength: VALID_VALUES.TEXT.LENGTH.MIN,
  },
  link: {
    type: String,
    validate: {
      validator(url) {
        return validator.isURL(url);
      },
      message: 'URL validation error',
    },
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'user',
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'user',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('card', cardSchema);
