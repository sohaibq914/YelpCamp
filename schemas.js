const Joi = require("joi");

// validations on the server side (can't bypass even thru postman)
// not a mongoose schema... this will validate before saving it to mongoose

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(), // title is required
    price: Joi.number().required().min(0), // price is required and min is 0
    image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }).required(), // saying the campground is required
});
