const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const { storeReturnTo } = require("../middleware");
const users = require("../controllers/users");

router
  .route("/register") // if user goes to /register

  .get(users.renderRegister) // renders the register form
  .post(catchAsync(users.register)); //

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session --- this is why we need storeReturnTo middleware
    // failureFlash creates flash with "error" key and error msg from passport which runs our middleware
    passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), // if authentication/login failed then go to /login
    users.login // if authentication/login passed, then go login where we redirect you to returnTo function
  );

router.get("/logout", users.logout);

module.exports = router;
