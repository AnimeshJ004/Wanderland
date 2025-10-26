const express = require("express");
const router = express.Router();
const { privacy, terms } = require("../controllers/general.js");

// Privacy Policy route
router.get("/privacy", privacy);

// Terms of Service route
router.get("/terms", terms);

module.exports = router;
