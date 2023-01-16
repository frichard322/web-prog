export function authVerification(req, res, next) {
  req.app.locals.user = req.isAuthenticated() ? req.session.passport.user : undefined;
  next();
}

export function adminVerification(req, res, next) {
  req.app.locals.user = req.isAuthenticated() ? req.session.passport.user : undefined;
  if (!req.app.locals.user || req.app.locals.user.role !== 'admin') {
    const options = {
      user: req.app.locals.user,
      message: 'Unauthorized access!',
    };
    res.status(401).render('error', options);
  } else {
    next();
  }
}
