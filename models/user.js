const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"
    }]
});

userSchema.plugin(passportLocalMongoose); // adds username , hash and salt fields to store the username , the hashed password and the salt value
module.exports = mongoose.model("User" , userSchema);