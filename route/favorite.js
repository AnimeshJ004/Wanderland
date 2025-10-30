const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const { addToFavorites, removeFromFavorites, showFavorites } = require("../controllers/favorite.js");

// Add to favorites
router.post("/:id/add", isLoggedIn, addToFavorites);

// Remove from favorites
router.post("/:id/remove", isLoggedIn, removeFromFavorites);

// Show favorites page
router.get("/", isLoggedIn, showFavorites);

module.exports = router;
