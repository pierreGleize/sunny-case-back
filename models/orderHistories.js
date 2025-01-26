const mongoose = require("mongoose");

const orderHistories = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  date: { type: Date, default: new Date() },
  total: { type: Number, default: 0 },
  shipping: { type: String, default: "standard" },
  payment: { type: String, default: "Carte de crédit" },
  orderNumber: String,
  cart: [
    {
      article: { type: mongoose.Schema.Types.ObjectId, ref: "articles" },
      quantity: Number,
    },
  ],
});

const OrderHistories = mongoose.model("orderHistories", orderHistories);

module.exports = OrderHistories;
