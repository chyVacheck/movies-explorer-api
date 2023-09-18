require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { errors } = require('celebrate');
// ! из default.json
const config = require('./config/default.json');
// ? routers
const router = require('./routes/index');
// ? middlewares
const { handleErrors } = require('./middlewares/HandleErrors');
const { limiter } = require('./middlewares/Limiter');
const { Logger } = require('./middlewares/Logger');

const { DEFAULT_VALUES } = require('./utils/constants');

// ? объявление порт`а
const {
  PORT = config.port,
  CORS = config.cors,
  NODE_ENV,
  DB_ADRESS = config.adressdb,
} = process.env;

const app = express();

// * CORS
if (CORS) {
  console.log('Cors turn on');
  app.use(cors(DEFAULT_VALUES.CORS_OPTIONS));
} else {
  console.log('Cors turn off');
  app.use(cors());
}

// * protection
app.use(helmet());

app.use(cookieParser());
app.use(express.json());

// * requests logger
app.use(Logger.request);

// включаем лимиты запросов только в продакшине
if (NODE_ENV === 'production') {
  console.log('production');
  app.use(limiter.simpleRequest);
}

// * routes
app.use(router); // ? проверка на все роутеры

// ? errors logger
app.use(Logger.error);

// ? валидация ошибок
app.use(errors());
app.use(handleErrors);

async function start() {
  try {
    mongoose.set('strictQuery', true);
    // ? подключаемся к серверу mongo
    await mongoose.connect(DB_ADRESS);
    console.log('Connecting to MongoDB');
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
