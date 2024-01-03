module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // stores the url, user was trying to go to
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next(); // if already logged in
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};
