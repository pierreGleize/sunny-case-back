const mongoose = require("mongoose");

const articleSchema = mongoose.Schema({
  price: Number,
  name: String,
  product: String,
  description: String,
  images: [String],
  category: String,
});

const Articles = mongoose.model("articles", articleSchema);

module.exports = Articles;
