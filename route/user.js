const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../util/wrapAsync.js");
const passport = require("passport");
const { saveredircturl } = require("../middleware.js");
const { PostUser, LoginUser, LogoutUser } = require("../controllers/user.js");


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

//Logout logic
router.get("/logout", LogoutUser);
module.exports = router;
