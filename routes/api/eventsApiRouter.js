import express from 'express';
import joi from 'joi';
import { unlinkSync } from 'fs';
import eventRepository from '../../db/eventRepo.js';
import { authVerification } from '../../middleware/authMiddleware.js';

const router = express.Router();

const eventSchema = joi.object().keys({
  name: joi.string().regex(/^[A-Za-z ]+$/),
  startTime: joi.string().regex(/^((2[0-3])|([0-1][0-9])):([0-5][0-9])$/),
  endTime: joi.string().regex(/^((2[0-3])|([0-1][0-9])):([0-5][0-9])$/),
  location: joi.string().regex(/^[A-Za-z ]+$/),
});

router.get('/event-listOfOrganizers', async (req, res) => {
  try {
    const options = {
      error: undefined,
      event: await eventRepository.findById(req.query.id, {
        _id: 0,
        name: 0,
        startTime: 0,
        endTime: 0,
        location: 0,
        photos: 0,
        tasks: 0,
      }),
    };
    res.json(options);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/create-event', authVerification, async (req, res) => {
  const options = {
    user: req.app.locals.user,
    error: (eventSchema.validate(req.fields).error)
      ? eventSchema.validate(req.fields).error.message : undefined,
  };
  if (options.error) {
    return res.status(404).render('event-form', options);
  }
  const startTime = req.fields.startTime.split(':', 2);
  const endTime = req.fields.endTime.split(':', 2);
  if (Number(startTime[0]) > Number(endTime[0])
    || (Number(startTime[0]) === Number(endTime[0]) && Number(startTime[1] >= Number(endTime[1])))
  ) {
    options.error = 'Start time must be earlier than end time!';
    return res.status(400).render('event-form', options);
  }
  const event = {
    ...req.fields,
    owner: options.user.name,
    organizersList: [],
    photos: [],
    tasks: [],
  };
  try {
    await eventRepository.create(event);
    return res.redirect('/');
  } catch (err) {
    options.error = err.message;
    return res.status(400).render('event-form', options);
  }
});

router.put('/check-event', authVerification, async (req, res) => {
  const event = await eventRepository.findById(req.fields.eventId);
  const options = {
    message: undefined,
    organizersList: '',
  };
  if (req.fields.action === 'Join') {
    event.organizersList.push(req.fields.userName);
    try {
      await eventRepository.update(event);
    } catch (err) {
      options.message = err;
      return res.status(500).json(options);
    }
    options.organizersList = event.organizersList.toString();
    options.message = `${req.fields.userName} has successfully joined ${event.name} event.`;
    return res.json(options);
  }
  // action === 'Leave'
  event.organizersList = event.organizersList.filter((e) => e !== req.fields.userName);
  try {
    await eventRepository.update(event);
  } catch (err) {
    options.message = err;
    return res.status(500).json(options);
  }
  options.organizersList = event.organizersList.toString();
  options.message = `${req.fields.userName} has left ${event.name} event.`;
  return res.json(options);
});

router.post('/upload-photo', authVerification, async (req, res) => {
  const fileHandler = req.files.uploader;
  const event = await eventRepository.findById(req.fields.eventId);
  let button;
  if (req.app.locals.user) {
    button = (!event.organizersList.includes(req.app.locals.user.name)) ? 'Join' : 'Leave';
  }
  const options = {
    user: req.app.locals.user,
    event,
    button,
    error: undefined,
  };
  if (fileHandler.name.length > 0) {
    const array = fileHandler.path.split('\\');
    event.photos.push(array[array.length - 1]);
    try {
      await eventRepository.update(event);
    } catch (err) {
      options.error = err;
      return res.status(500).render('event-details', options);
    }
    return res.render('event-details', options);
  }
  unlinkSync(fileHandler.path);
  options.error = 'First choose a photo to upload!';
  return res.status(500).render('event-details', options);
});

router.delete('/delete-event', authVerification, async (req, res) => {
  const event = await eventRepository.findById(req.query.eventId);
  const { user } = req.app.locals;
  if (user && (user.role === 'admin' || event.owner === user.name)) {
    try {
      const result = await eventRepository.delete(event._id);
      if (result) {
        res.status(204).send('OK');
      } else {
        res.status(401).send('ERROR');
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
});

router.delete('/delete-photos', authVerification, async (req, res) => {
  const event = await eventRepository.findById(req.query.eventId);
  const { user } = req.app.locals;
  if (user && (user.role === 'admin' || event.owner === user.name)) {
    try {
      const result = await eventRepository.deletePhotos(event._id, req.fields.photos);
      req.fields.photos.forEach((photo) => {
        unlinkSync(`uploads/${photo}`);
      });
      if (result) {
        res.status(204).send('OK');
      } else {
        res.status(401).send('ERROR');
      }
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(401).send('ERROR');
  }
});

router.post('/create-task', authVerification, async (req, res) => {
  const { user } = req.app.locals;
  if (user && user.role === 'admin') {
    try {
      const event = await eventRepository.findById(req.fields.eventId);
      const now = Date.now();
      event.tasks.push({
        name: req.fields.name,
        state: 'unsolved',
        addedAt: now,
        modifiedAt: now,
        closedAt: undefined,
        solvedBy: undefined,
        organizersList: [],
      });
      await eventRepository.update(event);
      res.status(204).send('OK');
    } catch (err) {
      res.status(500).send(err);
    }
  }
});

router.get('/task-stats', authVerification, async (req, res) => {
  const { user } = req.app.locals;
  let solved = 0;
  let unsolved = 0;
  if (user && user.role === 'admin') {
    try {
      (await eventRepository.findById(req.query.eventId)).tasks.forEach((task) => {
        if (task.state === 'solved') {
          solved += 1;
        } else {
          unsolved += 1;
        }
      });
      const data = { solved, unsolved };
      res.json(data);
    } catch (err) {
      res.status(500).send(err);
    }
  }
});

router.put('/leave-task', authVerification, async (req, res) => {
  const { user } = req.app.locals;
  const event = await eventRepository.findById(req.fields.eventId);
  if (user && event.organizersList.includes(user.name)) {
    try {
      const index = event.tasks.findIndex((task) => task.name === req.fields.taskName);
      if (index !== -1) {
        event.tasks[index].organizersList = event.tasks[index].organizersList
          .filter((organizer) => organizer.name === user.name);
        event.tasks[index].modifiedAt = Date.now();
        await eventRepository.update(event);
        res.status(204).send('OK');
      } else {
        res.status(404).send('ERROR');
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
});

router.put('/join-task', authVerification, async (req, res) => {
  const { user } = req.app.locals;
  const event = await eventRepository.findById(req.fields.eventId);
  if (user && event.organizersList.includes(user.name)) {
    try {
      const index = event.tasks.findIndex((task) => task.name === req.fields.taskName);
      if (index !== -1) {
        event.tasks[index].organizersList.push(user.name);
        event.tasks[index].modifiedAt = Date.now();
        await eventRepository.update(event);
        res.status(204).send('OK');
      } else {
        res.status(404).send('ERROR');
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
});

router.put('/solve-task', authVerification, async (req, res) => {
  const { user } = req.app.locals;
  const event = await eventRepository.findById(req.fields.eventId);
  if (user && event.organizersList.includes(user.name)) {
    try {
      const index = event.tasks.findIndex((task) => task.name === req.fields.taskName);
      if (index !== -1 && event.tasks[index].organizersList.includes(user.name) && event.tasks[index].state === 'unsolved') {
        event.tasks[index].state = 'solved';
        event.tasks[index].closedAt = Date.now();
        event.tasks[index].solvedBy = user.name;
        await eventRepository.update(event);
        res.status(204).send('OK');
      } else {
        res.status(404).send('ERROR');
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
});

export default router;
