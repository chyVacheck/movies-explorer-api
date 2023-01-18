const rateLimit = require('express-rate-limit');

// ? из constants
const { Limits } = require('../utils/constants');

const limiter = {
  simpleRequest: rateLimit({
    windowMs: Limits.time.forRequest,
    max: Limits.maxNumber.forRequest,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  createAccount: rateLimit({
    windowMs: Limits.time.forCreateNewAccount,
    max: Limits.maxNumber.forCreateNewAccount,
    message: Limits.message.forCreateNewAccount,
    standardHeaders: true,
    legacyHeaders: false,
  }),

};

module.exports = { limiter };
