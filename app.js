/* eslint-disable no-console */ // ? разрешаем писать console во всем файле
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { errors } = require('celebrate');
// * свои
const { NotFound } = require('./utils/NotFound');
// ? роутеры
const routerAuth = require('./routes/auth');
const router = require('./routes/main');

// ? middlewares
const { handleErrors } = require('./middlewares/HandleErrors');
// const { limiter } = require('./middlewares/Limiter');
const auth = require('./middlewares/Auth');
const { Logger } = require('./middlewares/Logger');

const { DEFAULT_VALUES } = require('./utils/constants');

// ? объявление порт`а
const { PORT = 3001 } = process.env;

const app = express();

// * CORS
app.use(cors(DEFAULT_VALUES.CORS_OPTIONS));

// * protection
app.use(helmet());

app.use(cookieParser());
app.use(express.json());

// * requests logger
app.use(Logger.request);

// app.use(limiter.simpleRequest);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

// * routes
app.use(routerAuth);
app.use(auth, router);
app.use('*', NotFound);

// ? errors logger
app.use(Logger.error);

// ? валидация ошибок
app.use(errors());
app.use(handleErrors);

async function start() {
  try {
    mongoose.set('strictQuery', true);
    // ? подключаемся к серверу mongo
    await mongoose.connect('mongodb://127.0.0.1:27017/mestodb');
    console.log('Сonnected to MongoDB');
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
