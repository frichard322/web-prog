import express from 'express';
import { authVerification, adminVerification } from '../../middleware/authMiddleware.js';
import userRepository from '../../db/userRepo.js';
import eventRepository from '../../db/eventRepo.js';

const router = express.Router();

router.get('/register-form', authVerification, async (req, res) => {
  const options = {
    user: req.app.locals.user,
    error: undefined,
  };
  try {
    res.render('register-form', options);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/login-form', authVerification, async (req, res) => {
  const options = {
    user: req.app.locals.user,
    error: undefined,
  };
  try {
    res.render('login-form', options);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/admin-panel', adminVerification, async (req, res) => {
  const options = {
    user: req.app.locals.user,
    users: await userRepository.findAll(),
    events: await eventRepository.findAll({ organizersList: 0, photos: 0, tasks: 0 }),
    error: undefined,
  };
  try {
    res.render('admin-panel', options);
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
