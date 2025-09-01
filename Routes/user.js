const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const WrapAsync = require("../Utils/WrapAsync.js");
const passport = require("passport");
const { saveredircturl } = require("../middleware.js");
const { PostUser, LoginUser, LogoutUser } = require("../controllers/user.js");


//Signup form  & Signup logic
router.route("/signup")
.get((req, res) => {
    res.render("users/signup");
})
.post(WrapAsync(PostUser));

//Login form & Login logic
router.route("/login")
.get((req, res) => {
    res.render("users/login.ejs");
})
.post(saveredircturl ,
    passport.authenticate("local",{failureRedirect:"login" , failureFlash: true}) ,
    WrapAsync(LoginUser));

//Logout logic
router.get("/logout", LogoutUser);
module.exports = router;