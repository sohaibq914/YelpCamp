const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams allows us to use :id as the prefix urls and use that in our routes

const Campground = require("../models/campground"); // the campground exports model
const Review = require("../models/review");

const { reviewSchema } = require("../schemas.js");

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

const validateReview = (req, res, next) => {
  // req.body has rating and body
  const { error } = reviewSchema.validate(req.body); // checks the rating and body with joi review schema requirements
  console.log(error);
  if (error) {
    // getting the message of every error in object
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // get campground and delete item that has reviewId in reviews array
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
