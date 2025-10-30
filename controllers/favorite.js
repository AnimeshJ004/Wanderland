const mongoose = require("mongoose");
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../util/wrapAsync.js");

// Add to favorites
module.exports.addToFavorites = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const listingId = new mongoose.Types.ObjectId(id);
    if (!user.favorites.some(fav => fav.equals(listingId))) {
        user.favorites.push(listingId);
        await user.save();
        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            return res.json({ success: true });
        }
        req.flash("success", "Added to favorites!");
    } else {
        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            return res.json({ success: true });
        }
        req.flash("info", "Already in favorites!");
    }
    res.redirect(req.headers.referer || "/listings");
});

// Remove from favorites
module.exports.removeFromFavorites = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const listingId = new mongoose.Types.ObjectId(id);
    user.favorites = user.favorites.filter(fav => !fav.equals(listingId));
    await user.save();
    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.json({ success: true });
    }
    req.flash("success", "Removed from favorites!");
    res.redirect(req.headers.referer || "/listings");
});

// Show favorites page
module.exports.showFavorites = wrapAsync(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('favorites');
    res.render("listing/favorites.ejs", { favorites: user.favorites });
});
