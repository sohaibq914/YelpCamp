// if we are in development mode, then require dotenv
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  // useCreateIndex: true // no longer supported
});
// testing if db connects
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // absolute path, tell express where to find views

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); // configures Express.js to serve static files from the "public" directory
app.use(mongoSanitize());

const sessionConfig = {
  name: "session",
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, // for a bit of security so js can't access or change cookie
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // this is a week from now
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = ["https://stackpath.bootstrapcdn.com/", "https://api.tiles.mapbox.com/", "https://api.mapbox.com/", "https://kit.fontawesome.com/", "https://cdnjs.cloudflare.com/", "https://cdn.jsdelivr.net"];
const styleSrcUrls = ["https://kit-free.fontawesome.com/", "https://stackpath.bootstrapcdn.com/", "https://api.mapbox.com/", "https://api.tiles.mapbox.com/", "https://fonts.googleapis.com/", "https://use.fontawesome.com/", "https://cdn.jsdelivr.net"];
const connectSrcUrls = ["https://api.mapbox.com/", "https://a.tiles.mapbox.com/", "https://b.tiles.mapbox.com/", "https://events.mapbox.com/"];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: ["'self'", "blob:", "data:", "https://res.cloudinary.com/dozcgdyzr/", "https://images.unsplash.com/"],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // authenticate with local strategy

passport.serializeUser(User.serializeUser()); // how to store user in session
passport.deserializeUser(User.deserializeUser()); // how to unstore user in session

// runs on every request
app.use((req, res, next) => {
  res.locals.currentUser = req.user; // access to currentUser in ALL templates
  res.locals.success = req.flash("success"); // access to success message in ALL templates
  res.locals.error = req.flash("error"); // access to error message in ALL templates
  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

// will only run if nothing else has matched first
// for every request (.all) and for every path ("*")
app.all("*", (req, res, next) => {
  // passing to next() which will go error handler
  next(new ExpressError("Page Not Found"), 404);
});

// middleware error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
