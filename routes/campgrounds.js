const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary"); // node looks for index.js by default
const upload = multer({ storage }); // saying multer to store image in cloudinary

const Campground = require("../models/campground"); // the campground exports model

// router.route to group routes
router
  .route("/")

  .get(catchAsync(campgrounds.index))
  // upload.array will parse the multi-part form and will store that to req.files
  // "image" corresponds to field name / name property on the form
  .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));

// new route NEEDS to be before show route because browser thinks "new" is :id so order DOES matter
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")

  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
