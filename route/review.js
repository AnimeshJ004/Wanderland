const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../util/WrapAsync.js");
const listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const { PostReview, DeleteReview } = require("../controllers/review.js");

//Review Route
//Post Route for reviews
router.post("/", validateReview, isLoggedIn ,wrapAsync(PostReview));
//Delete Route for reviews
router.delete("/:reviewId", isLoggedIn , isReviewAuthor ,wrapAsync(DeleteReview));
module.exports = router;