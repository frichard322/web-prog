import express from 'express';
import eventRepository from '../../db/eventRepo.js';
import { authVerification } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authVerification, async (req, res) => {
  try {
    const options = {
      user: req.app.locals.user,
      events: await eventRepository.findAll({ organizersList: 0, photos: 0, tasks: 0 }),
    };
    return res.render('index', options);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/event-form', authVerification, async (req, res) => {
  try {
    const options = {
      user: req.app.locals.user,
      events: await eventRepository.findAll({ organizersList: 0, photos: 0, tasks: 0 }),
      error: undefined,
    };
    if (!options.user) {
      options.message = 'Unauthorized access!';
      return res.status(401).render('error', options);
    }
    return res.render('event-form', options);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/event-details', authVerification, async (req, res) => {
  try {
    const event = await eventRepository.findById(req.query.id);
    let button;
    if (req.app.locals.user) {
      button = (!event.organizersList.includes(req.app.locals.user.name)) ? 'Join' : 'Leave';
    }
    const options = {
      user: req.app.locals.user,
      events: await eventRepository.findAll({ organizersList: 0, photos: 0, tasks: 0 }),
      error: undefined,
      event,
      button,
      message: undefined,
    };
    if (options.event === null) {
      options.message = `There is no event with id ${req.query.id}!`;
      res.status(404).render('error', options);
    }
    return res.render('event-details', options);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/list-my-events', authVerification, async (req, res) => {
  try {
    let events = [];
    if (req.app.locals.user) {
      events = (await eventRepository.findAll())
        .filter((event) => event.organizersList.includes(req.app.locals.user.name)
          || event.owner === req.app.locals.user.name);
    }
    const options = {
      user: req.app.locals.user,
      events,
      error: undefined,
      message: undefined,
    };
    if (!options.user) {
      options.message = 'Unauthorized access!';
      return res.status(401).render('error', options);
    }
    return res.render('myevent-list', options);
  } catch (err) {
    return res.status(500).send(err);
  }
});

export default router;
