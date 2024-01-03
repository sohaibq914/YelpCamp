const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// adds a username and password field to the schema
// make sure the username is unique
// also gives additional methods we can use
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
