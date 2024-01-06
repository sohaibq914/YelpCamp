const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground"); // the campground exports model

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
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
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000); // 1000s cities
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6594ed72edce692c0f22c763", // your user id
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`, // pass the desc and places arrays to sample
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam ex totam blanditiis illum fugiat perferendis quidem ut debitis voluptate modi, molestiae beatae optio sequi distinctio veniam consectetur et suscipit! Quod.",
      price, // short for price: price
      geometry: { type: "Point", coordinates: [cities[random1000].longitude, cities[random1000].latitude] },
      images: [
        {
          url: "https://res.cloudinary.com/dozcgdyzr/image/upload/v1704412373/YelpCamp/rzztxbr7txhvm3vlrhes.avif",
          filename: "YelpCamp/rzztxbr7txhvm3vlrhes",
        },
        {
          url: "https://res.cloudinary.com/dozcgdyzr/image/upload/v1704412374/YelpCamp/x8ztreqchfupc0cb9tyj.avif",
          filename: "YelpCamp/x8ztreqchfupc0cb9tyj",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
