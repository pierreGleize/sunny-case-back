var express = require("express");
var router = express.Router();
const User = require("../models/users");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const OrderHistories = require("../models/orderHistories");

// POST CREER UN COMPTE
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        result: false,
        message: "Un ou plusieurs champs requis sont vides.",
      });
    }
    const userAllReadyExist = await User.findOne({ email });

    if (userAllReadyExist) {
      return res
        .status(404)
        .json({ result: false, message: "Adresse email non disponible." });
    }

    const newuser = new User({
      email,
      password: bcrypt.hashSync(password, 10),
      token: uid2(32),
    });

    newuser.save().then((data) => {
      res.status(200).json({
        result: true,
        user: {
          email: data.email,
          token: data.token,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: `${error}. Veuillez réessayer plus tard`,
    });
  }
});

// POST SE CONNECTER
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        result: false,
        message: "Un ou plusieurs champs requis sont vides.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ result: false, message: "Adresse email introuvable." });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      res.status(404).json({
        result: false,
        message: "Votre mot de passe est incorrecte pour l'email fournit.",
      });
      return;
    }

    // Pour récupérer l'historique de tous les achats lors de la connexion
    const orderHistory = await OrderHistories.find({
      user: user._id,
    })
      .populate({
        path: "cart.article",
      })
      .populate({
        path: "user",
        select: "address",
      })
      .select("-__v");

    res.status(200).json({
      result: true,
      user: {
        email: user.email,
        token: user.token,
        cart: user.cart,
        address: user.address,
      },
      orderHistory,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: `${error}. Veuillez réessayer plus tard`,
    });
  }
});

// PUT METTRE A JOUR UNE ADRESSE
router.put("/address", async (req, res) => {
  const { firstname, lastname, address, postalCode, city, phoneNumber, token } =
    req.body;

  try {
    if (
      !firstname ||
      !lastname ||
      !address ||
      !postalCode ||
      !city ||
      !phoneNumber ||
      !token
    ) {
      return res.status(400).json({
        result: false,
        message: "Un ou plusieurs champs requis sont vides.",
      });
    }

    const user = await User.findOne({ token });

    if (!user) {
      return res
        .status(404)
        .json({ result: false, message: "Utilisateur introuvable" });
    }

    const newAddress = {
      firstname,
      lastname,
      address,
      postalCode,
      city,
      phoneNumber,
    };

    user.address = newAddress;

    const data = await user.save();
    res.status(200).json({ result: true, newAddress: data.address });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: `${error}. Veuillez reéessayer plus tard`,
    });
  }
});
module.exports = router;
