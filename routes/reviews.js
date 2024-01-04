const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams allows us to use :id as the prefix urls and use that in our routes
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const Campground = require("../models/campground"); // the campground exports model
const Review = require("../models/review");
const reviews = require("../controllers/reviews");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
