const Campground = require("../models/campground"); // the campground exports model
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // contains 2 methods (forward and reverse geocode)
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({}); // get all campgrounds
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();

  // catch async will catch thrown error and will be sent to error handling middleware
  // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);

  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  // for each file object (f), it extracts the url and filename and stores that into array of objects
  campground.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  console.log(campground.images);
  campground.author = req.user._id; // used req.user from passport
  await campground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
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
  // we can access campground properties bc they're populated
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
  console.log(req.body.campground);
  console.log({ ...req.body.campground });
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  // spreading to not make array inside array instead just adding object to original array
  campground.images.push(...imgs);

  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    // pull (remove) from images array where filename of image is in req.body.deleteImages
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
  }
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect("/campgrounds");
};
