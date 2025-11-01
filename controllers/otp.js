const User = require("../models/user.js");
const { sendOTP } = require("../util/email.js");
const otpGenerator = require("otp-generator");

// Resend OTP
module.exports.resendOTP = async (req, res) => {
    try {
        const email = req.session.pendingVerificationEmail;
        if (!email) {
            req.flash("error", "Session expired. Please sign up again.");
            return res.redirect("/signup");
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            req.flash("error", "User not found. Please sign up again.");
            return res.redirect("/signup");
        }

        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        await sendOTP(user.email, otp);

        // Log OTP for development testing
        if (process.env.NODE_ENV !== 'production') {
            console.log(`\n=== RESEND OTP ===`);
            console.log(`Email: ${user.email}`);
            console.log(`OTP: ${otp}`);
            console.log(`Expires: ${user.otpExpires}`);
            console.log(`==================\n`);
        }

        req.flash("success", "OTP resent to your email");
        res.redirect("/verify-otp");
    } catch (error) {
        console.error(error);
        req.flash("error", "Failed to resend OTP");
        res.redirect("/verify-otp");
    }
};

// Verify OTP
module.exports.verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log('=== VERIFY OTP DEBUG ===');
        console.log('Received OTP:', otp);
        console.log('Session email:', req.session.pendingVerificationEmail);
        console.log('Is login verification:', req.session.pendingLoginVerification);

        // Find user by email from session and matching OTP
        const email = req.session.pendingVerificationEmail;
        if (!email) {
            console.log('No email in session');
            req.flash("error", "Session expired. Please sign up or login again.");
            return res.redirect("/login");
        }

        const user = await User.findOne({
            email: email,
            otp: otp.trim(), // Trim whitespace
            otpExpires: { $gt: new Date() }
        });

        console.log('User found:', !!user);
        if (user) {
            console.log('User OTP in DB:', user.otp);
            console.log('OTP matches:', user.otp === otp.trim());
            console.log('OTP expired:', user.otpExpires <= new Date());
        }

        if (!user) {
            req.flash("error", "Invalid or expired OTP");
            return res.redirect("/verify-otp");
        }

        // Clear OTP fields
        user.otp = undefined;
        user.otpExpires = undefined;

        // If this is signup verification, mark as verified
        if (!req.session.pendingLoginVerification) {
            user.isVerified = true;
        }

        await user.save();

        // Clear session
        delete req.session.pendingVerificationEmail;
        delete req.session.pendingLoginVerification;

        req.login(user, (err) => {
            if (err) {
                console.log('Login error:', err);
                req.flash("error", err.message);
                return res.redirect("/verify-otp");
            }

            const successMessage = req.session.pendingLoginVerification ?
                "Login successful. Welcome back to WanderLand!" :
                "Email verified successfully. Welcome to WanderLand!";
            req.flash("success", successMessage);
            res.redirect(res.locals.redirectUrl || "/listings");
        });
    } catch (error) {
        console.error('Verification error:', error);
        req.flash("error", "Verification failed");
        res.redirect("/verify-otp");
    }
};
