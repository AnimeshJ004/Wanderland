const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../util/wrapAsync.js");
const passport = require("passport");
const { saveredircturl } = require("../middleware.js");
const { PostUser, LoginUser, LogoutUser } = require("../controllers/user.js");
const { resendOTP, verifyOTP } = require("../controllers/otp.js");


//Signup form  & Signup logic
router.route("/signup")
.get((req, res) => {
    res.render("users/signup");
})
.post(wrapAsync(PostUser));

//Login form & Login logic
router.route("/login")
.get((req, res) => {
    res.render("users/login");
})
.post(saveredircturl, passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), LoginUser);

//OTP verification routes
router.route("/verify-otp")
.get((req, res) => {
    res.render("users/verify-otp");
})
.post(wrapAsync(verifyOTP));

//Resend OTP
router.get("/resend-otp", wrapAsync(resendOTP));

//Logout logic
router.get("/logout", LogoutUser);
module.exports = router;
