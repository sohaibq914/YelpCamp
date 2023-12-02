const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground"); // the campground exports model

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true // no longer supported
});
// testing if db connects
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database connected");
});

// returns random item in array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({}); // delete all
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000); // 1000s cities
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`, // pass the desc and places arrays to sample
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
