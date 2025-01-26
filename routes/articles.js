var express = require("express");
var router = express.Router();
const Articles = require("../models/articles");
const { ObjectId } = require("mongodb");

router.get("/:category", async function (req, res) {
  const { category } = req.params;
  try {
    if (!category || category.trim().length === 0) {
      return res.status(400).json({
        result: false,
        message: "Category is required and cannot be empty",
      });
    }

    const articles = await Articles.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    });

    if (articles.length === 0) {
      return res.status(404).json({
        result: false,
        message: "No articles found for this category",
      });
    }
    res.status(200).json({ result: true, articles });
  } catch (error) {
    res
      .status(500)
      .json({ result: false, message: `${error}. Please again later` });
  }
});

router.get("/articleID/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        result: false,
        message: "Article ID is required and cannot be empty",
      });
    }
    const article = await Articles.findOne({ _id: id });
    if (article === null) {
      return res
        .status(404)
        .json({ result: false, message: "No article found for this ID" });
    }
    res.status(200).json({ result: true, article });
  } catch (error) {
    res
      .status(500)
      .json({ result: false, message: `${error}. Please again later` });
  }
});

router.get("/recommanded/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        result: false,
        message: "Article ID is required and cannot be empty",
      });
    }

    const article = await Articles.findOne({ _id: id });
    if (article === null) {
      return res
        .status(404)
        .json({ result: false, message: "No article found for this ID" });
    }

    const documents = await Articles.aggregate([
      { $match: { name: article.name, _id: { $ne: article._id } } },
      { $sample: { size: 4 } },
    ]);

    if (documents.length < 4) {
      const size = 4 - documents.length;

      const additionalDocuments = await Articles.aggregate([
        { $match: { category: article.category, _id: { $ne: article._id } } },
        { $sample: { size: size } },
      ]);

      if (additionalDocuments.length === 0) {
        return res.status(404).json({
          result: false,
          message: "No addional documents found for this category",
        });
      }

      for (let document of additionalDocuments) {
        documents.push(document);
      }
    }

    res.status(200).json({ result: true, documents });
  } catch (error) {
    res
      .status(500)
      .json({ result: false, message: `${error}. Please again later` });
  }
});

router.get("/alsoLiked/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        result: false,
        message: "Article ID is required and cannot be empty",
      });
    }

    const article = await Articles.findOne({ _id: id });

    if (article === null) {
      return res
        .status(404)
        .json({ result: false, message: "No article found for this ID" });
    }

    const documents = await Articles.aggregate([
      {
        $match: {
          _id: { $ne: article._id },
          name: { $ne: article.name },
          category: { $ne: article.category },
        },
      },
      { $sample: { size: 4 } },
    ]);

    if (documents.length < 4) {
      return res.status(404).json({
        result: false,
        message: "No recommanded articles found.",
      });
    }

    res.status(200).json({ result: true, documents });
  } catch (error) {
    res
      .status(500)
      .json({ result: false, message: `${error}. Please again later` });
  }
});

module.exports = router;
