const Listing = require("./models/listing");
const ExpressError = require("./util/expresserror.js");
const { listingSchema , reviewSchema } = require("./schema.js");
const Review = require("./models/review");

module.exports.validatelisting = (req,res,next)=>{
  let {error} = listingSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map(el=>el.message).join(",");
            throw new ExpressError(errMsg , 400);
        }else{
            next();
        }
}

module.exports.validateReview = (req,res,next)=>{
  let {error} = reviewSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map(el=>el.message).join(",");
            throw new ExpressError(errMsg , 400);
        }else{
            next();
        }
}

module.exports.isLoggedIn=(req,res,next)=>{
    req.session.redirectUrl = req.originalUrl;
    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }
    next();
}
module.exports.saveredircturl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner= async(req,res,next)=>{
    let {id} = req.params;
    let listingItem = await Listing.findById(id);
    if(!listingItem.owner.equals(res.locals.currentUser._id)){
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewAuthor= async(req,res,next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review){
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
