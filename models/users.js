const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  address: String,
  postalCode: Number,
  city: String,
  phoneNumber: String,
});

const userSchema = mongoose.Schema({
  token: String,
  email: String,
  password: String,
  address: { type: addressSchema, default: {} },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
