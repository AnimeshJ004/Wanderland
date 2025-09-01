const User = require("../models/user.js");

//Signup logic
module.exports.PostUser =async (req, res) => {
    try{
    let {username, email, password} = req.body;
    const newUser =  new User({username, email});
   const registered = await User.register(newUser, password) // register method is added by passportLocalMongoose plugin to register a new user with given password
   req.login(registered , (err) => {  // login method is added by passport
       if(err){
        req.flash("error", err.message);
        return res.redirect("/signup");
       }
       req.flash("success", "Welcome to Wanderlust");
       res.redirect("/listings");
    });
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

//Login logic
module.exports.LoginUser = async (req, res) => {
    req.flash("success", "Welcome back!");
    // const redirectUrl = req.session.returnTo || "/listings";
    // delete req.session.returnTo;
    res.redirect(res.locals.redirectUrl || "/listings");
}
//Logout logic
module.exports.LogoutUser = (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            req.flash("error", "Logout failed");
            return res.redirect("/listings");
        }
        req.flash("success", "Logged you out!");
        res.redirect("/listings");
      });
}
