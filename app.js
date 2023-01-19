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
const router = require('./routes/index');

// ? middlewares
const { handleErrors } = require('./middlewares/HandleErrors');
const { limiter } = require('./middlewares/Limiter');
const auth = require('./middlewares/Auth');
const { Logger } = require('./middlewares/Logger');

// const { DEFAULT_VALUES } = require('./utils/constants');

// ? объявление порт`а
const { PORT = 3001, NODE_ENV, MONGO_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;

const app = express();

// * CORS
app.use(cors());
// app.use(cors(DEFAULT_VALUES.CORS_OPTIONS));

// * protection
app.use(helmet());

app.use(cookieParser());
app.use(express.json());

// * requests logger
app.use(Logger.request);

// включаем лимиты запросов только в продакшине
if (NODE_ENV === 'production') {
  app.use(limiter.simpleRequest);
}

// * routes
app.use(routerAuth); // ? регистрация/авторизация
app.use(auth, router); // ? проверка на авторизацию и все роутеры
app.use('*', NotFound); // ? выдаем 404 ошибку если нет такого слушателя

// ? errors logger
app.use(Logger.error);

// ? валидация ошибок
app.use(errors());
app.use(handleErrors);

async function start() {
  try {
    mongoose.set('strictQuery', true);
    // ? подключаемся к серверу mongo
    await mongoose.connect(MONGO_URL);
    console.log('Сonnected to MongoDB');
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
