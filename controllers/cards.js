const { MESSAGE, STATUS } = require('../utils/constants');
const card = require('../models/Card');

// ? ошибки
const { BadRequestError, ForbiddenError, NotFoundError } = require('../errors/AllErrors');

// * создаем класс
class Cards { }

// * добавляем ему функции

// ? возвращает все карточки
Cards.getAll = (req, res, next) => {
  card.find({}).sort({ createdAt: -1 })
    .populate(['likes', 'owner'])
    .then((cards) => res.send(cards))
    .catch(next);
};

// ? создает карточку
Cards.createOne = (req, res, next) => {
  const { name, link } = req.body;
  card.create({ name, link, owner: req.user })
    .then((newCard) => res.status(STATUS.INFO.CREATED).send({ message: `CARD ${MESSAGE.INFO.CREATED}`, data: newCard }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(MESSAGE.ERROR.BAD_REQUEST));
      } else {
        next(err);
      }
    });
};

// ? удаляет карточку
Cards.deleteOne = (req, res, next) => {
  const userId = req.user._id;

  card.findById({ _id: req.params.cardId })
    .then((data) => {
      if (!data) {
        throw new NotFoundError(MESSAGE.ERROR.NOT_FOUND);
      }
      if (!data.owner.equals(userId)) {
        throw new ForbiddenError(MESSAGE.ERROR.FORBIDDEN);
      }
      return card.findByIdAndDelete({ _id: req.params.cardId })
        .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
        .then(() => {
          res.status(STATUS.INFO.OK).send({ message: MESSAGE.INFO.DELETE });
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(MESSAGE.ERROR.BAD_REQUEST));
      } else {
        next(err);
      }
    });
};

// ? добавляем лайк на карточке
Cards.likeCard = (req, res, next) => {
  card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
    .populate(['likes', 'owner'])
    .then((newCard) => {
      res.status(STATUS.INFO.OK).send(newCard);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(MESSAGE.ERROR.BAD_REQUEST));
      } else {
        next(err);
      }
    });
};

// ? убираем лайк на карточке
Cards.dislikeCard = (req, res, next) => {
  card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND))
    .populate(['likes', 'owner'])
    .then((newCard) => {
      res.status(STATUS.INFO.OK).send(newCard);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(MESSAGE.ERROR.BAD_REQUEST));
      } else {
        next(err);
      }
    });
};

const cards = new Cards();

module.exports = { cards };
