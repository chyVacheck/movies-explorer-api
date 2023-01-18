const winston = require('winston');
const expressWinston = require('express-winston');

// ? из constants
const { logFileNames } = require('../utils/constants');

const extension = '.log';

// ? объект со всеми возможными логами
const Logger = {
  // * создадим логгер запросов
  request: expressWinston.logger({
    transports: [
      new winston.transports.File({ filename: logFileNames.forLog + extension }),
    ],
    format: winston.format.json(),
  }),
  // * логгер ошибок
  error: expressWinston.errorLogger({
    transports: [
      new winston.transports.File({ filename: logFileNames.forError + extension }),
    ],
    format: winston.format.json(),
  }),

};

module.exports = { Logger };
