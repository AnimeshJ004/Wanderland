const User = require("../models/user.js");
const wrapAsync = require("../util/wrapAsync.js");
const { sendOTP } = require("../util/email.js");
const otpGenerator = require("otp-generator");

//Signup logic
module.exports.PostUser =async (req, res) => {
    try{
    let {username, email, password} = req.body;
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        req.flash("error", "Email is already registered");
        return res.redirect("/signup");
    }

    // Generate OTP first
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

   // Always require successful email sending before creating account
   try {
       // Try to send OTP email - this is mandatory
       await sendOTP(email, otp);

       // Only create user after email is successfully sent
       const newUser = new User({username, email, otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000)});
       const registered = await User.register(newUser, password);

       // Log OTP for development testing
       if (process.env.NODE_ENV !== 'production') {
           console.log(`\n=== DEVELOPMENT OTP ===`);
           console.log(`Email: ${email}`);
           console.log(`OTP: ${otp}`);
           console.log(`Expires: ${newUser.otpExpires}`);
           console.log(`=======================\n`);
       }

       // Store email in session for OTP verification
       req.session.pendingVerificationEmail = email;
       req.flash("success", "OTP sent to your email. Please verify to complete signup.");
       res.redirect("/verify-otp");
   } catch (emailError) {
       console.error('Email sending failed:', emailError);

       // In production (including Render), never create account if email fails
       req.flash("error", "Unable to send verification email. Please check your email address and try again.");
       res.redirect("/signup");
   }
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

//Login logic
module.exports.LoginUser = async (req, res) => {
    try {
        // Generate OTP for login verification
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        // Update user with new OTP
        req.user.otp = otp;
        req.user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await req.user.save();

        // Send OTP email
        await sendOTP(req.user.email, otp);

        // Log OTP for development testing
        if (process.env.NODE_ENV !== 'production') {
            console.log(`\n=== LOGIN OTP ===`);
            console.log(`Email: ${req.user.email}`);
            console.log(`OTP: ${otp}`);
            console.log(`Expires: ${req.user.otpExpires}`);
            console.log(`=================\n`);
        }

        // Set session flag for login verification
        req.session.pendingLoginVerification = true;
        req.session.pendingVerificationEmail = req.user.email;

        req.flash("success", "OTP sent to your email. Please verify to complete login.");
        res.redirect("/verify-otp");
    } catch (error) {
        console.error('Login OTP error:', error);
        req.flash("error", "Failed to send verification OTP. Please try again.");
        res.redirect("/login");
    }
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