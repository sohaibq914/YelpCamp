const Campground = require("../models/campground"); // the campground exports model

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({}); // get all campgrounds
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  // catch async will catch thrown error and will be sent to error handling middleware
  // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);

  const campground = new Campground(req.body.campground);
  campground.author = req.user._id; // used req.user from passport
  await campground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
  next(e);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews", // populate the reviews
      populate: {
        path: "author", // populate the authors inside the reviews
      },
    })
    .populate("author"); // populate the author in campground
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds"); // by returning it exits the entire func
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds"); // by returning it exits the entire func
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect("/campgrounds");
};
