require('dotenv').config();
const { MESSAGE, STATUS } = require('../utils/constants');

// ? объявление NODE_ENV
const { NODE_ENV } = process.env;

module.exports.handleErrors = (err, req, res, next) => {
  const { statusCode = STATUS.ERROR.SERVER, message } = err;

  res
    .status(statusCode)
    .send({
      message:
        statusCode === STATUS.ERROR.SERVER ? MESSAGE.ERROR.SERVER : message,
    });

  // включаем лимиты запросов только в продакшине
  if (NODE_ENV !== 'production') {
    console.log(16, err);
  }

  next();
};
