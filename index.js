import express from 'express';
import { join } from 'path';
import morgan from 'morgan';
import { existsSync, mkdirSync } from 'fs';
import cookieParser from 'cookie-parser';
import eformidable from 'express-formidable';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import config from './config/config.js';
import eventsApiRouter from './routes/api/eventsApiRouter.js';
import eventsViewRouter from './routes/view/eventsViewRouter.js';
import usersApiRouter from './routes/api/usersApiRouter.js';
import usersViewRouter from './routes/view/usersViewRouter.js';

const app = express();
const staticDir = join(process.cwd(), 'static');

const uploadDir = join(process.cwd(), 'uploads');
const { mongoUrl, mongoOptions } = config;

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

app.use(
  morgan('tiny'),
  express.static(staticDir),
  express.static(uploadDir),
  eformidable({ uploadDir }),
  cookieParser(),
  session({
    secret: config.secret_token,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl, mongoOptions }),
  }),
  passport.initialize(),
  passport.session(),
);
app.set('view engine', 'ejs');
app.set('views', join(process.cwd(), 'views'));

app.use('/view/user/', usersViewRouter);
app.use('/view/event/', eventsViewRouter);
app.use('/api/user/', usersApiRouter);
app.use('/api/event/', eventsApiRouter);
app.use(eventsViewRouter);

app.listen(8080, () => {
  console.log('Server has started listening on http://localhost:8080/.');
});
