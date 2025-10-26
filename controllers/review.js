
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


module.exports.PostReview = async (req, res) => {
    const foundListing = await Listing.findById(req.params.id); // model is listing
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    foundListing.reviews.push(newReview);
    await newReview.save();
    await foundListing.save();

    req.flash("success", "Review added successfully!");
    res.redirect(`/listings/${foundListing._id}`);
};

module.exports.DeleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
};
