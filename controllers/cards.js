/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-unresolved */
const { MESSAGE, STATUS } = require('../utils/constants');
const card = require('../models/Card');

// ? ошибки
const { BadRequestError, ForbiddenError, NotFoundError } = require('../errors/AllErrors');

class Cards {
  // ? возвращает все карточки
  getAll(req, res, next) {
    card.find({}).sort({ createdAt: -1 })
      .populate(['likes', 'owner'])
      .then((cards) => res.send(cards))
      .catch(next);
  }

  // ? создает карточку
  createOne(req, res, next) {
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
  }

  // ? удаляет карточку
  deleteOne(req, res, next) {
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
  }

  // ? добавляем лайк на карточке
  likeCard(req, res, next) {
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
  }

  // ? убираем лайк на карточке
  dislikeCard(req, res, next) {
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
  }
}

const cards = new Cards();

module.exports = { cards };
