import express from 'express';
import joi from 'joi';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import userRepository from '../../db/userRepo.js';
import { authVerification } from '../../middleware/authMiddleware.js';

const router = express.Router();

const userSchema = joi.object().keys({
  name: joi.string().regex(/^[A-Za-z ]+$/),
  password: joi.string(),
});

router.post('/register', authVerification, async (req, res) => {
  const options = {
    user: req.app.locals.user,
    error: (userSchema.validate(req.fields).error)
      ? userSchema.validate(req.fields).error.message : undefined,
  };
  if (options.error) {
    return res.status(400).render('register-form', options);
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.fields.password, salt);
  const userToCreate = { name: req.fields.name, password: hashPassword, role: 'organizer' };
  try {
    const result = await userRepository.create(userToCreate);
    req.login(result, (err) => {
      if (err) {
        throw err;
      }
    });
    return res.redirect('/');
  } catch (err) {
    options.error = err.message;
    return res.status(400).render('register-form', options);
  }
});

router.post('/login', authVerification, async (req, res) => {
  const options = {
    user: req.app.locals.user,
    error: (userSchema.validate(req.fields).error)
      ? userSchema.validate(req.fields).error.message : undefined,
  };
  if (options.error) {
    return res.status(400).render('login-form', options);
  }
  try {
    const userToFind = await userRepository.findOneByName(req.fields.name);
    if (!userToFind) {
      options.error = `${req.fields.name} hasn't been registered yet!`;
      return res.status(400).render('login-form', options);
    }
    const validPassword = await bcrypt.compare(req.fields.password, userToFind.password);
    if (!validPassword) {
      options.error = 'Password doesn\'t match the username!';
      return res.status(400).render('login-form', options);
    }
    req.login(userToFind, (err) => {
      if (err) {
        throw err;
      }
    });
    return res.redirect('/');
  } catch (err) {
    options.error = err.message;
    return res.status(400).render('login-form', options);
  }
});

router.get('/logout', async (req, res) => {
  req.logout();
  req.session.destroy();
  return res.redirect('/');
});

passport.serializeUser((user, done) => {
  const { _id, name, role } = user;
  done(null, { _id, name, role });
});

passport.deserializeUser(async (user, done) => {
  const result = await userRepository.findById(user._id);
  done(null, result);
});

router.put('/change-role', authVerification, async (req, res) => {
  const { user } = req.app.locals;
  if (user && user.role === 'admin') {
    try {
      let result;
      if (req.fields.role === 'admin' || req.fields.role === 'organizer') {
        result = await userRepository.setRole(req.fields.userId, req.fields.role);
      } else {
        res.status(400).send('ERROR');
      }
      if (result) {
        res.status(204).send('OK');
      } else {
        res.status(400).send('ERROR');
      }
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(401).send('ERROR');
  }
});

router.delete('/delete-user', authVerification, async (req, res) => {
  const { user } = req.app.locals;
  if (user && user.role === 'admin') {
    try {
      console.log(req.fields.userId);
      const result = await userRepository.delete(req.fields.userId);
      if (result) {
        res.status(204).send('OK');
      } else {
        res.status(400).send('ERROR');
      }
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(401).send('ERROR');
  }
});

export default router;
