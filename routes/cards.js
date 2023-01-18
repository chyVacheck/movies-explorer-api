const routerCards = require('express').Router();
const { Joi, celebrate } = require('celebrate');
// ? из контроллеров
const { cards } = require('../controllers/cards');
// ? из констант
const { isThisURL, VALID_VALUES } = require('../utils/constants');

// * возвращает все карточки
routerCards.get('/', cards.getAll);

// * создаёт карточку
routerCards.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string()
      .required().min(VALID_VALUES.TEXT.LENGTH.MIN).max(VALID_VALUES.TEXT.LENGTH.MAX),
    link: Joi.string().required().custom(isThisURL),
  }),
}), cards.createOne);

// * удаляет карточку по идентификатору
routerCards.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(VALID_VALUES.ID_LENGTH),
  }),
}), cards.deleteOne);

// * поставить лайк карточке
routerCards.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(VALID_VALUES.ID_LENGTH),
  }),
}), cards.likeCard);

// * убрать лайк с карточки
routerCards.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(VALID_VALUES.ID_LENGTH),
  }),
}), cards.dislikeCard);

module.exports = routerCards;
