var express = require("express");
const User = require("../models/users");
const OrderHistories = require("../models/orderHistories");
var router = express.Router();

router.post("/addOrder", async (req, res) => {
  const { token, total, shipping, payment, cart } = req.body;

  if (!token || !total || !shipping || !payment || !cart) {
    return res.status(400).json({
      result: false,
      message: "Un ou plusieurs champs requis sont vides",
    });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res
        .status(404)
        .json({ result: false, message: "Utilisateur non trouvé" });
    }
    const newOrder = await new OrderHistories({
      user: user._id,
      date: new Date(),
      shipping,
      total,
      payment,
      cart,
      orderNumber: `ORD_${Date.now()}${Math.floor(Math.random() * 100)}`,
    }).save();

    const order = await OrderHistories.findOne({ _id: newOrder._id })
      .populate({
        path: "cart.article",
      })
      .populate({
        path: "user",
        select: "address",
      })
      .select("-__v");

    res.status(200).json({ result: true, order });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: `Un problème est survenue lors du paiement. ${error}`,
    });
  }
});

module.exports = router;
